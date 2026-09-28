// AgriNova backend — handles:
//   1. /hasura/diagnose — leaf-photo disease diagnosis, called by Hasura Action (Gemini vision)
//   2. /api/chat        — agriculture chatbot, called DIRECTLY by chatbot.html (Gemini text)
//   3. /api/chat-image  — chatbot with photo attachment
//   4. /api/schemes     — government schemes list
//   5. /api/fertilizer  — fertilizer recommendation
//   6. /api/market-price — live Agmarknet mandi prices (data.gov.in) + Gemini fallback
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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.6-flash';

async function callGemini(parts, maxTokens = 700) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { maxOutputTokens: maxTokens }
      })
    }
  );
  const data = await response.json();
  if (!response.ok) {
    const err = new Error((data.error && data.error.message) || 'The AI service returned an error.');
    throw err;
  }
  const text = data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] &&
    data.candidates[0].content.parts[0].text;
  if (!text) {
    throw new Error('No text came back from the model.');
  }
  return text;
}

/* Gemini WITH Google Search grounding — reads today's prices from the web.
   (JSON mode can't be combined with search, so the caller parses the text.) */
async function callGeminiGrounded(parts, maxTokens = 1000) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        tools: [{ google_search: {} }],
        generationConfig: { maxOutputTokens: maxTokens }
      }),
      signal: AbortSignal.timeout(30000)
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error((data.error && data.error.message) || 'Search-grounded request failed.');
  }
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
      ], 900);
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
// Called directly by chatbot.html's fetch("/api/chat") — NOT through Hasura.
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, lang } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: { message: 'Missing message.' } });
    }
    if (!GEMINI_API_KEY) {
      return res.status(400).json({ error: { message: 'Server is missing GEMINI_API_KEY.' } });
    }

    // history comes as [{role: "user"|"assistant", content: "..."}] from the frontend.
    const historyText = Array.isArray(history) && history.length
      ? history.map(h => `${h.role === 'user' ? 'Farmer' : 'AgriNova Assistant'}: ${h.content}`).join('\n') + '\n'
      : '';

    const languageRule = lang === 'ta'
      ? `2. The app's language toggle is set to TAMIL. You MUST write your ENTIRE reply in the Tamil language, using Tamil (தமிழ்) script only — regardless of what script the farmer typed in (English, Tanglish, or Tamil). Do not mix in English sentences, and do not reply in Tanglish.`
      : lang === 'en'
      ? `2. The app's language toggle is set to ENGLISH. You MUST write your ENTIRE reply in plain English — regardless of what script the farmer typed in.`
      : `2. Match the farmer's exact language STYLE from their latest message:
   - If they wrote in pure English → reply in pure English.
   - If they wrote in Tamil script (தமிழ் எழுத்துக்கள்) → reply entirely in Tamil script.
   - If they wrote in "Tanglish" (Tamil words spelled out using English/Latin letters, e.g. "eppadi irukeenga", "enna panna venum") → reply in that SAME Tanglish style — Tamil words in Latin letters, casual and easy to read, NOT in Tamil script and NOT in formal English.
   Do not switch styles on your own; mirror exactly what the farmer used.`;

    const systemPrompt = `You are "AgriNova Assistant" (AgriAssist AI), a friendly, knowledgeable agricultural expert chatbot for a farming app. You help farmers with questions about crops, plant diseases, pests, fertilizers, irrigation, soil health, weather-related farming decisions, market/harvest timing, and general farming best practices.

RULES:
1. Only answer questions related to agriculture, farming, crops, plants, livestock basics, or the AgriNova app itself. If the farmer asks something completely unrelated (e.g. politics, entertainment, coding), politely say you can only help with farming and agriculture topics, and steer back.
${languageRule}
3. Keep answers practical, concise, and easy for a farmer to act on — prefer short paragraphs or bullet-style steps over long essays.
4. If you're not fully certain about something (e.g. exact chemical dosages, local regulations), say so and suggest confirming with a local agricultural extension officer.
5. Be warm and encouraging in tone, like a helpful local agricultural officer.
6. FORMATTING: Write in plain conversational text, like a text message. Do NOT use markdown syntax — no "###" headings, no "**bold**" asterisks, no numbered "1." lists. If you need to list a few steps, put each one on its own line starting with a simple dash "-", and keep the whole reply to a few short lines or a short paragraph. Avoid long essays; keep it skimmable on a small phone screen.
7. LENGTH: Keep replies SHORT by default — 2 to 5 sentences, or up to 5 short dash-bullet lines if listing steps. Only go longer if the farmer explicitly asks for more detail (e.g. "explain in detail", "give me everything").

${historyText}Farmer: ${message}
AgriNova Assistant:`;

    let text;
    try {
      text = await callGemini([{ text: systemPrompt }], 350);
    } catch (e) {
      console.error('Gemini API error (chat):', e);
      return res.status(400).json({ error: { message: e.message || 'The AI service returned an error.' } });
    }

    res.json({ reply: text.trim() });

  } catch (err) {
    console.error('Chat handler crashed:', err);
    res.status(400).json({ error: { message: 'Server error while chatting.' } });
  }
});

