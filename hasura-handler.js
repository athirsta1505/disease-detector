// This is the Hasura Action webhook handler for the Disease Detector.
// It now uses Google Gemini (free tier) instead of the Anthropic API.
//
// Hasura POSTs a body shaped like:
//   { action: { name: "diagnosePlant" }, input: { image, mediaType, prompt }, session_variables: {...} }
// and expects back JSON matching the DiagnosisOutput type on success,
// or { message: "..." } with a non-200 status on error.

require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json({ limit: '15mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/hasura/diagnose', async (req, res) => {
  try {
    const { image, mediaType, prompt } = req.body.input || {};

    if (!image || !mediaType || !prompt) {
      return res.status(400).json({ message: 'Missing image, mediaType, or prompt.' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(400).json({ message: 'Server is missing GEMINI_API_KEY.' });
    }

    // Gemini's generateContent endpoint (free tier: gemini-3.6-flash)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mediaType, data: image } }
            ]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(400).json({ message: (data.error && data.error.message) || 'The AI service returned an error.' });
    }

    const textBlock = data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    if (!textBlock) {
      console.error('Unexpected Gemini response shape:', JSON.stringify(data));
      return res.status(400).json({ message: 'No diagnosis text came back from the model.' });
    }

    const start = textBlock.indexOf('{');
    const end = textBlock.lastIndexOf('}');
    if (start === -1 || end === -1) {
      return res.status(400).json({ message: 'Could not parse a result from the model.' });
    }

    const diag = JSON.parse(textBlock.slice(start, end + 1));

    // Shape it EXACTLY to match the DiagnosisOutput GraphQL type —
    // Hasura will reject the response if a required field is missing.
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

app.get('/', (req, res) => res.send('Disease Detector backend is running.'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Hasura Action handler running on port ${PORT}`));
