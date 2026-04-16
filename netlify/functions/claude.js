// Anthropic API proxy
// Keeps the API key server-side, never exposed to the browser.

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

    const { messages, system } = body;

    if (!messages || !Array.isArray(messages)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'messages array required' }) };
    }

    if (!process.env.ANTHROPIC_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }) };
    }

    try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-opus-4-6',
                max_tokens: 1024,
                system: system || '',
                messages
            })
        });

        const data = await res.json();

        return {
            statusCode: res.status,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Proxy request failed', detail: err.message })
        };
    }
};
