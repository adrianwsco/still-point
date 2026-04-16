// OpenAI Text-to-Speech proxy
// Returns audio as base64 so the browser can play it via Web Audio API.
// Voice: nova — warm, natural, calm. Appropriate for a contemplative app.

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { text } = body;

    if (!text || typeof text !== 'string') {
        return { statusCode: 400, body: JSON.stringify({ error: 'text string required' }) };
    }

    if (!process.env.OPENAI_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' }) };
    }

    try {
        const res = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'tts-1',
                voice: 'nova',  // warm, natural — change to 'shimmer' for softer, 'fable' for more expressive
                input: text,
                speed: 0.92     // slightly slower — more contemplative
            })
        });

        if (!res.ok) {
            return { statusCode: res.status, body: await res.text() };
        }

        const arrayBuffer = await res.arrayBuffer();
        const audioBase64 = Buffer.from(arrayBuffer).toString('base64');

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64 })
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'TTS proxy failed', detail: err.message })
        };
    }
};
