const jwt = require('jsonwebtoken');

const ACCESS_SECRET = () => process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

// Blocklist of revoked refresh tokens (logout). Survives until server restart,
// but unlike an allowlist, valid JWTs still work after a server restart.
const revokedRefreshTokens = new Set();

function signAccessToken(userId, email) {
  const payload = { sub: String(userId), type: 'access' };
  if (email) payload.email = email;
  return jwt.sign(payload, ACCESS_SECRET(), {
    expiresIn: ACCESS_EXPIRES,
  });
}

function signRefreshToken(userId) {
  return jwt.sign({ sub: String(userId), type: 'refresh' }, REFRESH_SECRET(), {
    expiresIn: REFRESH_EXPIRES,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET());
}

function verifyRefreshToken(token) {
  const payload = jwt.verify(token, REFRESH_SECRET());
  if (payload.type !== 'refresh') {
    throw new jwt.JsonWebTokenError('Invalid token type');
  }
  return payload;
}

function isRefreshRevoked(token) {
  return revokedRefreshTokens.has(token);
}

function revokeRefreshToken(token) {
  if (token) revokedRefreshTokens.add(token);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  isRefreshRevoked,
  revokeRefreshToken,
};
