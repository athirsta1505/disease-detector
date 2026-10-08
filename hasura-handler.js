// AgriNova backend — handles:
//   1. /hasura/diagnose — leaf-photo disease diagnosis, called by Hasura Action (Gemini vision)
//   2. /api/chat        — agriculture chatbot, called DIRECTLY by chatbot.html (Gemini text)
//   3. /api/chat-image  — chatbot with photo attachment
//   4. /api/schemes     — government schemes list
//   5. /api/fertilizer  — fertilizer recommendation
//   6. /api/market-price — live Agmarknet mandi prices (data.gov.in) + Gemini fallback
//   7. /api/irrigation  — irrigation advisor (Open-Meteo weather + FAO-56 water balance + Gemini tips)
//   8. /api/irrigation/subscribe|unsubscribe|done|check + /api/push/public-key — real-time push alerts
//   9. /api/weather-alerts/subscribe|unsubscribe|check — weather page: daily weather message (sunny/cloudy/rain/heat),
//      max 5 messages/day: 4 water reminders + 1 rain alert (push + verified email)
//  10. /api/chats/* — chat history (Hasura tables chats + chat_messages), /api/health — status check
//
// IMPORTANT: Hasura Action webhooks only accept 2xx or 4xx status codes —
// a 500 makes Hasura report a generic "internal error". So /hasura/diagnose
// error paths return 400. /api/chat is called directly by the browser (not
// through Hasura) so it can use normal REST status codes.

require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json({ limit: '15mb' }));

// CORS: the chatbot page (served from a different origin, e.g. a local
// Live Server or another host) needs permission to call this backend.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.set('trust proxy', 1); // Render sits behind a proxy, needed for real client IPs

// Simple in-memory rate limit so nobody can burn your Gemini quota.
const _hits = new Map();
function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const k = req.ip + '|' + req.baseUrl + req.path;
    const now = Date.now();
    const h = (_hits.get(k) || []).filter(t => now - t < windowMs);
    if (h.length >= max) {
      return res.status(429).json({ error: { message: 'Too many requests. Please wait a minute and try again.' } });
    }
    h.push(now);
    _hits.set(k, h);
    next();
  };
}
setInterval(() => { const now = Date.now(); for (const [k, v] of _hits) if (!v.some(t => now - t < 120000)) _hits.delete(k); }, 5 * 60 * 1000);
app.use(['/api/chat', '/api/chat-image', '/api/fertilizer', '/api/market-price', '/api/irrigation'], rateLimit(30, 60 * 1000));
app.use('/api/weather-alerts/email', rateLimit(10, 60 * 1000));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// NOTE: if you set GEMINI_MODEL / GEMINI_FALLBACK_MODEL in Render > Environment, those override these defaults.
// Either delete them there, or set them to the same names as below.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
// Used only when the main model keeps answering "high demand" (503/429) or is unavailable (404).
const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.6-flash';

// Calls Gemini; retries busy errors / slow responses with a short wait, then tries the fallback model.
// A 404 (model no longer available) jumps straight to the fallback model.
// opts.fast = ask the model to skip "thinking" (MUCH faster for chat). If a model rejects that
// setting, the call is repeated without it. The whole call gives up after ~55 seconds.
async function geminiFetch(body, timeoutMs, opts = {}) {
  const busy = new Set([429, 500, 502, 503, 504]);
  const plan = [GEMINI_MODEL, GEMINI_MODEL, GEMINI_FALLBACK_MODEL, GEMINI_FALLBACK_MODEL]
    .filter((m, i, a) => m && (i < 2 || a[0] !== m));
  const deadline = Date.now() + (opts.totalMs || 55000);
  let thinkingOff = !!opts.fast;
  let firstData = null, firstStatus = 0;
  for (let i = 0; i < plan.length; i++) {
    const left = deadline - Date.now();
    if (left < 2000) break;
    const payload = thinkingOff
      ? Object.assign({}, body, { generationConfig: Object.assign({}, body.generationConfig || {}, { thinkingConfig: { thinkingBudget: 0 } }) })
      : body;
    let response, data = null;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${plan[i]}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(Math.min(timeoutMs || 30000, left))
        }
      );
      try { data = await response.json(); } catch (_) { data = {}; }
    } catch (netErr) {                                   // timeout / network problem -> try the next entry
      console.error(`Gemini ${plan[i]} did not answer:`, netErr.message);
      if (!firstData) { firstData = { error: { message: 'The AI service is slow right now. Please try again.' } }; firstStatus = 504; }
      continue;
    }
    if (response.ok) return { response, data };

    const msg = data && data.error && data.error.message;
    console.error(`Gemini ${plan[i]} failed (${response.status}):`, msg);
    // model does not accept the "no thinking" setting -> repeat the same call without it
    if (response.status === 400 && thinkingOff && /think|budget/i.test(msg || '')) { thinkingOff = false; i--; continue; }
    if (!firstData) { firstData = data; firstStatus = response.status; }

    // 404 = model not available -> skip to the fallback model; other non-busy errors (bad key etc.) stop here
    if (!busy.has(response.status) && response.status !== 404) break;
    if (response.status === 404) { while (i < plan.length - 1 && plan[i + 1] === plan[i]) i++; }
    else if (i < plan.length - 1) await new Promise(r => setTimeout(r, 500 * (i + 1)));
  }
  const err = new Error((firstData && firstData.error && firstData.error.message) || 'The AI service returned an error.');
  err.status = firstStatus;
  throw err;
}

// Joins all answer parts (ignores any "thought" parts) so a reply is never cut to its first piece.
function extractText(data) {
  const cand = data && data.candidates && data.candidates[0];
  const parts = cand && cand.content && cand.content.parts;
  const text = Array.isArray(parts) ? parts.filter(p => p && p.text && !p.thought).map(p => p.text).join('') : '';
  if (!text.trim()) {
    const block = data && data.promptFeedback && data.promptFeedback.blockReason;
    throw new Error(block ? 'That message could not be answered. Please rephrase and try again.' : 'No text came back from the model.');
  }
  return text;
}

async function callGemini(parts, maxTokens = 700, opts = {}) {
  const { data } = await geminiFetch({
    contents: [{ parts }],
    generationConfig: { maxOutputTokens: maxTokens }
  }, 60000, opts);
  return extractText(data);
}

// Chat call: real system instruction + real multi-turn history (more accurate, and fast: thinking off).
async function callGeminiChat({ system, contents, maxTokens = 1800 }) {
  const { data } = await geminiFetch({
    system_instruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.6 }
  }, 30000, { fast: true });
  return extractText(data);
}

// Short, farmer-friendly error text for the chat window.
function friendlyGeminiError(e) {
  const s = e && e.status;
  if (s === 429) return 'The AI is very busy right now. Please try again in a few seconds.';
  if (s === 500 || s === 502 || s === 503 || s === 504) return 'The AI service is busy or slow right now. Please try again in a moment.';
  if (s === 404) return 'The AI model is not available on the server. Please ask the app owner to update GEMINI_MODEL.';
  return (e && e.message) || 'The AI service returned an error.';
}

/* Gemini WITH Google Search grounding — reads today's prices from the web.
   (JSON mode can't be combined with search, so the caller parses the text.) */
async function callGeminiGrounded(parts, maxTokens = 1000) {
  const { data } = await geminiFetch({
    contents: [{ parts }],
    tools: [{ google_search: {} }],
    generationConfig: { maxOutputTokens: maxTokens }
  }, 30000);
  const cand = data.candidates && data.candidates[0];
  const text = cand && cand.content && cand.content.parts
    ? cand.content.parts.map(p => p.text || '').join('')
    : '';
  if (!text) throw new Error('No text came back from the search-grounded model.');
  return text;
}

/* ========================= DISEASE DIAGNOSIS (via Hasura) ========================= */
app.post('/hasura/diagnose', async (req, res) => {
  try {
    const { image, mediaType, prompt } = req.body.input || {};

    if (!image || !mediaType || !prompt) {
      return res.status(400).json({ message: 'Missing image, mediaType, or prompt.' });
    }
    if (!GEMINI_API_KEY) {
      return res.status(400).json({ message: 'Server is missing GEMINI_API_KEY.' });
    }

    let text;
    try {
      text = await callGemini([
        { text: prompt },
        { inline_data: { mime_type: mediaType, data: image } }
      ], 2500);
    } catch (e) {
      console.error('Gemini API error (diagnose):', e);
      return res.status(400).json({ message: e.message || 'The AI service returned an error.' });
    }

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) {
      return res.status(400).json({ message: 'Could not parse a result from the model.' });
    }

    const diag = JSON.parse(text.slice(start, end + 1));

    res.json({
      diseaseName: diag.diseaseName || 'Unidentified',
      latinName: diag.latinName || null,
      crop: diag.crop || 'Unidentified plant',
      status: diag.status || 'mild',
      confidence: typeof diag.confidence === 'number' ? diag.confidence : 0,
      severity: typeof diag.severity === 'number' ? diag.severity : 0,
      description: diag.description || '',
      actions: Array.isArray(diag.actions) ? diag.actions : [],
      note: diag.note || null
    });

  } catch (err) {
    console.error('Hasura diagnose handler crashed:', err);
    res.status(400).json({ message: 'Server error while running the diagnosis.' });
  }
});

/* ============================= CHATBOT (direct REST) ============================= */
// Called directly by chatbot.html — NOT through Hasura.
function languageRuleFor(lang) {
  if (lang === 'ta') return `Reply ENTIRELY in the Tamil language, in Tamil (தமிழ்) script only, whatever script the farmer typed in. Do not mix in English sentences and do not use Tanglish.`;
  if (lang === 'en') return `Reply ENTIRELY in plain English, whatever script the farmer typed in.`;
  return `Look ONLY at the farmer's latest message and copy its language STYLE exactly (ignore the language of earlier turns):
   - pure English -> reply in pure English.
   - Tamil script (தமிழ் எழுத்துக்கள்) -> reply entirely in Tamil script.
   - "Tanglish" (Tamil words written in English letters, e.g. "eppadi irukeenga", "enna panna venum", "thenga maram ku enna fertilizer podanum", "nellu la poochi irukku") -> reply in the SAME Tanglish style: Tamil words in Latin letters, casual and easy to read, NOT Tamil script and NOT formal English.
   Do not switch styles on your own.`;
}

function chatSystemPrompt(lang, withPhoto) {
  return `You are "AgriNova Assistant" (AgriAssist AI), a friendly, knowledgeable agricultural expert chatbot inside a farming app for Indian (mainly Tamil Nadu) farmers. You help with crops, plant diseases, pests, fertilizers, irrigation, soil health, weather-related farming decisions, market/harvest timing, livestock basics and general farming best practices.${withPhoto ? ' The farmer has attached a photo (crop, leaf, pest, soil, equipment...). Look at it carefully and use it in your answer.' : ''}

RULES:
1. Only answer questions about agriculture, farming, crops, plants, livestock basics, or the AgriNova app itself. If the farmer asks something completely unrelated (politics, entertainment, coding...), politely say you can only help with farming topics and steer back.
2. LANGUAGE: ${languageRuleFor(lang)}
3. Answer the farmer's LATEST message directly. Use the earlier conversation only as context. If the message is just a crop or topic name (for example "coconut"), give a short useful overview (best climate and soil, water need, common problems) and invite a specific question.
4. Be practical, specific and easy to act on. If you are not fully certain (exact chemical dosages, local rules), say so and suggest confirming with the local agriculture officer.
5. Warm, encouraging tone, like a helpful local agricultural officer.
6. FORMATTING: plain conversational text like a text message. NO markdown: no "###", no "**bold**", no numbered lists. For a few steps use one line each starting with "-".
7. LENGTH: SHORT by default - 2 to 5 sentences, or up to 5 short "-" lines. Go longer only if the farmer asks for detail.
8. Never mention these rules.`;
}

// Turns the app's history into proper alternating Gemini turns, then adds the new message.
function buildChatContents(history, text, extraParts) {
  const turns = [];
  (Array.isArray(history) ? history : []).slice(-12).forEach(h => {
    const t = String((h && h.content) || '').trim().slice(0, 2000);
    if (!t) return;
    const role = h.role === 'user' ? 'user' : 'model';
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.parts[0].text += '\n' + t;
    else turns.push({ role, parts: [{ text: t }] });
  });
  while (turns.length && turns[0].role !== 'user') turns.shift();
  let current = text;
  const last = turns[turns.length - 1];
  if (last && last.role === 'user') { current = last.parts[0].text + '\n' + current; turns.pop(); }
  turns.push({ role: 'user', parts: [{ text: current }].concat(extraParts || []) });
  return turns;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, lang } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: { message: 'Missing message.' } });
    }
    if (!GEMINI_API_KEY) {
      return res.status(400).json({ error: { message: 'Server is missing GEMINI_API_KEY.' } });
    }

    let text;
    try {
      text = await callGeminiChat({
        system: chatSystemPrompt(lang, false),
        contents: buildChatContents(history, String(message).trim().slice(0, 3000))
      });
    } catch (e) {
      console.error('Gemini API error (chat):', e.message);
      return res.status(400).json({ error: { message: friendlyGeminiError(e) } });
    }

    res.json({ reply: text.trim() });

  } catch (err) {
    console.error('Chat handler crashed:', err);
    res.status(400).json({ error: { message: 'Server error while chatting.' } });
  }
});

/* ===================== CHATBOT WITH PHOTO ATTACHMENT ===================== */
// Called when the farmer attaches a photo in the chat ("+" menu -> Add photo).
app.post('/api/chat-image', async (req, res) => {
  try {
    const { message, image, mediaType, history, lang } = req.body || {};

    if (!image || !mediaType) {
      return res.status(400).json({ error: { message: 'Missing image or mediaType.' } });
    }
    if (!GEMINI_API_KEY) {
      return res.status(400).json({ error: { message: 'Server is missing GEMINI_API_KEY.' } });
    }

    const userMessage = message && String(message).trim()
      ? String(message).trim().slice(0, 3000)
      : 'What can you tell me about this photo? (No specific question was given - describe what you see and anything relevant to a farmer.)';

    let text;
    try {
      text = await callGeminiChat({
        system: chatSystemPrompt(lang, true),
        contents: buildChatContents(history, userMessage, [{ inline_data: { mime_type: mediaType, data: image } }])
      });
    } catch (e) {
      console.error('Gemini API error (chat-image):', e.message);
      return res.status(400).json({ error: { message: friendlyGeminiError(e) } });
    }

    res.json({ reply: text.trim() });

  } catch (err) {
    console.error('Chat-image handler crashed:', err);
    res.status(400).json({ error: { message: 'Server error while analyzing the photo.' } });
  }
});

