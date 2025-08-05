import fetch from 'node-fetch';

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { "cf-turnstile-response": token } = JSON.parse(event.body);
  const ip = event.headers['x-forwarded-for'] || event.headers['x-real-ip'];
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const discordInvite = process.env.DISCORD_INVITE_URL;

  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secretKey}&response=${token}&remoteip=${ip}`
  });

  const result = await verifyRes.json();

  if (result.success) {
    return {
      statusCode: 302,
      headers: { Location: discordInvite }
    };
  } else {
    return {
      statusCode: 403,
      body: 'CAPTCHA failed. Try again.'
    };
  }
}
