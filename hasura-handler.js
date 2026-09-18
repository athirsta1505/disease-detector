// AgriNova backend — handles TWO things:
//   1. /hasura/diagnose — leaf-photo disease diagnosis, called by Hasura Action (Gemini vision)
//   2. /api/chat        — agriculture chatbot, called DIRECTLY by chatbot.html (Gemini text)
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

/* ===================== GOVERNMENT SCHEMES (search-grounded) ===================== */
// Cached in memory so we don't call Gemini on every single page load —
// refreshed at most once every 6 hours.
let schemesCache = { data: null, updatedAt: 0 };
const SCHEMES_CACHE_TTL = 3 * 60 * 60 * 1000;

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

Include 10 to 12 real, currently active schemes with accurate official links (e.g. pmkisan.gov.in, agriculture.tn.gov.in), covering a wide range of Central schemes, Tamil Nadu state schemes, and subsidy programs (irrigation, machinery, seeds, organic farming, livestock, fisheries, etc. where relevant to farmers) — and 5 to 8 recent official updates. Only include schemes and links you are confident are real — never invent a scheme name or URL.`;

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

// Small delay helper for retries.
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchSchemesPlain() {
  // Retries once on transient errors (e.g. "model is currently experiencing
  // high demand"), since those usually succeed a moment later.
  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const text = await callGemini([{ text: SCHEMES_PROMPT }], 3000);
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

app.get('/', (req, res) => res.send('AgriNova backend is running.'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AgriNova backend running on port ${PORT}`));
