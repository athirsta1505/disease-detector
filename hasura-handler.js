// Add this route to the SAME server.js (or run it standalone) — it's the
// webhook Hasura calls when the frontend runs the "diagnosePlant" mutation.
//
// Hasura POSTs a body shaped like:
//   { action: { name: "diagnosePlant" }, input: { image, mediaType, prompt }, session_variables: {...} }
// and expects back JSON matching the DiagnosisOutput type on success,
// or { message: "..." } with a non-200 status on error.

require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json({ limit: '15mb' }));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.post('/hasura/diagnose', async (req, res) => {
  try {
    const { image, mediaType, prompt } = req.body.input || {};

    if (!image || !mediaType || !prompt) {
      // Hasura Actions expect a non-200 + { message } shape for errors,
      // which it then surfaces as a GraphQL error to the frontend.
      return res.status(400).json({ message: 'Missing image, mediaType, or prompt.' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(500).json({ message: (data.error && data.error.message) || 'The AI service returned an error.' });
    }

    const textBlock = (data.content || []).find(b => b.type === 'text');
    if (!textBlock || !textBlock.text) {
      return res.status(500).json({ message: 'No diagnosis text came back from the model.' });
    }

    const start = textBlock.text.indexOf('{');
    const end = textBlock.text.lastIndexOf('}');
    if (start === -1 || end === -1) {
      return res.status(500).json({ message: 'Could not parse a result from the model.' });
    }

    const diag = JSON.parse(textBlock.text.slice(start, end + 1));

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
    res.status(500).json({ message: 'Server error while running the diagnosis.' });
  }
});

const PORT = process.env.HASURA_HANDLER_PORT || 3001;
app.listen(PORT, () => console.log(`Hasura Action handler running at http://localhost:${PORT}`));