/* ===================== GOVERNMENT SCHEMES ===================== */
// FIXED: the page used to spin for a very long time because every cache miss waited for a slow
// Gemini call (up to a minute with retries). Now:
//   - fresh cache            -> answer instantly
//   - stale cache            -> answer instantly with the old list, refresh in the background
//   - no cache (cold start)  -> wait at most 12 seconds, then send a built-in basic list
//     while Gemini keeps working in the background (the next visitor gets the full list)
//   - the cache is also warmed when the server starts, so the first farmer rarely waits.
let schemesCache = { data: null, updatedAt: 0 };
const SCHEMES_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

const SCHEMES_PROMPT = `You are a research assistant helping Indian farmers. List CURRENT Indian government agricultural schemes relevant to farmers — covering Central Government schemes, Tamil Nadu state government schemes, and subsidy programs.

Return ONLY raw JSON (no markdown fences, no preamble) in exactly this shape:
{
  "schemes": [
    {
      "name": "scheme name",
      "benefits": "1-2 sentence summary of benefits",
      "eligibility": "1-2 sentence summary of who qualifies",
      "documents": "short comma-separated list of required documents",
      "link": "official government URL for this scheme",
      "category": "central" | "tamilnadu" | "subsidy"
    }
  ],
  "officialUpdates": [
    { "title": "short headline of a recent official announcement", "link": "official URL" }
  ]
}

Include 10 to 12 real, currently active schemes with accurate official links (e.g. pmkisan.gov.in, agriculture.tn.gov.in, myscheme.gov.in), covering a wide range of Central schemes, Tamil Nadu state schemes, and subsidy programs (irrigation, machinery, seeds, organic farming, livestock, fisheries, horticulture, etc.) — and 3 to 5 recent official updates. Keep every text field short. Only include schemes and links you are confident are real — never invent a scheme name or URL. If unsure of the exact page URL for a scheme, use "https://www.myscheme.gov.in" instead of guessing.`;

// Shown only when Gemini is too slow or unavailable, so the page is never empty.
const SCHEMES_FALLBACK = {
  schemes: [
    { name: 'PM-KISAN', category: 'central', benefits: 'Income support of Rs 6,000 per year in three instalments for farmer families.', eligibility: 'Landholding farmer families, subject to exclusion criteria.', documents: 'Aadhaar, land records, bank passbook', link: 'https://pmkisan.gov.in' },
    { name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', category: 'central', benefits: 'Crop insurance against yield loss from natural calamities, pests and diseases.', eligibility: 'Farmers growing notified crops in notified areas.', documents: 'Aadhaar, land records, bank passbook, sowing certificate', link: 'https://pmfby.gov.in' },
    { name: 'Kisan Credit Card (KCC)', category: 'central', benefits: 'Short-term credit for cultivation at concessional interest.', eligibility: 'Farmers, tenant farmers, sharecroppers and self-help groups.', documents: 'Aadhaar, land records, photo, bank form', link: 'https://www.myscheme.gov.in' },
    { name: 'PM Krishi Sinchayee Yojana (PMKSY)', category: 'subsidy', benefits: 'Subsidy for drip and sprinkler irrigation ("Per Drop More Crop").', eligibility: 'Farmers with own land and a water source.', documents: 'Aadhaar, land records, bank passbook', link: 'https://pmksy.gov.in' },
    { name: 'Soil Health Card Scheme', category: 'central', benefits: 'Free soil testing with crop-wise fertilizer recommendations.', eligibility: 'All farmers.', documents: 'Aadhaar, land details', link: 'https://soilhealth.dac.gov.in' },
    { name: 'e-NAM (National Agriculture Market)', category: 'central', benefits: 'Online trading platform to sell produce at better prices.', eligibility: 'Farmers registered with a connected mandi.', documents: 'Aadhaar, bank passbook, mobile number', link: 'https://enam.gov.in' },
    { name: 'Tamil Nadu Agriculture Department Schemes', category: 'tamilnadu', benefits: 'State subsidies for seeds, machinery, micro-irrigation and more.', eligibility: 'Tamil Nadu farmers; details vary by scheme.', documents: 'Aadhaar, chitta/adangal, bank passbook', link: 'https://www.tn.gov.in/department/2' }
  ],
  officialUpdates: [],
  grounded: false
};

// Large scheme lists sometimes get cut off mid-response (token limit hit
// mid-array). This tries a normal parse first, and if that fails, trims
// back to the last complete object and closes whatever brackets are still
// open — so the farmer sees a slightly shorter (but valid) list instead of
// a hard error.
function parseSchemesJson(text) {
  const start = text.indexOf('{');
  if (start === -1) throw new Error('No JSON object found in response.');
  const jsonStr = text.slice(start);

  const end = jsonStr.lastIndexOf('}');
  if (end !== -1) {
    try {
      return JSON.parse(jsonStr.slice(0, end + 1));
    } catch (e) { /* fall through to repair */ }
  }

  const lastCompleteObjEnd = Math.max(jsonStr.lastIndexOf('},'), jsonStr.lastIndexOf('}\n'), jsonStr.lastIndexOf('} '));
  if (lastCompleteObjEnd === -1) throw new Error('Could not parse schemes JSON.');

  let repaired = jsonStr.slice(0, lastCompleteObjEnd + 1);
  const openBraces = (repaired.match(/{/g) || []).length;
  const closeBraces = (repaired.match(/}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/\]/g) || []).length;

  let suffix = '';
  for (let i = 0; i < (openBrackets - closeBrackets); i++) suffix += ']';
  for (let i = 0; i < (openBraces - closeBraces); i++) suffix += '}';

  return JSON.parse(repaired + suffix);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchSchemesPlain() {
  // Retries once on transient errors (e.g. "model is currently experiencing
  // high demand"), since those usually succeed a moment later.
  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const text = await callGemini([{ text: SCHEMES_PROMPT }], 8000);
      const parsed = parseSchemesJson(text);
      if (!parsed || !Array.isArray(parsed.schemes) || !parsed.schemes.length) throw new Error('Model returned no schemes.');
      parsed.grounded = false;
      return parsed;
    } catch (e) {
      lastErr = e;
      console.error(`Schemes fetch attempt ${attempt} failed:`, e.message);
      if (attempt < 2) await sleep(2000);
    }
  }
  throw lastErr;
}

// Only one Gemini call at a time, even if many farmers open the page together.
let schemesInflight = null;
function refreshSchemes() {
  if (schemesInflight) return schemesInflight;
  schemesInflight = fetchSchemesPlain()
    .then(p => {
      p.lastUpdated = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
      schemesCache = { data: p, updatedAt: Date.now() };
      return p;
    })
    .finally(() => { schemesInflight = null; });
  return schemesInflight;
}

app.get('/api/schemes', async (req, res) => {
  try {
    const age = Date.now() - schemesCache.updatedAt;
    if (schemesCache.data && age < SCHEMES_CACHE_TTL) return res.json(schemesCache.data);

    if (schemesCache.data) {                       // stale: answer now, refresh in the background
      refreshSchemes().catch(e => console.error('Background schemes refresh failed:', e.message));
      return res.json(schemesCache.data);
    }
    if (!GEMINI_API_KEY) return res.json({ ...SCHEMES_FALLBACK, lastUpdated: 'Offline list' });

    const p = refreshSchemes().catch(e => { console.error('Schemes fetch failed:', e.message); return null; });
    const result = await Promise.race([p, sleep(12000).then(() => null)]);
    res.json(result || { ...SCHEMES_FALLBACK, lastUpdated: 'Basic list (full list is loading, refresh in a minute)' });
  } catch (err) {
    console.error('Schemes handler crashed:', err);
    res.json({ ...SCHEMES_FALLBACK, lastUpdated: 'Basic list' });
  }
});

// Warm the cache when the server starts, so the first farmer doesn't wait.
if (GEMINI_API_KEY) refreshSchemes().catch(() => {});

/* ===================== FERTILIZER RECOMMENDATION (AI-powered) ===================== */
app.post('/api/fertilizer', async (req, res) => {
  try {
    const { crop, soil, n, p, k, lang } = req.body || {};

    if (!crop || !soil || !n || !p || !k) {
      return res.status(400).json({ error: { message: 'Missing crop, soil, or nutrient levels.' } });
    }
    if (!GEMINI_API_KEY) {
      return res.status(400).json({ error: { message: 'Server is missing GEMINI_API_KEY.' } });
    }

    const langLine = lang === 'ta'
      ? 'Write EVERY text field entirely in the TAMIL language (தமிழ் script).'
      : 'Write every text field in English.';

    const prompt = `You are an expert agronomist advising an Indian farmer through a fertilizer-management app.

Field details:
- Crop: ${crop}
- Soil type: ${soil}
- Nitrogen (N) status: ${n}
- Phosphorus (P) status: ${p}
- Potassium (K) status: ${k}

Give a specific, practical fertilizer recommendation for exactly this combination of crop, soil type, and nutrient status — the soil type should meaningfully affect your advice (e.g. sandy soil leaches nutrients faster, clay soil retains them longer, black/red soils differ in nutrient-holding capacity).

${langLine}

Respond ONLY with raw JSON (no markdown fences, no preamble) in exactly this shape:
{
  "fertilizerName": "the primary fertilizer or combination to use (e.g. 'Urea + MOP' or 'NPK 19:19:19')",
  "dosage": "a practical dosage guideline, e.g. per acre or per hectare",
  "application": "2-3 sentences on how and when to apply it, considering the soil type given",
  "stage": "the current growth stage this recommendation targets, and what to watch for next",
  "tip": "one extra practical tip specific to this soil type and crop combination"
}`;

    let text;
    try {
      text = await callGemini([{ text: prompt }], 2000);
    } catch (e) {
      console.error('Gemini API error (fertilizer):', e);
      return res.status(400).json({ error: { message: e.message || 'The AI service returned an error.' } });
    }

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) {
      return res.status(400).json({ error: { message: 'Could not parse the recommendation.' } });
    }

    const parsed = JSON.parse(text.slice(start, end + 1));
    res.json(parsed);

  } catch (err) {
    console.error('Fertilizer handler crashed:', err);
    res.status(400).json({ error: { message: 'Server error while generating the recommendation.' } });
  }
});

/* ===================== MARKET PRICE (live Agmarknet + AI fallback) ===================== */
// Live mandi prices come from the official Agmarknet dataset on data.gov.in.
// Seeds / fertilizers (and anything with no live data) fall back to a Gemini
// estimate, clearly marked source: "ai" so the frontend can label it.
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const AGMARK_RESOURCE = '9ef84268-d588-465a-a308-a864a43d0070';

// App crop name -> possible Agmarknet commodity names (tried in order)
const AGMARK_NAMES = {
  'Tomato': ['Tomato'],
  'Onion': ['Onion'],
  'Potato': ['Potato'],
  'Carrot': ['Carrot'],
  'Beetroot': ['Beetroot'],
  'Cabbage': ['Cabbage'],
  'Cauliflower': ['Cauliflower'],
  'Brinjal': ['Brinjal'],
  'Okra': ['Bhindi(Ladies Finger)'],
  'Green Chilli': ['Green Chilli'],
  'Drumstick': ['Drumstick'],
  'Cucumber': ['Cucumbar(Kheera)'],
  'Rice': ['Rice', 'Paddy(Dhan)(Common)'],
  'Wheat': ['Wheat'],
  'Maize': ['Maize'],
  'Ragi': ['Ragi (Finger Millet)'],
  'Bajra': ['Bajra(Pearl Millet/Cumbu)'],
  'Sorghum': ['Jowar(Sorghum)'],
  'Green Gram': ['Green Gram (Moong)(Whole)'],
  'Black Gram': ['Black Gram (Urd Beans)(Whole)'],
  'Red Gram': ['Arhar (Tur/Red Gram)(Whole)'],
  'Bengal Gram': ['Bengal Gram(Gram)(Whole)'],
  'Kidney Beans': ['Rajmash Beans', 'French Beans (Frasbean)'],
  'Groundnut': ['Groundnut'],
  'Soybean': ['Soyabean'],
  'Sunflower': ['Sunflower'],
  'Sesame': ['Sesamum(Sesame,Gingelly,Til)'],
  'Mustard': ['Mustard'],
  'Banana': ['Banana'],
  'Mango': ['Mango'],
  'Apple': ['Apple'],
  'Orange': ['Orange'],
  'Papaya': ['Papaya'],
  'Guava': ['Guava'],
  'Pomegranate': ['Pomegranate'],
  'Watermelon': ['Water Melon'],
  'Coconut': ['Coconut'],
  'Turmeric': ['Turmeric'],
  'Chilli': ['Dry Chillies', 'Green Chilli'],
  'Ginger': ['Ginger(Green)', 'Ginger(Dry)'],
  'Garlic': ['Garlic'],
  'Pepper': ['Black pepper'],
  'Cardamom': ['Cardamoms'],
  'Cinnamon': ['Cinnamon']
};

const marketPriceCache = new Map();
const PRICE_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function fetchAgmark(state, commodity) {
  // The API accepts the state filter as "state.keyword" on some setups and
  // plain "state" on others, so try both and use whichever returns rows.
  let lastErr = null;
  for (const field of ['state.keyword', 'state']) {
    try {
      const url = new URL(`https://api.data.gov.in/resource/${AGMARK_RESOURCE}`);
      url.searchParams.set('api-key', DATA_GOV_API_KEY);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1000');
      url.searchParams.set(`filters[${field}]`, state);
      url.searchParams.set('filters[commodity]', commodity);

      const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!r.ok) { lastErr = new Error(`Agmarknet API returned ${r.status}`); continue; }
      const data = await r.json();
      const records = Array.isArray(data.records) ? data.records : [];
      if (records.length) return records;
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) throw lastErr;
  return [];
}

