/**
 * Auth0 SPA settings shared across provider, login, and logout.
 * redirect_uri must exactly match an entry in Auth0 Application "Allowed Callback URLs".
 */

/** Same idea as @auth0/auth0-react `hasAuthParams` — avoids starting a new login while handling the callback. */
const CODE_RE = /[?&]code=[^&]+/;
const STATE_RE = /[?&]state=[^&]+/;
const ERROR_RE = /[?&]error=[^&]+/;

export function hasOAuthAuthorizationParams(
  search: string = typeof window !== 'undefined' ? window.location.search : ''
): boolean {
  if (!search) return false;
  return (CODE_RE.test(search) || ERROR_RE.test(search)) && STATE_RE.test(search);
}

function canonicalOrigin(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return trimmed.replace(/\/$/, '');
  }
}

/** Host only, e.g. auth.kindleify.ai — Auth0 SDK accepts either form; we normalize to host. */
export function auth0DomainHost(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).host;
  } catch {
    return trimmed.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }
}

/**
 * OAuth redirect_uri sent to Auth0.
 * In production, defaults to the public app origin so Heroku/preview hosts still work
 * once app.kindleify.ai is the only callback URL configured.
 */
export function getAuth0RedirectUri(): string {
  const explicit = import.meta.env.VITE_AUTH0_REDIRECT_URI?.trim();
  if (explicit) return canonicalOrigin(explicit);

  if (import.meta.env.PROD) {
    const prod = import.meta.env.VITE_AUTH0_REDIRECT_URI_PROD?.trim();
    if (prod) return canonicalOrigin(prod);
    return canonicalOrigin('https://app.kindleify.ai');
  }

  const dev = import.meta.env.VITE_AUTH0_REDIRECT_URI_DEV?.trim();
  if (dev) return canonicalOrigin(dev);

  if (typeof window !== 'undefined') return window.location.origin;

  return canonicalOrigin('http://localhost:5173');
}
