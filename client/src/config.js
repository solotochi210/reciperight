/**
 * API base URL.
 *
 * Local: `/api` via Vite proxy → localhost:5000
 * Production: `/api` via Vercel rewrite → reciperight.onrender.com
 *
 * Same-origin `/api` keeps auth cookies first-party so signup/login/Google
 * refresh works in Chrome (cross-site cookies to *.onrender.com get blocked).
 */
export function getApiBaseUrl() {
  const fromEnv = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  // Prefer same-origin proxy in production builds.
  if (import.meta.env.PROD) {
    return '/api';
  }

  return fromEnv || '/api';
}

export const API_BASE_URL = getApiBaseUrl();

/** Absolute Render URL — only for rare cases that must bypass the proxy. */
export const RENDER_API_URL = 'https://reciperight.onrender.com/api';
