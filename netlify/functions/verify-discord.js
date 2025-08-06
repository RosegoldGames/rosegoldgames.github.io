export async function handler(event) {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://invite.rosegoldgames.com',
    'Access-Control-Expose-Headers': 'Location'
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: 'Method Not Allowed'
    };
  }

  const { TURNSTILE_SECRET_KEY, DISCORD_INVITE_URL } = process.env;
  if (!TURNSTILE_SECRET_KEY || !DISCORD_INVITE_URL) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: 'Server error: Missing environment variables'
    };
  }

  try {
    const { 'cf-turnstile-response': token } = JSON.parse(event.body || '{}');

    if (!token) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: 'Missing CAPTCHA token'
      };
    }

    const params = new URLSearchParams();
    params.append('secret', TURNSTILE_SECRET_KEY);
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
          ...CORS_HEADERS,
          Location: DISCORD_INVITE_URL
        }
      };
    }

    return {
      statusCode: 403,
      headers: CORS_HEADERS,
      body: `CAPTCHA failed: ${JSON.stringify(data)}`
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: `Server error: ${err.message}`
    };
  }
}
