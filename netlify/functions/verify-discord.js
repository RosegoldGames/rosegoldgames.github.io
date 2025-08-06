export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { 'cf-turnstile-response': token } = JSON.parse(event.body || '{}');
    if (!token) {
      return { statusCode: 400, body: 'Missing CAPTCHA token' };
    }

    const params = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || '',
    });

    const verifyRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: params }
    );

    const data = await verifyRes.json();

    return data.success
      ? { statusCode: 302, headers: { Location: process.env.DISCORD_INVITE_URL } }
      : { statusCode: 403, body: 'CAPTCHA failed. Try again.' };

  } catch (err) {
    return { statusCode: 500, body: `Server error: ${err.message}` };
  }
}
