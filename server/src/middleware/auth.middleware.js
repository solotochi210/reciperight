const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/tokenUtils');

/**
 * Require a valid Bearer access token.
 * Attaches req.user = { id, email } on success.
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Authentication required');
  }

  const payload = verifyAccessToken(token); // throws → handled centrally
  req.user = { id: payload.sub, email: payload.email };
  return next();
}

/**
 * Optional auth: attaches req.user if a valid token is present, otherwise
 * continues anonymously. Used by endpoints that personalize but don't require login.
 */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, email: payload.email };
    } catch {
      // ignore invalid token for optional auth
    }
  }
  return next();
}

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.optionalAuth = optionalAuth;
