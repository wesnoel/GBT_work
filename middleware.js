import { next } from '@vercel/functions';

const COOKIE_NAME = 'gbt_auth';
const MAX_AGE = 60 * 60 * 24 * 400; // 400 days (the browser-enforced cap on cookie lifetime)

async function hash(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
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
  .field { position: relative; margin-bottom: 12px; }
  input { width: 100%; box-sizing: border-box; padding: 10px 36px 10px 12px; border-radius: 6px; border: 1px solid #232326; background: #141416; color: #f2f2f3; font-size: 14px; }
  input:focus { outline: none; border-color: #5b8cff; }
  .toggle { position: absolute; top: 0; right: 0; width: 36px; height: 100%; padding: 0; margin: 0; background: none; border: none; color: #9a9a9f; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .toggle:hover { color: #f2f2f3; }
  button[type="submit"] { width: 100%; padding: 10px 12px; border-radius: 6px; border: none; background: #5b8cff; color: #0b0b0c; font-weight: 600; font-size: 14px; cursor: pointer; }
  .error { color: #e8734d; font-size: 12px; margin: -4px 0 12px; }
</style>
</head>
<body>
  <form method="POST">
    <h1>GBT Work</h1>
    ${showError ? '<div class="error">Incorrect password.</div>' : ''}
    <div class="field">
      <input type="password" id="password" name="password" placeholder="Password" autofocus required>
      <button type="button" class="toggle" id="toggle" aria-label="Show password">
        <svg id="toggleIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
    </div>
    <button type="submit">Enter</button>
  </form>
  <script>
    var pw = document.getElementById('password');
    var toggle = document.getElementById('toggle');
    var icon = document.getElementById('toggleIcon');
    var eyeIcon = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/>';
    var eyeOffIcon = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/><line x1="2" y1="2" x2="22" y2="22"/>';
    toggle.addEventListener('click', function () {
      var showing = pw.type === 'text';
      pw.type = showing ? 'password' : 'text';
      toggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      icon.innerHTML = showing ? eyeIcon : eyeOffIcon;
    });
  </script>
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

  const expected = await hash(sitePassword);
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));

  if (match && match[1] === expected) {
    return next();
  }

  if (request.method === 'POST') {
    const form = await request.formData();
    const submitted = form.get('password') || '';

    if ((await hash(submitted)) === expected) {
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
