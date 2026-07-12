const rateLimit = require('express-rate-limit');

/**
 * Brute-force protection for credential endpoints only.
 * refresh / me / logout are intentionally excluded — they run on every page load.
 */
const loginRegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

module.exports = { loginRegisterLimiter };
