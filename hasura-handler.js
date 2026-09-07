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

async function callGemini(parts) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
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
      ]);
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
    const { message, history } = req.body || {};

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

    const systemPrompt = `You are "AgriNova Assistant" (AgriAssist AI), a friendly, knowledgeable agricultural expert chatbot for a farming app. You help farmers with questions about crops, plant diseases, pests, fertilizers, irrigation, soil health, weather-related farming decisions, market/harvest timing, and general farming best practices.

RULES:
1. Only answer questions related to agriculture, farming, crops, plants, livestock basics, or the AgriNova app itself. If the farmer asks something completely unrelated (e.g. politics, entertainment, coding), politely say you can only help with farming and agriculture topics, and steer back.
2. Reply in the SAME language the farmer used in their latest message (English or Tamil — match their language naturally; if they wrote in Tamil script, reply in Tamil).
3. Keep answers practical, concise, and easy for a farmer to act on — prefer short paragraphs or bullet-style steps over long essays.
4. If you're not fully certain about something (e.g. exact chemical dosages, local regulations), say so and suggest confirming with a local agricultural extension officer.
5. Be warm and encouraging in tone, like a helpful local agricultural officer.

${historyText}Farmer: ${message}
AgriNova Assistant:`;

    let text;
    try {
      text = await callGemini([{ text: systemPrompt }]);
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

app.get('/', (req, res) => res.send('AgriNova backend is running.'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AgriNova backend running on port ${PORT}`));
