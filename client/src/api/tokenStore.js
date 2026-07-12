/**
 * In-memory access token holder.
 *
 * The access token NEVER touches localStorage — it lives only in this module's
 * closure (and mirrors the ref held by AuthContext). The refresh token is an
 * HttpOnly cookie managed entirely by the server.
 */
let accessToken = null;
const subscribers = new Set();

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token || null;
  subscribers.forEach((fn) => fn(accessToken));
}

export function clearAccessToken() {
  setAccessToken(null);
}

/** Subscribe to token changes; returns an unsubscribe fn. */
export function onTokenChange(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
