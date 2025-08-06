export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, 'Access-Control-Allow-Origin': '*', body: 'Method Not Allowed' };
  }

  try {
    const { 'cf-turnstile-response': token } = JSON.parse(event.body || '{}');
    if (!token) {
      return { statusCode: 400, 'Access-Control-Allow-Origin': '*', body: 'Missing CAPTCHA token' };
    }
    
    const params = new URLSearchParams();
    params.append('secret', process.env.TURNSTILE_SECRET_KEY);
    params.append('response', token);

    const verifyRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      }
    );

    const data = await verifyRes.json();

    if (data.success) {
      return {
        statusCode: 302,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Expose-Headers': 'Location',
          Location: process.env.DISCORD_INVITE_URL 
        }
      };
    }

    return {
      statusCode: 403,
      'Access-Control-Allow-Origin': '*',
      body: `CAPTCHA failed: ${JSON.stringify(data)}`
    };

  } catch (err) {
    return { 
      statusCode: 500, 
      'Access-Control-Allow-Origin': '*',
      body: `Server error: ${err.message}` 
    };
  }
}
