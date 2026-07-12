import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { setAccessToken, clearAccessToken, getAccessToken } from '../api/tokenStore';
import authApi from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  // Mirror of the in-memory access token. Kept in a ref (never persisted).
  const accessTokenRef = useRef(getAccessToken());

  const applyToken = useCallback((token) => {
    accessTokenRef.current = token || null;
    setAccessToken(token || null);
  }, []);

  const login = useCallback(
    (accessToken, userData) => {
      applyToken(accessToken);
      setUser(userData || null);
    },
    [applyToken]
  );

  const logout = useCallback(async () => {
    applyToken(null);
    clearAccessToken();
    setUser(null);
    try {
      await authApi.logout();
    } catch {
      // Local session cleared even if the API call fails
    }
  }, [applyToken]);

  /** Refresh the access token using the HttpOnly cookie. Returns the user or null. */
  const refresh = useCallback(async () => {
    try {
      const res = await authApi.refreshToken();
      const token = res?.data?.accessToken;
      if (!token) throw new Error('no token');
      applyToken(token);
      const me = await authApi.getMe();
      const userData = me?.data?.user ?? me?.data ?? null;
      setUser(userData);
      return userData;
    } catch {
      applyToken(null);
      setUser(null);
      return null;
    }
  }, [applyToken]);

  // On mount, try to restore a session via the refresh cookie.
  useEffect(() => {
    (async () => {
      await refresh();
      setInitializing(false);
    })();
  }, [refresh]);

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    initializing,
    login,
    logout,
    refresh,
    getToken: () => accessTokenRef.current,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
