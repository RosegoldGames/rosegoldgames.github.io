exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { TURNSTILE_SECRET_KEY, DISCORD_INVITE_URL } = process.env;
  if (!TURNSTILE_SECRET_KEY || !DISCORD_INVITE_URL) {
    return { statusCode: 500, body: 'Server mis-configuration' };
  }

  let token;
  try {
    ({ token } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, body: 'Bad JSON' };
  }
  if (!token) {
    return { statusCode: 400, body: 'Missing token' };
  }

  const form = new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: token });
  const verifyRes = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: form }
  ).then((r) => r.json());

  if (!verifyRes.success) {
    return {
      statusCode: 403,
      body: `CAPTCHA failed: ${verifyRes['error-codes']?.join(', ') || 'unknown'}`,
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ redirectUrl: DISCORD_INVITE_URL }),
  };
};
