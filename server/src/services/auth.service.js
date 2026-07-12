const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  isRefreshRevoked,
  revokeRefreshToken,
} = require('../utils/tokenUtils');
const { sendWelcomeEmail } = require('../config/sendgrid');

function issueTokens(user) {
  return {
    accessToken: signAccessToken(user._id, user.email),
    refreshToken: signRefreshToken(user._id),
  };
}

async function register({ name, email, password }) {
  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await User.findByEmail(normalizedEmail);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: password, // hashed by pre-save hook
  });

  // Fire-and-forget welcome email (never blocks signup).
  sendWelcomeEmail(user.email, user.name);

  const tokens = issueTokens(user);
  return { user, ...tokens };
}

async function login({ email, password }) {
  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user || !user.passwordHash) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  const tokens = issueTokens(user);
  return { user, ...tokens };
}

async function refresh(refreshToken) {
  if (!refreshToken) throw ApiError.unauthorized('Missing refresh token');
  if (isRefreshRevoked(refreshToken)) {
    throw ApiError.unauthorized('Refresh token has been revoked');
  }
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists');

  return { accessToken: signAccessToken(user._id, user.email) };
}

function logout(refreshToken) {
  if (refreshToken) revokeRefreshToken(refreshToken);
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

/** Called after passport authenticates a Google user. */
function googleIssue(user) {
  return { user, ...issueTokens(user) };
}

module.exports = { register, login, refresh, logout, getMe, googleIssue };
