const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

const REFRESH_COOKIE = 'refreshToken';

function refreshCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    // Lax is enough when the frontend proxies /api (same-site). None kept as
    // fallback if the API is ever called cross-origin directly.
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}

async function register(req, res) {
  const { name, email, password } = req.body;
  authService.logout(req.cookies?.[REFRESH_COOKIE]);
  const { user, accessToken, refreshToken } = await authService.register({ name, email, password });
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return ApiResponse.send(res, {
    statusCode: 201,
    data: { user, accessToken },
    message: 'Account created',
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  authService.logout(req.cookies?.[REFRESH_COOKIE]);
  const { user, accessToken, refreshToken } = await authService.login({ email, password });
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return ApiResponse.send(res, { data: { user, accessToken }, message: 'Logged in' });
}

async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  const { accessToken } = await authService.refresh(token);
  return ApiResponse.send(res, { data: { accessToken }, message: 'Token refreshed' });
}

async function logout(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  authService.logout(token);
  const { maxAge: _maxAge, ...clearOpts } = refreshCookieOptions();
  res.clearCookie(REFRESH_COOKIE, clearOpts);
  return ApiResponse.send(res, { message: 'Logged out' });
}

async function getMe(req, res) {
  const user = await authService.getMe(req.user.id);
  return ApiResponse.send(res, { data: { user }, message: 'OK' });
}

async function googleCallback(req, res) {
  // req.user is set by passport.
  const { accessToken, refreshToken } = authService.googleIssue(req.user);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  // Redirect back to the client with the access token in the URL fragment.
  const clientUrl = (process.env.CLIENT_URL || 'https://reciperight-client.vercel.app').replace(/\/$/, '');
  return res.redirect(`${clientUrl}/login#access_token=${accessToken}`);
}

module.exports = { register, login, refresh, logout, getMe, googleCallback };
