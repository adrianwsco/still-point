// OpenAI Whisper proxy
// Accepts base64 audio from the browser, forwards to OpenAI as multipart form.
// Keeps the API key server-side, never exposed to the browser.
// Note: Netlify function body limit is ~6MB.
// Base64 adds ~33% overhead — max safe audio input is ~4MB raw.

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

    const { audioBase64, filename } = body;

    if (!audioBase64 || !filename) {
        return { statusCode: 400, body: JSON.stringify({ error: 'audioBase64 and filename required' }) };
    }

    if (!process.env.OPENAI_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' }) };
    }

    try {
        // Convert base64 back to buffer
        const buffer = Buffer.from(audioBase64, 'base64');

        // Determine content type from filename
        let contentType = 'audio/webm';
        if (filename.endsWith('.mp4'))  contentType = 'audio/mp4';
        if (filename.endsWith('.ogg'))  contentType = 'audio/ogg';
        if (filename.endsWith('.wav'))  contentType = 'audio/wav';
        if (filename.endsWith('.m4a'))  contentType = 'audio/mp4';

        // Build multipart form using Node 18+ native FormData + Blob
        const audioBlob = new Blob([buffer], { type: contentType });
        const formData  = new FormData();
        formData.append('file', audioBlob, filename);
        formData.append('model', 'whisper-1');
        formData.append('language', 'en');

        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                // Do NOT set Content-Type — fetch sets it with boundary automatically
            },
            body: formData
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
