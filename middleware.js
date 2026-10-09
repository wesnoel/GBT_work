import { next } from '@vercel/functions';
import { createHash } from 'node:crypto';

const COOKIE_NAME = 'gbt_auth';
const MAX_AGE = 60 * 60 * 24 * 400; // 400 days (the browser-enforced cap on cookie lifetime)

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function loginPage(showError) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GBT Work</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0b0b0c; color: #f2f2f3; font-family: 'Manrope', 'Helvetica Neue', Helvetica, Arial, sans-serif; }
  form { width: 280px; }
  h1 { font-size: 16px; font-weight: 600; margin: 0 0 16px; letter-spacing: -0.01em; }
  input { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 6px; border: 1px solid #232326; background: #141416; color: #f2f2f3; font-size: 14px; margin-bottom: 12px; }
  input:focus { outline: none; border-color: #5b8cff; }
  button { width: 100%; padding: 10px 12px; border-radius: 6px; border: none; background: #5b8cff; color: #0b0b0c; font-weight: 600; font-size: 14px; cursor: pointer; }
  .error { color: #e8734d; font-size: 12px; margin: -4px 0 12px; }
</style>
</head>
<body>
  <form method="POST">
    <h1>GBT Work</h1>
    ${showError ? '<div class="error">Incorrect password.</div>' : ''}
    <input type="password" name="password" placeholder="Password" autofocus required>
    <button type="submit">Enter</button>
  </form>
</body>
</html>`;
}

function challenge(showError) {
  return new Response(loginPage(showError), {
    status: 401,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

export default async function middleware(request) {
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    return new Response('Password protection is misconfigured: SITE_PASSWORD is not set.', { status: 500 });
  }

  const expected = hash(sitePassword);
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));

  if (match && match[1] === expected) {
    return next();
  }

  if (request.method === 'POST') {
    const form = await request.formData();
    const submitted = form.get('password') || '';

    if (hash(submitted) === expected) {
      const response = new Response(null, {
        status: 302,
        headers: { Location: request.url },
      });
      response.headers.append(
        'Set-Cookie',
        `${COOKIE_NAME}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
      );
      return response;
    }

    return challenge(true);
  }

  return challenge(false);
}