function parseAgmarkDate(s) { // "28/09/2026" -> timestamp
  const [d, m, y] = String(s || '').split('/').map(Number);
  return y ? new Date(y, m - 1, d).getTime() : 0;
}

function summarize(records) {
  const mins = records.map(r => Number(r.min_price)).filter(n => n > 0);
  const maxs = records.map(r => Number(r.max_price)).filter(n => n > 0);
  const mods = records.map(r => Number(r.modal_price)).filter(n => n > 0);
  if (!mins.length || !maxs.length || !mods.length) return null;
  const avg = a => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
  return { min: Math.min(...mins), max: Math.max(...maxs), modal: avg(mods) };
}

// Picks the best level: market -> district -> state. Uses only the latest date.
function pickPrice(records, district, market) {
  if (!records.length) return null;
  const latest = Math.max(...records.map(r => parseAgmarkDate(r.arrival_date)));
  const fresh = records.filter(r => parseAgmarkDate(r.arrival_date) === latest);
  const date = fresh[0].arrival_date;
  const low = s => String(s || '').toLowerCase().trim();

  const base = low(market).replace(/\s*market$/, '').replace(/\s*central$/, '');
  const byMarket = fresh.filter(r => {
    const rm = low(r.market);
    return rm && (rm.includes(base) || base.includes(rm));
  });
  let s = summarize(byMarket);
  if (s) return { ...s, level: 'market', date };

  const byDistrict = fresh.filter(r => low(r.district) === low(district));
  s = summarize(byDistrict);
  if (s) return { ...s, level: 'district', date };

  s = summarize(fresh);
  if (s) return { ...s, level: 'state', date };
  return null;
}

function liveNote(level, date, market, district, state, ta) {
  if (ta) {
    const where = level === 'market' ? market : level === 'district' ? `${district} மாவட்ட சராசரி` : `${state} மாநில சராசரி`;
    const extra = level === 'market' ? '' : ' (இந்த சந்தைக்கு இன்று தரவு இல்லை)';
    return `அதிகாரப்பூர்வ Agmarknet நேரடி விலை (${date}) — ${where}${extra}. விலை ஒரு குவிண்டாலுக்கு.`;
  }
  const where = level === 'market' ? market : level === 'district' ? `${district} district average` : `${state} state average`;
  const extra = level === 'market' ? '' : ' (no data for this market today)';
  return `Official Agmarknet live mandi price (${date}) — ${where}${extra}. Price per quintal.`;
}

async function aiPriceSearch({ state, district, market, crop, lang }) {
  const langLine = lang === 'ta'
    ? 'Write the "note" field in TAMIL (தமிழ் script).'
    : 'Write the "note" field in English.';
  const today = new Date().toLocaleDateString('en-IN');
  const prompt = `Today is ${today}. Use Google Search to find the LATEST wholesale mandi price (Agmarknet / APMC / market reports / news) for this product in India.

Product: ${crop}
Market: ${market}
District: ${district}
State: ${state}

Rules:
- Prefer the exact market; else the district; else the state average.
- Use Indian Rs per quintal (100 kg). Convert if the source uses per kg (multiply by 100).
- Only report numbers you actually found in a source. If you cannot find a recent price, set "found" to false and do NOT guess.
- min <= modal <= max, all integers in rupees.
${langLine}

Respond ONLY with raw JSON (no markdown fences) in exactly this shape:
{ "found": true, "min": 0, "max": 0, "modal": 0, "unit": "per quintal", "priceDate": "date of the price", "where": "market/district/state the price is for", "note": "one short sentence naming the source and date" }`;

  const text = await callGeminiGrounded([{ text: prompt }], 2500);
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a === -1 || b === -1) throw new Error('Could not parse the searched price.');
  const p = JSON.parse(text.slice(a, b + 1));
  const min = Number(p.min), max = Number(p.max), modal = Number(p.modal);
  if (!p.found || !(min > 0) || !(max > 0) || !(modal > 0) || min > modal || modal > max) return null;
  return {
    min, max, modal,
    unit: p.unit || 'per quintal',
    note: p.note || '',
    date: p.priceDate || '',
    source: 'search'
  };
}

async function aiPriceEstimate({ state, district, market, crop, category, lang }) {
  const langLine = lang === 'ta'
    ? 'Write the "note" field in TAMIL (தமிழ் script).'
    : 'Write the "note" field in English.';
  const prompt = `You are an Indian agricultural market analyst. Estimate a realistic current price for this product in India.

State: ${state}
District: ${district}
Market: ${market}
Product: ${crop}
Category: ${category || 'unknown'}

Rules:
- For crops/produce use Indian Rs per quintal.
- For fertilizers use the Indian government-controlled retail rate per bag (e.g. Urea 45 kg bag) and set unit accordingly.
- For seeds use a typical retail price per kg or per packet and set unit accordingly.
- All prices are integers in rupees.
${langLine}

Respond ONLY with raw JSON (no markdown fences) in exactly this shape:
{ "min": 0, "max": 0, "modal": 0, "unit": "per quintal", "note": "short note saying this is an estimate, confirm with the local market" }`;

  const text = await callGemini([{ text: prompt }], 2000);
  const s = text.indexOf('{'), e = text.lastIndexOf('}');
  if (s === -1 || e === -1) throw new Error('Could not parse the price estimate.');
  const p = JSON.parse(text.slice(s, e + 1));
  return {
    min: Number(p.min) || null,
    max: Number(p.max) || null,
    modal: Number(p.modal) || null,
    unit: p.unit || 'per quintal',
    note: p.note || '',
    source: 'ai'
  };
}

app.post('/api/market-price', async (req, res) => {
  try {
    const { state, district, market, crop, category, lang } = req.body || {};
    if (!state || !district || !market || !crop) {
      return res.status(400).json({ error: { message: 'Missing state, district, market, or crop.' } });
    }

    const key = [state, district, market, crop, lang].join('|');
    const cached = marketPriceCache.get(key);
    if (cached && Date.now() - cached.at < (cached.ttl || PRICE_CACHE_TTL)) return res.json(cached.data);

    let result = null;

    // 1) Live Agmarknet data — all commodity names tried IN PARALLEL
    const names = AGMARK_NAMES[crop];
    if (names && DATA_GOV_API_KEY) {
      const results = await Promise.all(names.map(async name => {
        try {
          return pickPrice(await fetchAgmark(state, name), district, market);
        } catch (e) {
          console.error(`Agmarknet fetch failed for ${name}:`, e.message);
          return null;
        }
      }));
      const picked = results.find(Boolean);
      if (picked) {
        result = {
          min: picked.min,
          max: picked.max,
          modal: picked.modal,
          unit: 'per quintal',
          note: liveNote(picked.level, picked.date, market, district, state, lang === 'ta'),
          source: 'live',
          level: picked.level,
          date: picked.date
        };
      }
    }

    // 2) Gemini + Google Search: latest price read from the web
    if (!result && GEMINI_API_KEY && AGMARK_NAMES[crop]) {
      try {
        result = await aiPriceSearch({ state, district, market, crop, lang });
      } catch (e) {
        console.error('Searched price failed:', e.message);
      }
    }

    // 3) Fallback: plain Gemini estimate, with 1 retry
    if (!result && GEMINI_API_KEY) {
      for (let attempt = 1; attempt <= 2 && !result; attempt++) {
        try {
          result = await aiPriceEstimate({ state, district, market, crop, category, lang });
        } catch (e) {
          console.error(`AI price estimate attempt ${attempt} failed:`, e.message);
          if (attempt < 2) await sleep(1500);
        }
      }
    }

    // 4) Everything failed: serve an older cached copy if we have one
    if (!result) {
      if (cached) return res.json(cached.data);
      return res.status(400).json({ error: { message: 'Could not fetch the price right now.' } });
    }

    console.log(`market-price ${crop} @ ${state}/${district}: source=${result.source}${result.level ? ' level=' + result.level : ''}`);
    marketPriceCache.set(key, { at: Date.now(), ttl: result.source === 'live' ? PRICE_CACHE_TTL : result.source === 'search' ? 15 * 60 * 1000 : 5 * 60 * 1000, data: result });
    res.json(result);

  } catch (err) {
    console.error('Market price handler crashed:', err);
    res.status(400).json({ error: { message: 'Server error while fetching the price.' } });
  }
});

/* ===================== IRRIGATION ADVISOR (Open-Meteo weather + FAO-56 water balance + Gemini tips) ===================== */
// Crop coefficients (Kc: initial / mid / late), max root depth (m), allowed depletion fraction (p) — FAO-56 approximate values.
const IRR_CROPS = {
  'Rice': { kc: [1.05, 1.2, 0.9], root: 0.5, p: 0.2 },
  'Wheat': { kc: [0.4, 1.15, 0.4], root: 1.0 },
  'Maize': { kc: [0.4, 1.2, 0.6], root: 1.0 },
  'Ragi': { kc: [0.35, 1.0, 0.4], root: 0.8 },
  'Sugarcane': { kc: [0.4, 1.25, 0.75], root: 1.2 },
  'Cotton': { kc: [0.35, 1.15, 0.7], root: 1.2 },
  'Groundnut': { kc: [0.4, 1.15, 0.6], root: 0.5 },
  'Tomato': { kc: [0.6, 1.15, 0.8], root: 0.7 },
  'Onion': { kc: [0.7, 1.05, 0.75], root: 0.3 },
  'Potato': { kc: [0.5, 1.15, 0.75], root: 0.4 },
  'Brinjal': { kc: [0.6, 1.05, 0.9], root: 0.7 },
  'Okra': { kc: [0.5, 1.0, 0.7], root: 0.6 },
  'Chilli': { kc: [0.6, 1.05, 0.9], root: 0.6 },
  'Banana': { kc: [0.5, 1.1, 1.0], root: 0.6 },
  'Coconut': { kc: [0.95, 1.0, 1.0], root: 1.0 },
  'Turmeric': { kc: [0.5, 1.1, 0.7], root: 0.5 },
  'Green Gram': { kc: [0.4, 1.05, 0.5], root: 0.5 },
  'Black Gram': { kc: [0.4, 1.05, 0.5], root: 0.5 },
  'Sunflower': { kc: [0.35, 1.15, 0.35], root: 0.8 },
  'Cabbage': { kc: [0.7, 1.05, 0.95], root: 0.5 },
  'Carrot': { kc: [0.7, 1.05, 0.95], root: 0.5 },
  'Mango': { kc: [0.65, 0.85, 0.8], root: 1.2 }
};
// Volumetric water content at field capacity (fc) and wilting point (wp)
const IRR_SOILS = {
  sandy: { fc: 0.15, wp: 0.06 },
  loamy: { fc: 0.27, wp: 0.12 },
  clay:  { fc: 0.40, wp: 0.22 },
  red:   { fc: 0.22, wp: 0.10 },
  black: { fc: 0.42, wp: 0.24 }
};
const IRR_ROOT_FACTOR = { initial: 0.4, development: 0.7, mid: 1, late: 1 };
const IRR_EFFICIENCY = { drip: 0.9, sprinkler: 0.75, flood: 0.55 };
const LITRES_PER_MM_ACRE = 4046.86;

const geoCache = new Map();
const irrigationCache = new Map();
const IRRIGATION_TTL = 30 * 60 * 1000;

async function geocodePlace(district, state) {
  const key = `${district}|${state}`;
  if (geoCache.has(key)) return geoCache.get(key);

  const tries = [district, String(district).replace(/^(North|South)\s+/i, ''), state];
  for (const name of tries) {
    if (!name) continue;
    const u = new URL('https://geocoding-api.open-meteo.com/v1/search');
    u.searchParams.set('name', name);
    u.searchParams.set('count', '10');
    u.searchParams.set('language', 'en');
    u.searchParams.set('country_code', 'IN');
    const r = await fetch(u, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) continue;
    const j = await r.json();
    const res = Array.isArray(j.results) ? j.results : [];
    if (!res.length) continue;
    const st = String(state || '').toLowerCase();
    const best = res.find(x => String(x.admin1 || '').toLowerCase() === st) || res[0];
    const out = { lat: best.latitude, lon: best.longitude, name: `${best.name}${best.admin1 ? ', ' + best.admin1 : ''}` };
    geoCache.set(key, out);
    return out;
  }
  throw new Error('Could not find this location. Please try "Use my location".');
}

async function fetchWeather(lat, lon) {
  const u = new URL('https://api.open-meteo.com/v1/forecast');
  u.searchParams.set('latitude', lat);
  u.searchParams.set('longitude', lon);
  u.searchParams.set('daily', 'et0_fao_evapotranspiration,precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min');
  u.searchParams.set('hourly', 'soil_moisture_0_to_7cm,soil_moisture_7_to_28cm');
  u.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m');
  u.searchParams.set('timezone', 'Asia/Kolkata');
  u.searchParams.set('forecast_days', '7');

  const r = await fetch(u, { signal: AbortSignal.timeout(15000) });
  const j = await r.json();
  if (!r.ok || !j.daily) throw new Error(j.reason || 'Weather service returned an error.');

  const hr = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date())) % 24;
  const a = j.hourly && j.hourly.soil_moisture_0_to_7cm ? j.hourly.soil_moisture_0_to_7cm[hr] : null;
  const b = j.hourly && j.hourly.soil_moisture_7_to_28cm ? j.hourly.soil_moisture_7_to_28cm[hr] : null;
  let theta = null;
  if (a != null && b != null) theta = (7 * a + 21 * b) / 28;
  else if (b != null) theta = b;
  else if (a != null) theta = a;

  const d = j.daily;
  return {
    current: j.current ? {
      temp: j.current.temperature_2m,
      humidity: j.current.relative_humidity_2m,
      wind: j.current.wind_speed_10m
    } : null,
    soilTheta: theta,
    daily: d.time.map((t, i) => ({
      date: t,
      tmax: d.temperature_2m_max[i],
      tmin: d.temperature_2m_min[i],
      rain: d.precipitation_sum[i] || 0,
      rainProb: d.precipitation_probability_max ? (d.precipitation_probability_max[i] || 0) : 0,
      et0: d.et0_fao_evapotranspiration[i] || 0
    }))
  };
}

