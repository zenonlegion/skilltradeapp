// /api/lalo.js
// Vercel serverless function — holds the OpenAI key server-side and
// forwards chat requests to it. The browser never sees the key.
//
// Set OPENAI_API_KEY (and optionally OPENAI_MODEL) in your Vercel
// project's Settings → Environment Variables, then redeploy.

module.exports = async (req, res) => {
  // Allow the MindSwapped page (any origin, since it's a static HTML file)
  // to call this endpoint.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'OPENAI_API_KEY is not set on the server. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.'
    });
    return;
  }

  try {
    const { systemPrompt, messages } = req.body || {};

    const openaiMessages = [
      { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
      ...(Array.isArray(messages) ? messages : []).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
    ];

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: openaiMessages
      })
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      res.status(upstream.status).json({
        error: `OpenAI responded ${upstream.status}: ${errText.slice(0, 300)}`
      });
      return;
    }

    const data = await upstream.json();
    const reply = data.choices?.[0]?.message?.content || "I didn't get a usable reply from the model.";
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
