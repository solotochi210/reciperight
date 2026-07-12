import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore';
import { emitToast } from '../utils/toastBus';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  withCredentials: true, // send the HttpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from memory on every request.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Silent refresh handling -------------------------------------------------
// A bare axios call (no interceptors) used to refresh, avoiding infinite loops.
const refreshClient = axios.create({ baseURL, withCredentials: true });

let isRefreshing = false;
let pendingQueue = [];

function flushQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Only attempt a single refresh per failed request, and never for the
    // refresh/login endpoints themselves.
    const isAuthRetryable =
      status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/register') &&
      !original.url?.includes('/auth/logout');

    if (!isAuthRetryable) {
      // Surface common error classes globally (auth 401 handled via refresh below).
      if (status === 403) emitToast('You are not authorized to do that', 'error');
      else if (status === 429) emitToast('Too many requests — please slow down', 'error');
      else if (status >= 500) emitToast('Something went wrong on our end', 'error');
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      // Queue until the in-flight refresh resolves.
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;
    try {
      const { data } = await refreshClient.post('/auth/refresh');
      const newToken = data?.data?.accessToken;
      if (!newToken) throw new Error('No access token in refresh response');
      setAccessToken(newToken);
      flushQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      flushQueue(refreshErr, null);
      clearAccessToken();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