// 7-day root-zone water balance. Irrigates when depletion passes the allowed limit
// (and no significant rain is coming); refills to field capacity.
function planIrrigation(w, o) {
  const crop = IRR_CROPS[o.crop];
  const soil = IRR_SOILS[o.soil];
  const [k0, k1, k2] = crop.kc;
  const kc = o.stage === 'initial' ? k0 : o.stage === 'development' ? (k0 + k1) / 2 : o.stage === 'late' ? k2 : k1;
  const root = crop.root * IRR_ROOT_FACTOR[o.stage];
  const taw = (soil.fc - soil.wp) * 1000 * root;      // total available water, mm
  const raw = taw * (crop.p || 0.5);                  // readily available water, mm
  const eff = IRR_EFFICIENCY[o.method];

  let frac = null;
  if (w.soilTheta != null) frac = Math.min(1, Math.max(0, (w.soilTheta - soil.wp) / (soil.fc - soil.wp)));
  const estimated = frac === null;
  if (estimated) frac = 0.6;
  let dep = (1 - frac) * taw;

  const days = w.daily.map(d => {
    const etc = d.et0 * kc;
    const effRain = d.rain >= 3 ? d.rain * 0.8 : 0;
    dep = Math.max(0, dep + etc - effRain);

    let action = 'skip', net = 0;
    if (dep >= raw) {
      if (d.rain >= 5 || d.rainProb >= 70) {
        action = 'wait';
      } else {
        action = 'irrigate';
        net = Math.min(dep, taw);
        dep = Math.max(0, dep - net);
      }
    }
    const gross = net / eff;
    return {
      date: d.date, tmax: d.tmax, tmin: d.tmin,
      rain: +d.rain.toFixed(1), rainProb: d.rainProb,
      et0: +d.et0.toFixed(1), etc: +etc.toFixed(1),
      action,
      netMm: +net.toFixed(1),
      grossMm: +gross.toFixed(1),
      litres: Math.round(gross * LITRES_PER_MM_ACRE * o.area)
    };
  });

  const next = days.find(d => d.action === 'irrigate');
  return {
    kc: +kc.toFixed(2),
    rootDepthM: +root.toFixed(2),
    tawMm: Math.round(taw),
    rawMm: Math.round(raw),
    availablePct: Math.round(frac * 100),
    soilEstimated: estimated,
    days,
    summary: {
      today: days[0].action,
      nextDate: next ? next.date : null,
      weekLitres: days.reduce((s, d) => s + d.litres, 0),
      weekMm: +days.reduce((s, d) => s + d.grossMm, 0).toFixed(1),
      totalRain: +days.reduce((s, d) => s + d.rain, 0).toFixed(1)
    }
  };
}

app.post('/api/irrigation', async (req, res) => {
  try {
    const b = req.body || {};
    const crop = b.crop;
    if (!IRR_CROPS[crop]) return res.status(400).json({ error: { message: 'Please choose a supported crop.' } });

    const o = {
      crop,
      stage: IRR_ROOT_FACTOR[b.stage] ? b.stage : 'mid',
      soil: IRR_SOILS[b.soil] ? b.soil : 'loamy',
      method: IRR_EFFICIENCY[b.method] ? b.method : 'drip',
      area: Math.min(1000, Math.max(0.01, Number(b.area) || 1)),
      lang: b.lang === 'ta' ? 'ta' : 'en'
    };

    let lat = Number(b.lat), lon = Number(b.lon), place = null;
    if (!(isFinite(lat) && isFinite(lon) && b.lat != null && b.lon != null)) {
      if (!b.district && !b.state) return res.status(400).json({ error: { message: 'Please select a location or use your current location.' } });
      const g = await geocodePlace(b.district, b.state);
      lat = g.lat; lon = g.lon; place = g.name;
    } else {
      place = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }

    const key = [lat.toFixed(2), lon.toFixed(2), o.crop, o.stage, o.soil, o.method, o.area, o.lang].join('|');
    const cached = irrigationCache.get(key);
    if (cached && Date.now() - cached.at < IRRIGATION_TTL) return res.json(cached.data);

    const w = await fetchWeather(lat, lon);
    const plan = planIrrigation(w, o);

    // Short farmer-friendly tips from Gemini (optional — plan still works without it)
    let advice = null;
    if (GEMINI_API_KEY) {
      try {
        const langLine = o.lang === 'ta'
          ? 'Write in TAMIL (தமிழ் script) only.'
          : 'Write in simple English.';
        const facts = {
          crop: o.crop, stage: o.stage, soil: o.soil, method: o.method, areaAcres: o.area,
          today: plan.summary.today, nextIrrigation: plan.summary.nextDate,
          weekWaterMm: plan.summary.weekMm, rainNext7DaysMm: plan.summary.totalRain,
          soilAvailableWaterPct: plan.availablePct,
          tempNowC: w.current && w.current.temp
        };
        const text = await callGemini([{ text:
`You are an agronomist advising an Indian farmer. Based ONLY on this computed irrigation plan, give 3 to 4 short practical tips (best time of day to irrigate, how to save water for this method, what to watch in this crop stage, and one rain-related tip if relevant). Do not change the schedule or invent numbers.
${langLine}
FORMAT: plain text, no markdown, each tip on its own line starting with "- ".

Plan: ${JSON.stringify(facts)}` }], 1500);
        advice = text.trim();
      } catch (e) {
        console.error('Irrigation advice failed:', e.message);
      }
    }

    const data = { location: place, current: w.current, ...plan, advice, source: 'open-meteo' };
    irrigationCache.set(key, { at: Date.now(), data });
    console.log(`irrigation ${o.crop}/${o.stage}/${o.soil} @ ${place}: today=${plan.summary.today}`);
    res.json(data);

  } catch (err) {
    console.error('Irrigation handler failed:', err.message);
    res.status(400).json({ error: { message: err.message || 'Could not build the irrigation plan.' } });
  }
});

/* ===================== IRRIGATION ALERTS (Web Push + Hasura DB + scheduled check) ===================== */
// Needs env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, HASURA_GRAPHQL_URL, HASURA_ADMIN_SECRET, CRON_SECRET
// Needs npm package "web-push" (loaded lazily so the rest of the server still runs without it).
const CRON_SECRET = process.env.CRON_SECRET;
const IRR_CROP_TA = {
  'Rice':'நெல்','Wheat':'கோதுமை','Maize':'மக்காச்சோளம்','Ragi':'கேழ்வரகு','Sugarcane':'கரும்பு','Cotton':'பருத்தி','Groundnut':'நிலக்கடலை',
  'Tomato':'தக்காளி','Onion':'வெங்காயம்','Potato':'உருளைக்கிழங்கு','Brinjal':'கத்தரிக்காய்','Okra':'வெண்டைக்காய்','Chilli':'மிளகாய்',
  'Banana':'வாழை','Coconut':'தென்னை','Turmeric':'மஞ்சள்','Green Gram':'பச்சைப்பயறு','Black Gram':'உளுந்து','Sunflower':'சூரியகாந்தி',
  'Cabbage':'முட்டைக்கோஸ்','Carrot':'கேரட்','Mango':'மா'
};

let _webpush;
function getWebPush() {
  if (_webpush !== undefined) return _webpush;
  try {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) throw new Error('VAPID keys are not set');
    const wp = require('web-push');
    wp.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@agrinova.app', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
    _webpush = wp;
  } catch (e) {
    console.error('Web push disabled:', e.message);
    _webpush = null;
  }
  return _webpush;
}

async function hasuraGql(query, variables) {
  const clean = v => String(v || '').trim().replace(/^["']|["']$/g, '').trim();
  const url = clean(process.env.HASURA_GRAPHQL_URL), secret = clean(process.env.HASURA_ADMIN_SECRET);
  if (!url || !secret) {
    const missing = [!url && 'HASURA_GRAPHQL_URL', !secret && 'HASURA_ADMIN_SECRET'].filter(Boolean).join(' and ');
    throw new Error('Alert storage is not configured. Missing on the server: ' + missing + '.');
  }
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': secret },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(15000)
  });
  const j = await r.json();
  if (j.errors) throw new Error(j.errors[0].message);
  return j.data;
}

function istNow() {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()); // YYYY-MM-DD
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date())) % 24;
  return { date, hour };
}

function normalizeAlertConfig(b) {
  if (!b || !IRR_CROPS[b.crop]) throw new Error('Please choose a supported crop.');
  const num = v => (v != null && v !== '' && isFinite(Number(v))) ? Number(v) : null;
  return {
    crop: b.crop,
    stage: IRR_ROOT_FACTOR[b.stage] ? b.stage : 'mid',
    soil: IRR_SOILS[b.soil] ? b.soil : 'loamy',
    method: IRR_EFFICIENCY[b.method] ? b.method : 'drip',
    area: Math.min(1000, Math.max(0.01, Number(b.area) || 1)),
    lang: b.lang === 'ta' ? 'ta' : 'en',
    lat: num(b.lat), lon: num(b.lon),
    state: String(b.state || '').slice(0, 60),
    district: String(b.district || '').slice(0, 60)
  };
}

async function planForConfig(c, memo) {
  let lat = c.lat, lon = c.lon;
  if (lat == null || lon == null) {
    const g = await geocodePlace(c.district, c.state);
    lat = g.lat; lon = g.lon;
  }
  const wkey = lat.toFixed(2) + '|' + lon.toFixed(2);
  if (!memo.has(wkey)) memo.set(wkey, fetchWeather(lat, lon));
  return planIrrigation(await memo.get(wkey), c);
}

// Days between irrigations for this crop/soil (readily-available water ÷ average daily crop use)
function cycleDays(plan) {
  const avg = plan.days.reduce((s, d) => s + d.etc, 0) / plan.days.length;
  return Math.max(1, Math.floor(plan.rawMm / Math.max(avg, 0.1)));
}
function dueByCycle(row, plan, iso) {
  if (!row.irrigated_on) return true;
  const next = new Date(row.irrigated_on + 'T00:00:00Z');
  next.setUTCDate(next.getUTCDate() + cycleDays(plan));
  return iso >= next.toISOString().slice(0, 10);
}

// Which notification (if any) should go out right now? One per type per day.
function decideAlert(plan, hour, row) {
  const t = plan.days[0], n = plan.days[1];
  let type = null;
  if (hour >= 5 && t.action === 'irrigate' && dueByCycle(row, plan, t.date)) type = 'today';
  else if (hour >= 5 && t.action === 'wait' && dueByCycle(row, plan, t.date)) type = 'wait';
  else if (hour >= 16 && n && n.action === 'irrigate' && dueByCycle(row, plan, n.date)) type = 'tomorrow';
  if (!type) return null;
  const key = `${t.date}:${type}`;
  return row.last_key === key ? null : { type, key };
}

function buildAlertMessage(type, plan, c) {
  const ta = c.lang === 'ta';
  const crop = ta ? (IRR_CROP_TA[c.crop] || c.crop) : c.crop;
  const t = plan.days[0], n = plan.days[1];
  if (type === 'today') return {
    title: ta ? `💧 இன்று நீர் பாய்ச்சவும் — ${crop}` : `💧 Irrigate today — ${crop}`,
    body: ta ? `சுமார் ${t.grossMm} மி.மீ (${c.area} ஏக்கருக்கு ${t.litres.toLocaleString('en-IN')} லிட்டர்). பாய்ச்சிய பின் "பாய்ச்சினேன்" அழுத்தவும்.`
             : `Apply about ${t.grossMm} mm (${t.litres.toLocaleString('en-IN')} litres for ${c.area} acres). Tap "Irrigated" when done.`,
    canDone: true, doneLabel: ta ? '✅ பாய்ச்சினேன்' : '✅ Irrigated'
  };
  if (type === 'wait') return {
    title: ta ? `🌧️ நீர் பாய்ச்ச வேண்டாம் — ${crop}` : `🌧️ Hold irrigation — ${crop}`,
    body: ta ? `மண் காய்ந்து வருகிறது, ஆனால் மழை வர வாய்ப்பு உள்ளது (${t.rain} மி.மீ, ${t.rainProb}%). நாளை பார்க்கவும்.`
             : `Soil is drying but rain is likely (${t.rain} mm, ${t.rainProb}% chance). Check again tomorrow.`
  };
  return {
    title: ta ? `⏰ நாளை நீர்ப்பாசனம் தேவை — ${crop}` : `⏰ Irrigation due tomorrow — ${crop}`,
    body: ta ? `நாளை சுமார் ${n.grossMm} மி.மீ (${n.litres.toLocaleString('en-IN')} லிட்டர்) தேவைப்படும். தயாராக இருங்கள்.`
             : `About ${n.grossMm} mm (${n.litres.toLocaleString('en-IN')} litres) will be needed tomorrow. Get ready.`
  };
}

async function pushTo(row, payload) {
  const wp = getWebPush();
  if (!wp) throw new Error('Web push is not configured on the server.');
  try {
    await wp.sendNotification(row.subscription, JSON.stringify(Object.assign({ url: 'irrigation.html', tag: 'irrigation' }, payload)), { TTL: 6 * 3600 });
    return true;
  } catch (e) {
    if (e.statusCode === 404 || e.statusCode === 410) {   // subscription expired / user revoked
      await hasuraGql(`mutation($e:String!){delete_agri_irrigation_alerts(where:{endpoint:{_eq:$e}}){affected_rows}}`, { e: row.endpoint });
      return false;
    }
    throw e;
  }
}

let alertRunBusy = false;
async function runIrrigationChecks() {
  if (alertRunBusy) return { skipped: true };
  alertRunBusy = true;
  const stats = { subscribers: 0, sent: 0, removed: 0, errors: 0 };
  try {
    const data = await hasuraGql(`query { agri_irrigation_alerts { id endpoint subscription config last_key irrigated_on } }`);
    const rows = data.agri_irrigation_alerts || [];
    stats.subscribers = rows.length;
    const { hour } = istNow();
    const memo = new Map();
    for (const row of rows) {
      try {
        const c = normalizeAlertConfig(row.config);
        const plan = await planForConfig(c, memo);
        const d = decideAlert(plan, hour, row);
        if (!d) continue;
        const ok = await pushTo(row, Object.assign({ tag: 'irrigation-' + d.type }, buildAlertMessage(d.type, plan, c)));
        if (!ok) { stats.removed++; continue; }
        await hasuraGql(`mutation($id:Int!,$k:String!){update_agri_irrigation_alerts_by_pk(pk_columns:{id:$id},_set:{last_key:$k}){id}}`, { id: row.id, k: d.key });
        stats.sent++;
      } catch (e) {
        stats.errors++;
        console.error('Alert check failed for one subscriber:', e.message);
      }
    }
  } finally {
    alertRunBusy = false;
  }
  console.log('irrigation alert run:', JSON.stringify(stats));
  return stats;
}