/* ===================== CHATBOT WITH PHOTO ATTACHMENT ===================== */
// Called when the farmer attaches a photo in the chat ("+" menu → Add photo).
// Reuses the same Gemini vision capability as the disease detector, but lets
// the farmer ask a free-form question about the photo instead of a fixed
// diagnosis format.
app.post('/api/chat-image', async (req, res) => {
  try {
    const { message, image, mediaType, history } = req.body || {};

    if (!image || !mediaType) {
      return res.status(400).json({ error: { message: 'Missing image or mediaType.' } });
    }
    if (!GEMINI_API_KEY) {
      return res.status(400).json({ error: { message: 'Server is missing GEMINI_API_KEY.' } });
    }

    const historyText = Array.isArray(history) && history.length
      ? history.map(h => `${h.role === 'user' ? 'Farmer' : 'AgriNova Assistant'}: ${h.content}`).join('\n') + '\n'
      : '';

    const userMessage = message && message.trim() ? message.trim() : 'What can you tell me about this photo? (No specific question was given — describe what you see and anything relevant to a farmer.)';

    const systemPrompt = `You are "AgriNova Assistant", a friendly, knowledgeable agricultural expert chatbot for a farming app. The farmer has attached a photo along with their message. Look at the photo carefully and answer helpfully — this could be a crop, leaf, pest, soil, equipment, or anything farming-related.

RULES:
1. Only discuss agriculture, farming, crops, plants, pests, soil, or the AgriNova app itself. If the photo or question is unrelated to farming, politely say so.
2. Match the farmer's language/style from their message (English, Tamil script, or Tanglish) — mirror exactly what they used. If no text was given, reply in English.
3. FORMATTING: Plain conversational text, no markdown symbols (no ###, no **). Use simple dash "-" bullets only if listing steps, and keep it short and skimmable.
4. Be warm and practical, like a helpful local agricultural officer. If unsure, say so and suggest a local expert.

${historyText}Farmer (with attached photo): ${userMessage}
AgriNova Assistant:`;

    let text;
    try {
      text = await callGemini([
        { text: systemPrompt },
        { inline_data: { mime_type: mediaType, data: image } }
      ], 400);
    } catch (e) {
      console.error('Gemini API error (chat-image):', e);
      return res.status(400).json({ error: { message: e.message || 'The AI service returned an error.' } });
    }

    res.json({ reply: text.trim() });

  } catch (err) {
    console.error('Chat-image handler crashed:', err);
    res.status(400).json({ error: { message: 'Server error while analyzing the photo.' } });
  }
});

/* ===================== GOVERNMENT SCHEMES ===================== */
// Cached for 24 hours — this keeps page loads fast for everyone, and means
// we only attempt the (quota-limited) Google Search grounding once a day,
// which is far less likely to hit the free-tier quota than trying on every
// page load. If grounding fails for any reason, we fall back immediately
// to a plain (non-grounded) list so the page never shows an empty error.
let schemesCache = { data: null, updatedAt: 0 };
const SCHEMES_CACHE_TTL = 2 * 60 * 60 * 1000;

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

Include 14 to 16 real, currently active schemes with accurate official links (e.g. pmkisan.gov.in, agriculture.tn.gov.in, myscheme.gov.in), covering a wide range of Central schemes, Tamil Nadu state schemes, and subsidy programs (irrigation, machinery, seeds, organic farming, livestock, fisheries, horticulture, etc.) — and 5 to 8 recent official updates. Only include schemes and links you are confident are real — never invent a scheme name or URL. If unsure of the exact page URL for a scheme, use "https://www.myscheme.gov.in" instead of guessing.`;

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
      const text = await callGemini([{ text: SCHEMES_PROMPT }], 4000);
      const parsed = parseSchemesJson(text);
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

app.get('/api/schemes', async (req, res) => {
  try {
    const now = Date.now();
    if (schemesCache.data && (now - schemesCache.updatedAt) < SCHEMES_CACHE_TTL) {
      return res.json(schemesCache.data);
    }
    if (!GEMINI_API_KEY) {
      return res.status(400).json({ error: { message: 'Server is missing GEMINI_API_KEY.' } });
    }

    let parsed;
    try {
      // Search grounding hits the free-tier quota too easily when combined
      // with everything else the app calls, so we go straight to the
      // reliable plain list — one request instead of up to three.
      parsed = await fetchSchemesPlain();
    } catch (e) {
      console.error('Schemes fetch failed after retry:', e.message);
      // If we have a stale cached copy, serve that rather than failing —
      // an older list beats no list at all.
      if (schemesCache.data) {
        return res.json(schemesCache.data);
      }
      return res.status(400).json({ error: { message: e.message || 'Could not fetch scheme data. Please try again in a moment.' } });
    }

    parsed.lastUpdated = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    schemesCache = { data: parsed, updatedAt: now };
    res.json(parsed);

  } catch (err) {
    console.error('Schemes handler crashed:', err);
    res.status(400).json({ error: { message: 'Server error while fetching schemes.' } });
  }
});

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
      text = await callGemini([{ text: prompt }], 500);
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

  const text = await callGeminiGrounded([{ text: prompt }], 1000);
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

  const text = await callGemini([{ text: prompt }], 1000);
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

app.get('/', (req, res) => res.send('AgriNova backend is running.'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AgriNova backend running on port ${PORT}`));