app.get('/api/push/public-key', (req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) return res.status(503).json({ error: { message: 'Alerts are not set up on the server yet.' } });
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

app.post('/api/irrigation/subscribe', async (req, res) => {
  try {
    const { subscription, config } = req.body || {};
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: { message: 'Invalid notification subscription.' } });
    }
    if (!getWebPush()) return res.status(503).json({ error: { message: 'Alerts are not set up on the server yet.' } });
    const c = normalizeAlertConfig(config);

    await hasuraGql(
      `mutation($o: agri_irrigation_alerts_insert_input!){
         insert_agri_irrigation_alerts_one(object:$o, on_conflict:{constraint: irrigation_alerts_endpoint_key, update_columns:[subscription, config]}){ id }
       }`,
      { o: { endpoint: subscription.endpoint, subscription, config: c } }
    );

    const ta = c.lang === 'ta';
    pushTo({ subscription, endpoint: subscription.endpoint }, {
      tag: 'irrigation-welcome',
      title: ta ? '🔔 நீர்ப்பாசன அறிவிப்புகள் இயக்கப்பட்டன' : '🔔 Irrigation alerts are on',
      body: ta ? `${IRR_CROP_TA[c.crop] || c.crop} பயிருக்கு நீர் பாய்ச்ச வேண்டிய நேரத்தில் தெரிவிப்போம்.`
               : `We'll notify you when your ${c.crop} needs water.`
    }).catch(e => console.error('Welcome push failed:', e.message));

    res.json({ ok: true });
  } catch (e) {
    console.error('Subscribe failed:', e.message);
    res.status(400).json({ error: { message: e.message || 'Could not turn on alerts.' } });
  }
});

app.post('/api/irrigation/unsubscribe', async (req, res) => {
  try {
    const endpoint = req.body && req.body.endpoint;
    if (!endpoint) return res.status(400).json({ error: { message: 'Missing endpoint.' } });
    await hasuraGql(`mutation($e:String!){delete_agri_irrigation_alerts(where:{endpoint:{_eq:$e}}){affected_rows}}`, { e: endpoint });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: { message: e.message || 'Could not turn off alerts.' } });
  }
});

// Farmer tapped "Irrigated": pause reminders for one irrigation cycle
app.post('/api/irrigation/done', async (req, res) => {
  try {
    const endpoint = req.body && req.body.endpoint;
    if (!endpoint) return res.status(400).json({ error: { message: 'Missing endpoint.' } });
    await hasuraGql(`mutation($e:String!,$d:String!){update_agri_irrigation_alerts(where:{endpoint:{_eq:$e}},_set:{irrigated_on:$d}){affected_rows}}`,
      { e: endpoint, d: istNow().date });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: { message: e.message || 'Could not save.' } });
  }
});

// Called by an external scheduler (cron-job.org) every ~30 min — this also keeps Render awake.
app.all('/api/irrigation/check', async (req, res) => {
  if (!CRON_SECRET || req.query.secret !== CRON_SECRET) return res.status(401).json({ error: { message: 'Unauthorized.' } });
  try {
    res.json(await runIrrigationChecks());
  } catch (e) {
    console.error('Alert run failed:', e.message);
    res.status(400).json({ error: { message: e.message } });
  }
});

// Backup scheduler while the server is awake
if (process.env.HASURA_GRAPHQL_URL && process.env.HASURA_ADMIN_SECRET && process.env.VAPID_PUBLIC_KEY) {
  setInterval(() => { runIrrigationChecks().catch(e => console.error('Scheduled alert run failed:', e.message)); }, 30 * 60 * 1000);
}

/* ===================== WEATHER ALERTS (daily weather message, rain push + email, hourly water reminder) ===================== */
// Used by weather.html "Notifications" card.
// Needs: Hasura table "agri_weather_alerts" (columns incl. last_daily_key text), and for emails
// BREVO_API_KEY + EMAIL_FROM (Render free blocks SMTP) or SMTP_USER + SMTP_PASS (Gmail, paid plans / local PC).
let _mailer;
function getMailer() {
  if (_mailer !== undefined) return _mailer;
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) throw new Error('SMTP_USER / SMTP_PASS are not set');
    const nodemailer = require('nodemailer');
    _mailer = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  } catch (e) {
    console.error('Email disabled:', e.message);
    _mailer = null;
  }
  return _mailer;
}

async function pushWeather(row, payload) {
  const wp = getWebPush();
  if (!wp) return true;
  try {
    await wp.sendNotification(row.subscription,
      JSON.stringify(Object.assign({ url: 'weather.html' }, payload)), { TTL: 3600 });
    return true;
  } catch (e) {
    if (e.statusCode === 404 || e.statusCode === 410) {   // subscription expired / user revoked
      await hasuraGql(`mutation($e:String!){delete_agri_weather_alerts(where:{endpoint:{_eq:$e}}){affected_rows}}`, { e: row.endpoint });
      return false;
    }
    throw e;
  }
}

/* ---- Sending email. Render FREE blocks SMTP ports (25/465/587), so Gmail/nodemailer cannot work there.
   Use an HTTPS mail API instead: set BREVO_API_KEY + EMAIL_FROM (a sender address verified in Brevo) on Render.
   If BREVO_API_KEY is not set, it falls back to Gmail SMTP (works only on paid Render plans / your own PC). */
const emailConfigured = () => !!String(process.env.BREVO_API_KEY || '').trim() || !!getMailer();
async function sendMail({ to, subject, text, fromName }) {
  const brevoKey = String(process.env.BREVO_API_KEY || '').trim();
  const from = String(process.env.EMAIL_FROM || process.env.SMTP_USER || '').trim();
  if (brevoKey) {
    if (!from) throw new Error('EMAIL_FROM is not set on the server.');
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': brevoKey, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ sender: { name: fromName || 'Agrinova Weather', email: from }, to: [{ email: to }], subject, textContent: text }),
      signal: AbortSignal.timeout(15000)
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error('Email service error: ' + (j.message || r.status));
    }
    return;
  }
  const mailer = getMailer();
  if (!mailer) throw new Error('Email sending is not set up on the server yet (BREVO_API_KEY / EMAIL_FROM).');
  await mailer.sendMail({ from: `"Agrinova Weather" <${process.env.SMTP_USER}>`, to, subject, text });
}

/* ---------- Email verification (6-digit code) for weather alerts ---------- */
// The farmer types an email -> we mail a 6-digit code -> they enter it -> we hand back a signed
// token (valid 30 days). /api/weather-alerts/subscribe only accepts an email that has such a token,
// so rain emails can only go to addresses the farmer really owns.
// Set EMAIL_VERIFY_SECRET on Render (any long random text) so tokens stay valid after a restart.
const crypto = require('crypto');
const MAIL_SECRET = process.env.EMAIL_VERIFY_SECRET || process.env.CRON_SECRET || process.env.HASURA_ADMIN_SECRET || crypto.randomBytes(32).toString('hex');
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const emailCodes = new Map(); // email -> { hash, exp, tries, sends:[timestamps] }
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of emailCodes) if ((!v.exp || v.exp < now) && !v.sends.some(t => now - t < 3600000)) emailCodes.delete(k);
}, 10 * 60 * 1000);

const codeHash = (email, code) => crypto.createHash('sha256').update(email + '|' + code + '|' + MAIL_SECRET).digest('hex');
function signEmail(email, ttlMs) {
  const p = Buffer.from(email.toLowerCase() + '|' + (Date.now() + ttlMs)).toString('base64url');
  return p + '.' + crypto.createHmac('sha256', MAIL_SECRET).update(p).digest('base64url');
}
function checkEmailToken(email, token) {
  try {
    const [p, sig] = String(token || '').split('.');
    if (!p || !sig) return false;
    const good = crypto.createHmac('sha256', MAIL_SECRET).update(p).digest('base64url');
    const a = Buffer.from(sig), b = Buffer.from(good);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
    const [em, exp] = Buffer.from(p, 'base64url').toString().split('|');
    return em === String(email).toLowerCase() && Number(exp) > Date.now();
  } catch (e) { return false; }
}

app.post('/api/weather-alerts/email/send-code', async (req, res) => {
  try {
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 120) return res.status(400).json({ error: { message: 'Enter a valid email address.' } });
    if (!emailConfigured()) return res.status(503).json({ error: { message: 'Email is not set up on the server yet (BREVO_API_KEY / EMAIL_FROM).' } });

    const now = Date.now();
    const rec = emailCodes.get(email) || { sends: [], hash: null, exp: 0, tries: 0 };
    rec.sends = rec.sends.filter(t => now - t < 3600000);
    if (rec.sends.length && now - rec.sends[rec.sends.length - 1] < 30000) {
      return res.status(429).json({ error: { message: 'Please wait 30 seconds before asking for a new code.' } });
    }
    if (rec.sends.length >= 5) {
      return res.status(429).json({ error: { message: 'Too many codes requested for this email. Try again in an hour.' } });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    await sendMail({
      to: email,
      subject: `Your Agrinova verification code: ${code}`,
      text: `Your Agrinova verification code is ${code}.\n\nIt works for 10 minutes. If you did not ask for this, you can ignore this email.`
    });
    rec.sends.push(now); rec.hash = codeHash(email, code); rec.exp = now + 10 * 60 * 1000; rec.tries = 0;
    emailCodes.set(email, rec);
    res.json({ ok: true });
  } catch (e) {
    console.error('Send verification code failed:', e.message);
    const known = /^(Email service|EMAIL_FROM|Email sending)/.test(e.message || '');
    res.status(400).json({ error: { message: known ? e.message : 'Could not send the email. Please check the address and try again.' } });
  }
});

app.post('/api/weather-alerts/email/verify-code', (req, res) => {
  const email = String((req.body && req.body.email) || '').trim().toLowerCase();
  const code = String((req.body && req.body.code) || '').trim();
  const rec = emailCodes.get(email);
  if (!rec || !rec.hash || rec.exp < Date.now()) return res.status(400).json({ error: { message: 'This code has expired. Please ask for a new one.' } });
  if (rec.tries >= 5) { rec.hash = null; return res.status(400).json({ error: { message: 'Too many wrong attempts. Please ask for a new code.' } }); }
  rec.tries++;
  if (codeHash(email, code) !== rec.hash) return res.status(400).json({ error: { message: 'Wrong code. Please check and try again.' } });
  rec.hash = null; // single use
  res.json({ ok: true, token: signEmail(email, 30 * 24 * 3600 * 1000) });
});

/* ---------- Today's weather message (sunny / cloudy / rain / storm / heat) ---------- */
async function fetchDayForecast(lat, lon) {
  const u = new URL('https://api.open-meteo.com/v1/forecast');
  u.searchParams.set('latitude', lat);
  u.searchParams.set('longitude', lon);
  u.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max');
  u.searchParams.set('timezone', 'Asia/Kolkata');
  u.searchParams.set('forecast_days', '1');
  const r = await fetch(u, { signal: AbortSignal.timeout(15000) });
  const j = await r.json();
  if (!r.ok || !j.daily) throw new Error('Weather service error.');
  const d = j.daily;
  return {
    code: d.weather_code[0],
    hi: Math.round(d.temperature_2m_max[0]),
    lo: Math.round(d.temperature_2m_min[0]),
    mm: +(d.precipitation_sum[0] || 0).toFixed(1),
    prob: d.precipitation_probability_max ? (d.precipitation_probability_max[0] || 0) : 0,
    wind: Math.round(d.wind_speed_10m_max[0] || 0)
  };
}

function dayMessage(f, place) {
  const where = place || 'your area';
  const wet = (f.code >= 51 && f.code <= 67) || (f.code >= 80 && f.code <= 82) || f.prob >= 60 || f.mm >= 2;
  if (f.code >= 95) return { kind: 'storm', title: `⛈️ Thunderstorm expected near ${where}`,
    body: `Thunderstorm likely today (about ${f.mm} mm). Stay out of open fields, hold spraying, and keep harvested produce covered.` };
  if (wet) return { kind: 'rain', title: `🌧️ Rain expected today near ${where}`,
    body: `${f.prob}% chance of rain, about ${f.mm} mm. High ${f.hi}°, low ${f.lo}°. Hold spraying and fertiliser, clear field drains, and cover harvested produce.` };
  if (f.hi >= 36) return { kind: 'hot', title: `🔥 Hot day near ${where}`,
    body: `High of ${f.hi}° today. Irrigate early morning or late evening, mulch young plants, and avoid midday field work.` };
  if (f.code <= 1) return { kind: 'sunny', title: `☀️ Sunny day near ${where}`,
    body: `Clear skies, high ${f.hi}°, low ${f.lo}°. Good day for harvesting and drying produce. ${f.wind < 15 ? 'Low wind, so spraying is fine in the morning or evening.' : `It is windy (${f.wind} km/h), so skip spraying.`} Water crops early morning.` };
  return { kind: 'cloudy', title: `⛅ Cloudy day near ${where}`,
    body: `Mostly cloudy, high ${f.hi}°, low ${f.lo}°. Comfortable for field work. Rain chance is low (${f.prob}%), but watch for updates.` };
}

app.post('/api/weather-alerts/subscribe', async (req, res) => {
  try {
    const { subscription, email, emailToken, lat, lon, place, rain, water } = req.body || {};
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    if (!subscription || !subscription.endpoint) return res.status(400).json({ error: { message: 'Invalid subscription.' } });
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: { message: 'Enter a valid email.' } });
    if (cleanEmail && !checkEmailToken(cleanEmail, emailToken)) return res.status(400).json({ error: { message: 'Please verify your email address first.' } });
    if (!isFinite(Number(lat)) || !isFinite(Number(lon))) return res.status(400).json({ error: { message: 'Missing location.' } });

    const prev = await hasuraGql(`query($e:String!){ agri_weather_alerts(where:{endpoint:{_eq:$e}}){ email } }`, { e: subscription.endpoint });
    const before = prev.agri_weather_alerts[0];
    const isNew = !before;
    const emailChanged = !before || (before.email || '') !== cleanEmail;

    const wxRow = { endpoint: subscription.endpoint, subscription, email: cleanEmail || null,
                    lat: Number(lat), lon: Number(lon), place: String(place || '').slice(0, 80),
                    rain_on: rain !== false, water_on: water !== false };
    if (before) {
      // already subscribed: update it (no unique-constraint name needed)
      const { endpoint: _ep, ...changes } = wxRow;
      await hasuraGql(
        `mutation($e:String!,$s:agri_weather_alerts_set_input!){ update_agri_weather_alerts(where:{endpoint:{_eq:$e}}, _set:$s){ affected_rows } }`,
        { e: subscription.endpoint, s: changes });
    } else {
      await hasuraGql(
        `mutation($o: agri_weather_alerts_insert_input!){ insert_agri_weather_alerts_one(object:$o){ id } }`,
        { o: wxRow });
    }

    // Welcome push only the first time (not on every page load)
    if (isNew) {
      pushWeather({ subscription, endpoint: subscription.endpoint },
        { tag: 'wx-welcome', title: '🔔 Agrinova alerts on', body: 'Weather alerts and water reminders (4 times a day) are now active.' })
        .catch(e => console.error('Welcome push failed:', e.message));
    }

    // Welcome email when alerts are turned on, or when the email was changed
    if (cleanEmail && emailChanged && emailConfigured()) {
      const where = String(place || 'your area').slice(0, 80);
      fetchDayForecast(Number(lat), Number(lon)).then(f => {
        const m = dayMessage(f, where);
        return sendMail({
          to: cleanEmail,
          subject: '🔔 Agrinova weather alerts are on',
          text: `Hi! Agrinova weather alerts are now on for ${where}.\n\nYou will get:\n- Water reminders 4 times a day (6 AM, 10 AM, 2 PM, 6 PM)\n- 1 rain alert on days when rain is expected\n- That is at most 5 messages a day, sent to this email and your phone\n\nToday near ${where}:\n${m.title}\n${m.body}\n\nTo change or remove this email, open Agrinova Weather > Alerts and use Edit or Remove.`
        });
      }).catch(e => console.error('Welcome email failed:', e.message));
    }

    res.json({ ok: true });
  } catch (e) {
    console.error('Weather subscribe failed:', e.message);
    res.status(400).json({ error: { message: e.message || 'Could not turn on alerts.' } });
  }
});

app.post('/api/weather-alerts/unsubscribe', async (req, res) => {
  try {
    const endpoint = req.body && req.body.endpoint;
    if (!endpoint) return res.status(400).json({ error: { message: 'Missing endpoint.' } });
    await hasuraGql(`mutation($e:String!){delete_agri_weather_alerts(where:{endpoint:{_eq:$e}}){affected_rows}}`, { e: endpoint });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: { message: e.message || 'Could not turn off alerts.' } });
  }
});

async function fetchRainForecast(lat, lon) {
  const u = new URL('https://api.open-meteo.com/v1/forecast');
  u.searchParams.set('latitude', lat);
  u.searchParams.set('longitude', lon);
  u.searchParams.set('hourly', 'precipitation_probability,precipitation');
  u.searchParams.set('timezone', 'Asia/Kolkata');
  u.searchParams.set('forecast_days', '2');
  const r = await fetch(u, { signal: AbortSignal.timeout(15000) });
  const j = await r.json();
  if (!r.ok || !j.hourly) throw new Error('Weather service error.');
  return j.hourly;
}

const WATER_HOURS = [6, 10, 14, 18]; // IST hours for the water reminder
let wxBusy = false;
async function runWeatherAlerts(opts = {}) {
  if (wxBusy) return { skipped: true };
  wxBusy = true;
  const stats = { subscribers: 0, daily: 0, rain: 0, water: 0, emails: 0, errors: 0 };
  try {
    const data = await hasuraGql(`query { agri_weather_alerts { id endpoint subscription email lat lon place rain_on water_on last_rain_key last_water_key last_daily_key } }`);
    const rows = data.agri_weather_alerts || [];
    stats.subscribers = rows.length;
    const { date, hour } = istNow();
    const nowKey = `${date}T${String(hour).padStart(2, '0')}:00`;
    const memo = new Map();

    for (const row of rows) {
      try {
        const set = {};
        const rainKey = date; // rain alert: at most ONE per day

        // Rain alert: ONE message per day (phone push + verified email), sent when rain is expected in the next 3 hours
        if (row.rain_on && row.last_rain_key !== rainKey) {
          const k = row.lat.toFixed(2) + '|' + row.lon.toFixed(2);
          if (!memo.has(k)) memo.set(k, fetchRainForecast(row.lat, row.lon));
          const h = await memo.get(k);
          const i = h.time.indexOf(nowKey);
          if (i >= 0) {
            let maxP = 0, mm = 0, startAt = null;
            for (let x = i; x < Math.min(i + 3, h.time.length); x++) {
              const p = h.precipitation_probability[x] || 0;
              if (p >= 60 || (h.precipitation[x] || 0) >= 0.5) { if (!startAt) startAt = h.time[x].slice(11, 16); }
              maxP = Math.max(maxP, p); mm += h.precipitation[x] || 0;
            }
            if (startAt) {
              const place = row.place || 'your area';
              const title = `🌧️ Rain expected near ${place}`;
              const body = `${maxP}% chance of rain, about ${mm.toFixed(1)} mm in the next 3 hours (from ${startAt}). Hold spraying and fertiliser, and clear field drains.`;
              let pushed = false, mailed = false;
              try { pushed = await pushWeather(row, { tag: 'wx-rain', title, body }); }
              catch (e) { console.error('Rain push failed:', e.message); }
              if (row.email && emailConfigured()) {
                try {
                  await sendMail({ to: row.email, subject: title, text: `${body}\n\nOpen Agrinova Weather for the full forecast.` });
                  mailed = true; stats.emails++;
                } catch (e) { console.error('Rain email failed:', e.message); }
              }
              if (pushed || mailed) { set.last_rain_key = rainKey; stats.rain++; }
            }
          }
        }

        // Water reminder 4 times a day (6 AM, 10 AM, 2 PM, 6 PM IST): phone push AND email
        const waterKey = `${date}:${hour}`;
        if (row.water_on && ((WATER_HOURS.includes(hour) && row.last_water_key !== waterKey) || opts.testWater)) {
          const wTitle = '💧 Water reminder';
          const wBody = 'Time to check your crop water. Check soil moisture and irrigate if the soil is dry.';
          let pushed = false, mailed = false;
          try { pushed = await pushWeather(row, { tag: 'wx-water', title: wTitle, body: wBody }); }
          catch (e) { console.error('Water push failed:', e.message); }
          if (row.email && emailConfigured()) {
            try {
              await sendMail({ to: row.email, subject: wTitle, text: `${wBody}\n\nOpen Agrinova Weather for the full forecast and irrigation advice.` });
              mailed = true; stats.emails++;
            } catch (e) { console.error('Water email failed:', e.message); }
          }
          if (pushed || mailed) { set.last_water_key = waterKey; stats.water++; }
        }

        if (Object.keys(set).length) {
          await hasuraGql(`mutation($id:Int!,$s:agri_weather_alerts_set_input!){update_agri_weather_alerts_by_pk(pk_columns:{id:$id},_set:$s){id}}`, { id: row.id, s: set });
        }
      } catch (e) {
        stats.errors++;
        console.error('Weather alert failed for one subscriber:', e.message);
      }
    }
  } finally { wxBusy = false; }
  console.log('weather alert run:', JSON.stringify(stats));
  return stats;
}

// cron-job.org: call every 15 min -> /api/weather-alerts/check?secret=YOUR_CRON_SECRET
app.all('/api/weather-alerts/check', async (req, res) => {
  if (!CRON_SECRET || req.query.secret !== CRON_SECRET) return res.status(401).json({ error: { message: 'Unauthorized.' } });
  try { res.json(await runWeatherAlerts({ testWater: req.query.test === 'water' })); }  // add &test=water to send a water reminder right now
  catch (e) { res.status(400).json({ error: { message: e.message } }); }
});
if (process.env.HASURA_GRAPHQL_URL && process.env.HASURA_ADMIN_SECRET && process.env.VAPID_PUBLIC_KEY) {
  setInterval(() => { runWeatherAlerts().catch(e => console.error('Weather run failed:', e.message)); }, 15 * 60 * 1000);
  // also run once shortly after the server wakes up / restarts, so a sleeping Render server does not miss the hour
  setTimeout(() => { runWeatherAlerts().catch(e => console.error('Weather first run failed:', e.message)); }, 30 * 1000);
}

/* Debug helper: open /api/price-debug?state=Tamil%20Nadu&crop=Tomato in the browser
   to see exactly what Agmarknet returns and why live data is or isn't used. */
app.get('/api/price-debug', async (req, res) => {
  const state = req.query.state || 'Tamil Nadu';
  const crop = req.query.crop || 'Tomato';
  const names = AGMARK_NAMES[crop] || null;
  const out = {
    hasDataGovKey: !!DATA_GOV_API_KEY,
    hasGeminiKey: !!GEMINI_API_KEY,
    state, crop,
    agmarknetNames: names,
    tries: []
  };
  for (const name of (names || [])) {
    try {
      const recs = await fetchAgmark(state, name);
      out.tries.push({
        commodity: name,
        records: recs.length,
        latestDate: recs.length ? recs.map(r => r.arrival_date).sort().pop() : null,
        sample: recs[0] || null
      });
    } catch (e) {
      out.tries.push({ commodity: name, error: e.message });
    }
  }
  res.json(out);
});

/* ===================== PASSWORD RESET CODE (OTP) EMAIL (used by forgot.html) ===================== */
// forgot.html asks for a 6-digit code here, the farmer types it in, and only after the code is
// verified does the page let them set a new password. Uses the same Brevo setup as the weather emails.
const resetCodes = new Map(); // email -> { hash, exp, tries, sends:[timestamps] }
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of resetCodes) if ((!v.exp || v.exp < now) && !v.sends.some(t => now - t < 3600000)) resetCodes.delete(k);
}, 10 * 60 * 1000);
app.use('/api/auth', rateLimit(10, 60 * 1000));
const resetHash = (email, code) => crypto.createHash('sha256').update('reset|' + email + '|' + code + '|' + MAIL_SECRET).digest('hex');

app.post('/api/auth/send-reset-code', async (req, res) => {
  try {
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    const name = String((req.body && req.body.name) || '').trim().replace(/[\r\n]/g, ' ').slice(0, 60);
    if (!EMAIL_RE.test(email) || email.length > 120) return res.status(400).json({ error: { message: 'Enter a valid email address.' } });
    if (!emailConfigured()) return res.status(503).json({ error: { message: 'Email is not set up on the server yet (BREVO_API_KEY / EMAIL_FROM).' } });

    const now = Date.now();
    const rec = resetCodes.get(email) || { sends: [], hash: null, exp: 0, tries: 0 };
    rec.sends = rec.sends.filter(t => now - t < 3600000);
    if (rec.sends.length && now - rec.sends[rec.sends.length - 1] < 30000) {
      return res.status(429).json({ error: { message: 'Please wait 30 seconds before asking for a new code.' } });
    }
    if (rec.sends.length >= 5) {
      return res.status(429).json({ error: { message: 'Too many codes requested for this email. Try again in an hour.' } });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    await sendMail({
      to: email,
      fromName: 'Smart Agriculture',
      subject: `Your Smart Agriculture password reset code: ${code}`,
      text: `Hi ${name || 'there'},\n\nYour password reset code is ${code}.\n\nIt works for 10 minutes. If you did not ask to reset your password, you can ignore this email and your password will stay the same.`
    });
    rec.sends.push(now); rec.hash = resetHash(email, code); rec.exp = now + 10 * 60 * 1000; rec.tries = 0;
    resetCodes.set(email, rec);
    res.json({ ok: true });
  } catch (e) {
    console.error('Send reset code failed:', e.message);
    const known = /^(Email service|EMAIL_FROM|Email sending)/.test(e.message || '');
    res.status(400).json({ error: { message: known ? e.message : 'Could not send the email. Please try again.' } });
  }
});

app.post('/api/auth/verify-reset-code', (req, res) => {
  const email = String((req.body && req.body.email) || '').trim().toLowerCase();
  const code = String((req.body && req.body.code) || '').trim();
  const rec = resetCodes.get(email);
  if (!rec || !rec.hash || rec.exp < Date.now()) return res.status(400).json({ error: { message: 'This code has expired. Please ask for a new one.' } });
  if (rec.tries >= 5) { rec.hash = null; return res.status(400).json({ error: { message: 'Too many wrong attempts. Please ask for a new code.' } }); }
  rec.tries++;
  if (resetHash(email, code) !== rec.hash) return res.status(400).json({ error: { message: 'Wrong code. Please check and try again.' } });
  rec.hash = null; // single use
  res.json({ ok: true });
});

/* ===================== CHAT HISTORY (Hasura tables: chats + chat_messages) ===================== */
// chatbot.html calls these routes (instead of talking to Hasura directly), so Hasura is only
// reached with the admin secret from here — no public database permissions needed, and each
// farmer only sees their own chats. "owner" = the farmer's email, or a random per-browser id.
// All routes are GET/POST only, so the existing CORS settings keep working.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function chatGuard(req, res, next) {
  const raw = String((req.body && req.body.owner) || req.query.owner || '').trim();
  if (!/^[A-Za-z0-9_@.+-]{3,120}$/.test(raw)) return res.status(400).json({ error: { message: 'Missing or invalid owner.' } });
  if (req.params.id) {
    if (!/^[0-9]{1,9}$/.test(req.params.id)) return res.status(400).json({ error: { message: 'Invalid chat id.' } });
    req.chatId = parseInt(req.params.id, 10);   // chat ids are numbers: 1, 2, 3 ...
  }
  req.owner = raw;
  next();
}

async function ownsChat(id, owner) {
  const d = await hasuraGql(
    `query($id:Int!,$o:String!){ chats: agri_chats(where:{id:{_eq:$id},owner:{_eq:$o}}){ id title } }`,
    { id, o: owner });
  return d.chats[0] || null;
}

const chatErr = (res, e) => res.status(400).json({ error: { message: e.message || 'Chat history error.' } });
const notFound = res => res.status(404).json({ error: { message: 'Chat not found.' } });

// List this owner's chats, newest activity first
app.get('/api/chats', chatGuard, async (req, res) => {
  try {
    const d = await hasuraGql(
      `query($o:String!){ chats: agri_chats(where:{owner:{_eq:$o}}, order_by:{updated_at:desc}, limit:50){ id title created_at } }`,
      { o: req.owner });
    res.json({ chats: d.chats });
  } catch (e) { chatErr(res, e); }
});

// Create a chat: body { owner, name?, email? }
app.post('/api/chats', chatGuard, async (req, res) => {
  try {
    const d = await hasuraGql(
      `mutation($o:agri_chats_insert_input!){ insert_chats_one: insert_agri_chats_one(object:$o){ id title created_at } }`,
      { o: {
          owner: req.owner,
          title: 'New chat',
          farmer_name: String(req.body.name || '').slice(0, 80) || null,
          farmer_email: String(req.body.email || '').slice(0, 120) || null
      } });
    res.json({ chat: d.insert_chats_one });
  } catch (e) { chatErr(res, e); }
});

// All messages of one chat
app.get('/api/chats/:id/messages', chatGuard, async (req, res) => {
  try {
    if (!(await ownsChat(req.chatId, req.owner))) return notFound(res);
    const d = await hasuraGql(
      `query($id:Int!){ chat_messages: agri_chat_messages(where:{chat_id:{_eq:$id}}, order_by:{created_at:asc}, limit:500){ id sender message created_at } }`,
      { id: req.chatId });
    res.json({ messages: d.chat_messages });
  } catch (e) { chatErr(res, e); }
});

// Save messages: body { owner, messages:[{ sender:'user'|'ai', message }] }. Auto-titles a "New chat".
app.post('/api/chats/:id/messages', chatGuard, async (req, res) => {
  try {
    const chat = await ownsChat(req.chatId, req.owner);
    if (!chat) return notFound(res);
    const objects = (Array.isArray(req.body.messages) ? req.body.messages : [])
      .filter(m => m && (m.sender === 'user' || m.sender === 'ai') && String(m.message || '').trim())
      .slice(0, 20)
      .map(m => ({ chat_id: req.chatId, sender: m.sender, message: String(m.message).slice(0, 8000) }));
    if (!objects.length) return res.json({ ok: true });
    const set = { updated_at: 'now()' };
    if (chat.title === 'New chat') {
      const first = objects.find(o => o.sender === 'user');
      if (first) set.title = first.message.replace(/\s+/g, ' ').trim().slice(0, 32);
    }
    await hasuraGql(
      `mutation($o:[agri_chat_messages_insert_input!]!,$id:Int!,$s:agri_chats_set_input!){
         insert_agri_chat_messages(objects:$o){ affected_rows }
         update_agri_chats_by_pk(pk_columns:{id:$id}, _set:$s){ id } }`,
      { o: objects, id: req.chatId, s: set });
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/chats/:id/rename', chatGuard, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim().slice(0, 60);
    if (!title) return res.status(400).json({ error: { message: 'Title is empty.' } });
    if (!(await ownsChat(req.chatId, req.owner))) return notFound(res);
    await hasuraGql(`mutation($id:Int!,$t:String!){ update_agri_chats_by_pk(pk_columns:{id:$id}, _set:{title:$t}){ id } }`,
      { id: req.chatId, t: title });
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

// "Clear" button: remove the messages of this chat and reset its title
app.post('/api/chats/:id/clear', chatGuard, async (req, res) => {
  try {
    if (!(await ownsChat(req.chatId, req.owner))) return notFound(res);
    await hasuraGql(
      `mutation($id:Int!){
         delete_agri_chat_messages(where:{chat_id:{_eq:$id}}){ affected_rows }
         update_agri_chats_by_pk(pk_columns:{id:$id}, _set:{title:"New chat"}){ id } }`,
      { id: req.chatId });
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

// Delete a chat and its messages
app.post('/api/chats/:id/delete', chatGuard, async (req, res) => {
  try {
    if (!(await ownsChat(req.chatId, req.owner))) return res.json({ ok: true });
    await hasuraGql(
      `mutation($id:Int!){
         delete_agri_chat_messages(where:{chat_id:{_eq:$id}}){ affected_rows }
         delete_agri_chats_by_pk(id:$id){ id } }`,
      { id: req.chatId });
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

// ---- Disease diagnoses history (saved through the backend, browser never touches the DB) ----
app.use('/api/diagnoses', rateLimit(30, 60 * 1000));

app.post('/api/diagnoses', chatGuard, async (req, res) => {
  try {
    const b = req.body || {};
    const str = (v, n) => (v == null || v === '') ? null : String(v).slice(0, n);
    const int = v => (typeof v === 'number' && isFinite(v)) ? Math.round(v) : null;
    await hasuraGql(
      `mutation($o: agri_diagnoses_insert_input!){ insert_agri_diagnoses_one(object:$o){ id } }`,
      { o: {
          owner: req.owner,
          disease_name: str(b.diseaseName, 200),
          latin_name: str(b.latinName, 200),
          crop: str(b.crop, 100),
          status: str(b.status, 40),
          confidence: int(b.confidence),
          severity: int(b.severity),
          description: str(b.description, 4000),
          actions: Array.isArray(b.actions) ? b.actions.slice(0, 10).map(a => String(a).slice(0, 500)) : [],
          note: str(b.note, 2000),
          farmer_name: str(b.name, 80),
          farmer_email: str(b.email, 120)
      } });
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

app.get('/api/diagnoses', chatGuard, async (req, res) => {
  try {
    const d = await hasuraGql(
      `query($o:String!){ diagnoses: agri_diagnoses(where:{owner:{_eq:$o}}, order_by:{created_at:desc}, limit:50){ id disease_name crop status confidence severity created_at } }`,
      { o: req.owner });
    res.json({ diagnoses: d.diagnoses });
  } catch (e) { chatErr(res, e); }
});

// ---- Owner check for endpoints whose ids are numbers (not uuids) ----
function ownerGuard(req, res, next) {
  const raw = String((req.body && req.body.owner) || req.query.owner || '').trim();
  if (!/^[A-Za-z0-9_@.+-]{3,120}$/.test(raw)) return res.status(400).json({ error: { message: 'Missing or invalid owner.' } });
  req.owner = raw;
  next();
}
const numOrNull = v => (v === '' || v == null || !isFinite(Number(v))) ? null : Number(v);
const txt = (v, n) => (v == null || v === '') ? null : String(v).slice(0, n);

// ---- Profit calculator history ----
app.use(['/api/calculations', '/api/feedback'], rateLimit(30, 60 * 1000));

app.get('/api/calculations', ownerGuard, async (req, res) => {
  try {
    const d = await hasuraGql(
      `query($o:String!){ calculations: agri_profit_calculations(where:{owner:{_eq:$o}}, order_by:{created_at:desc}, limit:20){
         id crop area season district expense revenue profit percentage created_at } }`,
      { o: req.owner });
    res.json({ calculations: d.calculations });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/calculations', ownerGuard, async (req, res) => {
  try {
    const b = req.body || {};
    const d = await hasuraGql(
      `mutation($o: agri_profit_calculations_insert_input!){ insert_agri_profit_calculations_one(object:$o){ id created_at } }`,
      { o: {
          owner: req.owner,
          crop: txt(b.crop, 100), season: txt(b.season, 60), district: txt(b.district, 80),
          area: numOrNull(b.area), expense: numOrNull(b.expense), revenue: numOrNull(b.revenue),
          profit: numOrNull(b.profit), percentage: numOrNull(b.percentage)
      } });
    res.json({ id: d.insert_agri_profit_calculations_one.id });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/calculations/delete', ownerGuard, async (req, res) => {
  try {
    const id = parseInt(req.body && req.body.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: { message: 'Invalid id.' } });
    await hasuraGql(
      `mutation($id:Int!,$o:String!){ delete_agri_profit_calculations(where:{id:{_eq:$id},owner:{_eq:$o}}){ affected_rows } }`,
      { id, o: req.owner });
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/calculations/clear', ownerGuard, async (req, res) => {
  try {
    await hasuraGql(
      `mutation($o:String!){ delete_agri_profit_calculations(where:{owner:{_eq:$o}}){ affected_rows } }`,
      { o: req.owner });
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

// ---- Feedback (anonymous allowed: owner falls back to "anonymous") ----
app.post('/api/feedback', ownerGuard, async (req, res) => {
  try {
    const b = req.body || {};
    const message = txt(b.message, 4000);
    if (!message) return res.status(400).json({ error: { message: 'Feedback is empty.' } });
    const rating = numOrNull(b.rating);
    const CATS = ['general', 'suggestion', 'bug', 'compliment', 'other'];
    const category = CATS.includes(String(b.category || '').toLowerCase()) ? String(b.category).toLowerCase() : 'general';
    const isHelpful = typeof b.is_helpful === 'boolean' ? b.is_helpful : (rating != null ? rating >= 3 : null);
    const base = {
      owner: req.owner,
      farmer_name: txt(b.name, 80),
      module: txt(b.module, 60) || 'general',
      rating: rating >= 1 && rating <= 5 ? Math.round(rating) : null,
      message
    };
    const MUT = `mutation($o: agri_farmer_feedback_insert_input!){ insert_agri_farmer_feedback_one(object:$o){ id } }`;
    try {
      await hasuraGql(MUT, { o: Object.assign({}, base, { category, is_helpful: isHelpful }) });
    } catch (e1) {
      // If category / is_helpful columns have a different type, still save the feedback itself.
      console.warn('Feedback: extended insert failed, retrying basic:', e1.message);
      await hasuraGql(MUT, { o: base });
    }
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

// ---- Crop recommendation history (also logged in the activity log) ----
app.use('/api/crop-recommendations', rateLimit(30, 60 * 1000));

app.post('/api/crop-recommendations', ownerGuard, async (req, res) => {
  try {
    const b = req.body || {};
    const rec = {
      owner: req.owner,
      soil: txt(b.soil, 40), weather: txt(b.weather, 40), water: txt(b.water, 40),
      season: txt(b.season, 40), district: txt(b.district, 80),
      temperature: numOrNull(b.temperature), rainfall: numOrNull(b.rainfall),
      recommended_crop: txt(b.crop, 100), fertilizer: txt(b.fertilizer, 200),
      irrigation: txt(b.irrigation, 100), harvest_time: txt(b.harvest, 60),
      expected_yield: txt(b.expectedYield, 80), expected_profit: txt(b.profit, 60),
      suitability: txt(b.suitability, 20), other_crops: txt(b.otherCrops, 200), tip: txt(b.tip, 600)
    };
    const log = {
      owner: req.owner, module: 'crop_recommendation', action: 'recommend',
      input: { soil: rec.soil, weather: rec.weather, water: rec.water, season: rec.season,
               district: rec.district, temperature: rec.temperature, rainfall: rec.rainfall },
      result: { crop: rec.recommended_crop, suitability: rec.suitability }
    };
    // both inserts run in one transaction
    const d = await hasuraGql(
      `mutation($r: agri_crop_advisory_records_insert_input!, $l: agri_farmer_activity_log_insert_input!){
         insert_agri_crop_advisory_records_one(object:$r){ id }
         insert_agri_farmer_activity_log_one(object:$l){ id } }`,
      { r: rec, l: log });
    res.json({ id: d.insert_agri_crop_advisory_records_one.id });
  } catch (e) { chatErr(res, e); }
});

app.get('/api/crop-recommendations', ownerGuard, async (req, res) => {
  try {
    const d = await hasuraGql(
      `query($o:String!){ recommendations: agri_crop_advisory_records(where:{owner:{_eq:$o}}, order_by:{created_at:desc}, limit:20){
         id recommended_crop suitability soil season district temperature rainfall fertilizer irrigation harvest_time expected_yield expected_profit created_at } }`,
      { o: req.owner });
    res.json({ recommendations: d.recommendations });
  } catch (e) { chatErr(res, e); }
});

// ---- Soil reports (also logged in the activity log) ----
app.use('/api/soil-reports', rateLimit(30, 60 * 1000));

app.post('/api/soil-reports', ownerGuard, async (req, res) => {
  try {
    const b = req.body || {};
    const rec = {
      owner: req.owner,
      state: txt(b.state, 80), district: txt(b.district, 80), soil_type: txt(b.soilType, 40),
      land_area: numOrNull(b.landArea), ph: numOrNull(b.ph),
      nitrogen: numOrNull(b.nitrogen), phosphorus: numOrNull(b.phosphorus), potassium: numOrNull(b.potassium)
    };
    const d = await hasuraGql(
      `mutation($r: agri_soil_reports_insert_input!){ insert_agri_soil_reports_one(object:$r){ id } }`,
      { r: rec });
    const reportId = d.insert_agri_soil_reports_one.id;
    // activity log is secondary: it links back to the saved report, and never blocks the save
    try {
      await hasuraGql(
        `mutation($l: agri_farmer_activity_log_insert_input!){ insert_agri_farmer_activity_log_one(object:$l){ id } }`,
        { l: {
            owner: req.owner, module: 'soil_information', action: 'analyze',
            input: { state: rec.state, district: rec.district, soil_type: rec.soil_type, land_area: rec.land_area,
                     ph: rec.ph, nitrogen: rec.nitrogen, phosphorus: rec.phosphorus, potassium: rec.potassium },
            result: { report_id: reportId, soil_type: rec.soil_type }
        } });
    } catch (logErr) { console.error('Activity log failed:', logErr.message); }
    res.json({ id: reportId });
  } catch (e) { chatErr(res, e); }
});

app.get('/api/soil-reports', ownerGuard, async (req, res) => {
  try {
    const d = await hasuraGql(
      `query($o:String!){ reports: agri_soil_reports(where:{owner:{_eq:$o}}, order_by:{created_at:desc}, limit:20){
         id state district soil_type land_area ph nitrogen phosphorus potassium created_at } }`,
      { o: req.owner });
    res.json({ reports: d.reports });
  } catch (e) { chatErr(res, e); }
});

// ---- Fertilizer advice + usage history ----
app.use(['/api/fertilizer-advice', '/api/fertilizer-usage'], rateLimit(40, 60 * 1000));
const dateOrNull = v => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) ? v : null;

app.post('/api/fertilizer-advice', ownerGuard, async (req, res) => {
  try {
    const b = req.body || {};
    const rec = {
      owner: req.owner,
      crop: txt(b.crop, 60), soil: txt(b.soil, 60), area: numOrNull(b.area),
      n_level: txt(b.nLevel, 20), p_level: txt(b.pLevel, 20), k_level: txt(b.kLevel, 20),
      recommended_fertilizer: txt(b.recommended, 600), quantity: txt(b.quantity, 60),
      plan: Array.isArray(b.plan) ? b.plan.slice(0, 12).map(r => ({ fertilizer: txt(r && r.fertilizer, 80), kg: numOrNull(r && r.kg) })) : []
    };
    const log = {
      owner: req.owner, module: 'fertilizer', action: 'recommend',
      input: { crop: rec.crop, soil: rec.soil, area: rec.area, n: rec.n_level, p: rec.p_level, k: rec.k_level },
      result: { recommended: rec.recommended_fertilizer, quantity: rec.quantity }
    };
    const d = await hasuraGql(
      `mutation($r: agri_fertilizer_advisories_insert_input!, $l: agri_farmer_activity_log_insert_input!){
         insert_agri_fertilizer_advisories_one(object:$r){ id }
         insert_agri_farmer_activity_log_one(object:$l){ id } }`,
      { r: rec, l: log });
    res.json({ id: d.insert_agri_fertilizer_advisories_one.id });
  } catch (e) { chatErr(res, e); }
});

app.get('/api/fertilizer-usage', ownerGuard, async (req, res) => {
  try {
    const d = await hasuraGql(
      `query($o:String!){ usage: agri_fertilizer_usage(where:{owner:{_eq:$o}}, order_by:{id:asc}, limit:200){
         id used_on crop_key fert_keys quantity rating notes } }`,
      { o: req.owner });
    res.json({ usage: d.usage });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/fertilizer-usage', ownerGuard, async (req, res) => {
  try {
    const b = req.body || {};
    const row = {
      owner: req.owner,
      crop_key: txt(b.cropV, 60),
      fert_keys: Array.isArray(b.fertVs) ? b.fertVs.slice(0, 20).map(x => String(x).slice(0, 60)) : [],
      quantity: txt(b.qty, 120),
      rating: numOrNull(b.rating) || 0,
      notes: txt(b.notes, 1000) || ''
    };
    const day = dateOrNull(b.date);
    if (day) row.used_on = day;
    const d = await hasuraGql(
      `mutation($r: agri_fertilizer_usage_insert_input!){ insert_agri_fertilizer_usage_one(object:$r){ id } }`,
      { r: row });
    res.json({ id: d.insert_agri_fertilizer_usage_one.id });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/fertilizer-usage/update', ownerGuard, async (req, res) => {
  try {
    const b = req.body || {};
    const id = parseInt(b.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: { message: 'Invalid id.' } });
    const rating = Math.max(0, Math.min(5, Math.round(numOrNull(b.rating) || 0)));
    await hasuraGql(
      `mutation($id:Int!,$o:String!,$s: agri_fertilizer_usage_set_input!){
         update_agri_fertilizer_usage(where:{id:{_eq:$id},owner:{_eq:$o}}, _set:$s){ affected_rows } }`,
      { id, o: req.owner, s: { rating, notes: txt(b.notes, 1000) || '' } });
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/fertilizer-usage/delete', ownerGuard, async (req, res) => {
  try {
    const id = parseInt(req.body && req.body.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: { message: 'Invalid id.' } });
    await hasuraGql(
      `mutation($id:Int!,$o:String!){ delete_agri_fertilizer_usage(where:{id:{_eq:$id},owner:{_eq:$o}}){ affected_rows } }`,
      { id, o: req.owner });
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

// ---- Market price searches (also logged in the activity log) ----
app.use('/api/market-searches', rateLimit(40, 60 * 1000));

app.post('/api/market-searches', ownerGuard, async (req, res) => {
  try {
    const b = req.body || {};
    const rec = {
      owner: req.owner,
      state: txt(b.state, 80), district: txt(b.district, 80), market: txt(b.market, 120), crop: txt(b.crop, 100),
      quantity_kg: numOrNull(b.qty),
      min_price: numOrNull(b.min), max_price: numOrNull(b.max), modal_price: numOrNull(b.modal),
      unit: txt(b.unit, 40), source: txt(b.source, 20), price_date: txt(b.priceDate, 40)
    };
    const log = {
      owner: req.owner, module: 'market_prices', action: 'view_price',
      input: { state: rec.state, district: rec.district, market: rec.market, crop: rec.crop, quantity_kg: rec.quantity_kg },
      result: { min: rec.min_price, max: rec.max_price, modal: rec.modal_price, unit: rec.unit, source: rec.source }
    };
    const d = await hasuraGql(
      `mutation($r: agri_market_price_searches_insert_input!, $l: agri_farmer_activity_log_insert_input!){
         insert_agri_market_price_searches_one(object:$r){ id }
         insert_agri_farmer_activity_log_one(object:$l){ id } }`,
      { r: rec, l: log });
    res.json({ id: d.insert_agri_market_price_searches_one.id });
  } catch (e) { chatErr(res, e); }
});

app.get('/api/market-searches', ownerGuard, async (req, res) => {
  try {
    const d = await hasuraGql(
      `query($o:String!){ searches: agri_market_price_searches(where:{owner:{_eq:$o}}, order_by:{id:desc}, limit:30){
         id state district market crop quantity_kg min_price max_price modal_price unit source price_date created_at } }`,
      { o: req.owner });
    res.json({ searches: d.searches });
  } catch (e) { chatErr(res, e); }
});

// ---- Saved government schemes (bookmarks) ----
app.use('/api/scheme-bookmarks', rateLimit(40, 60 * 1000));

app.get('/api/scheme-bookmarks', ownerGuard, async (req, res) => {
  try {
    const d = await hasuraGql(
      `query($o:String!){ bookmarks: agri_scheme_bookmarks(where:{owner:{_eq:$o}}, order_by:{id:desc}, limit:100){
         id scheme_id name category link benefits status created_at } }`,
      { o: req.owner });
    res.json({ bookmarks: d.bookmarks });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/scheme-bookmarks', ownerGuard, async (req, res) => {
  try {
    const b = req.body || {};
    const name = txt(b.name, 200);
    if (!name) return res.status(400).json({ error: { message: 'Scheme name is missing.' } });
    const row = {
      owner: req.owner,
      scheme_id: name.toLowerCase().replace(/\s+/g, ' ').slice(0, 200),   // schemes have no id, the name is the key
      name, category: txt(b.category, 30), link: txt(b.link, 500), benefits: txt(b.benefits, 600),
      status: b.status === 'applied' ? 'applied' : 'saved'
    };
    const ex = await hasuraGql(
      `query($o:String!,$s:String!){ agri_scheme_bookmarks(where:{owner:{_eq:$o},scheme_id:{_eq:$s}}, limit:1){ id } }`,
      { o: row.owner, s: row.scheme_id });
    if (ex.agri_scheme_bookmarks.length) {
      const id = ex.agri_scheme_bookmarks[0].id;
      await hasuraGql(
        `mutation($id:Int!,$st:String!){ update_agri_scheme_bookmarks_by_pk(pk_columns:{id:$id}, _set:{status:$st}){ id } }`,
        { id, st: row.status });
      return res.json({ id });
    }
    const d = await hasuraGql(
      `mutation($r: agri_scheme_bookmarks_insert_input!){ insert_agri_scheme_bookmarks_one(object:$r){ id } }`,
      { r: row });
    res.json({ id: d.insert_agri_scheme_bookmarks_one.id });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/scheme-bookmarks/delete', ownerGuard, async (req, res) => {
  try {
    const id = parseInt(req.body && req.body.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: { message: 'Invalid id.' } });
    await hasuraGql(
      `mutation($id:Int!,$o:String!){ delete_agri_scheme_bookmarks(where:{id:{_eq:$id},owner:{_eq:$o}}){ affected_rows } }`,
      { id, o: req.owner });
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

// ---- Farm expense log (table: agri.farm_expenses) ----
app.use(['/api/expenses', '/api/watchlist'], rateLimit(60, 60 * 1000));

app.get('/api/expenses', ownerGuard, async (req, res) => {
  try {
    const d = await hasuraGql(
      `query($o:String!){ expenses: agri_farm_expenses(where:{owner:{_eq:$o}}, order_by:[{expense_date:desc},{id:desc}], limit:200){
         id crop category amount expense_date note created_at } }`,
      { o: req.owner });
    res.json({ expenses: d.expenses });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/expenses', ownerGuard, async (req, res) => {
  try {
    const b = req.body || {};
    const amount = numOrNull(b.amount);
    if (amount == null || amount <= 0) return res.status(400).json({ error: { message: 'Enter a valid amount.' } });
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b.expense_date || '')) ? b.expense_date : new Date().toISOString().slice(0, 10);
    const d = await hasuraGql(
      `mutation($o: agri_farm_expenses_insert_input!){ insert_agri_farm_expenses_one(object:$o){ id } }`,
      { o: { owner: req.owner, crop: txt(b.crop, 100), category: txt(b.category, 60) || 'Other', amount, expense_date: date, note: txt(b.note, 200) } });
    res.json({ id: d.insert_agri_farm_expenses_one.id });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/expenses/update', ownerGuard, async (req, res) => {
  try {
    const b = req.body || {};
    const id = parseInt(b.id, 10);
    const amount = numOrNull(b.amount);
    if (!Number.isInteger(id)) return res.status(400).json({ error: { message: 'Invalid id.' } });
    if (amount == null || amount <= 0) return res.status(400).json({ error: { message: 'Enter a valid amount.' } });
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b.expense_date || '')) ? b.expense_date : new Date().toISOString().slice(0, 10);
    await hasuraGql(
      `mutation($id:Int!,$o:String!,$s:agri_farm_expenses_set_input!){ update_agri_farm_expenses(where:{id:{_eq:$id},owner:{_eq:$o}}, _set:$s){ affected_rows } }`,
      { id, o: req.owner, s: { crop: txt(b.crop, 100), category: txt(b.category, 60) || 'Other', amount, expense_date: date, note: txt(b.note, 200) } });
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/expenses/delete', ownerGuard, async (req, res) => {
  try {
    const id = parseInt(req.body && req.body.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: { message: 'Invalid id.' } });
    await hasuraGql(
      `mutation($id:Int!,$o:String!){ delete_agri_farm_expenses(where:{id:{_eq:$id},owner:{_eq:$o}}){ affected_rows } }`,
      { id, o: req.owner });
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

// ---- Market watchlist (table: agri.market_watchlist) ----
app.get('/api/watchlist', ownerGuard, async (req, res) => {
  try {
    const d = await hasuraGql(
      `query($o:String!){ items: agri_market_watchlist(where:{owner:{_eq:$o}}, order_by:{id:desc}, limit:50){
         id crop state district market target_price created_at } }`,
      { o: req.owner });
    res.json({ items: d.items });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/watchlist', ownerGuard, async (req, res) => {
  try {
    const b = req.body || {};
    const crop = txt(b.crop, 100);
    if (!crop) return res.status(400).json({ error: { message: 'Crop is missing.' } });
    const market = txt(b.market, 120) || '';
    // already there? (no unique constraint needed)
    const ex = await hasuraGql(
      `query($o:String!,$c:String!,$m:String!){ agri_market_watchlist(where:{owner:{_eq:$o},crop:{_eq:$c},market:{_eq:$m}}, limit:1){ id } }`,
      { o: req.owner, c: crop, m: market });
    if (ex.agri_market_watchlist.length) return res.json({ id: ex.agri_market_watchlist[0].id, existed: true });
    const d = await hasuraGql(
      `mutation($o: agri_market_watchlist_insert_input!){ insert_agri_market_watchlist_one(object:$o){ id } }`,
      { o: { owner: req.owner, crop, market, state: txt(b.state, 80), district: txt(b.district, 80), target_price: numOrNull(b.target_price) } });
    res.json({ id: d.insert_agri_market_watchlist_one.id });
  } catch (e) { chatErr(res, e); }
});

app.post('/api/watchlist/delete', ownerGuard, async (req, res) => {
  try {
    const id = parseInt(req.body && req.body.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: { message: 'Invalid id.' } });
    await hasuraGql(
      `mutation($id:Int!,$o:String!){ delete_agri_market_watchlist(where:{id:{_eq:$id},owner:{_eq:$o}}){ affected_rows } }`,
      { id, o: req.owner });
    res.json({ ok: true });
  } catch (e) { chatErr(res, e); }
});

// Health check — open /api/health to see what is configured (never shows secrets)
app.get('/api/health', async (req, res) => {
  const out = {
    ok: true,
    gemini: !!GEMINI_API_KEY,
    geminiModel: GEMINI_MODEL,
    geminiFallbackModel: GEMINI_FALLBACK_MODEL,
    dataGov: !!DATA_GOV_API_KEY,
    push: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    email: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
    emailApi: !!String(process.env.BREVO_API_KEY || '').trim(),
    emailFrom: !!String(process.env.EMAIL_FROM || '').trim(),
    hasuraUrlSet: !!String(process.env.HASURA_GRAPHQL_URL || '').trim(),
    hasuraSecretSet: !!String(process.env.HASURA_ADMIN_SECRET || '').trim(),
    schemesCached: !!schemesCache.data,
    hasura: false
  };
  try {
    await hasuraGql(`query { chats_aggregate { aggregate { count } } chat_messages_aggregate { aggregate { count } } }`);
    out.hasura = true;
  } catch (e) { out.hasuraError = e.message; }
  res.json(out);
});

app.get('/', (req, res) => res.send('AgriNova backend is running.'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AgriNova backend running on port ${PORT}`));
