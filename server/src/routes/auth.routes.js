const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { loginRegisterLimiter } = require('../middleware/authRateLimit.middleware');
const { runValidation, registerRules, loginRules } = require('../middleware/validate.middleware');
const { hasGoogle } = require('../config/passport');

const router = express.Router();

router.post('/register', loginRegisterLimiter, registerRules, runValidation, authController.register);
router.post('/login', loginRegisterLimiter, loginRules, runValidation, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getMe);

// Google OAuth — only mounted when credentials are configured.
if (hasGoogle) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google` }),
    authController.googleCallback
  );
}

module.exports = router;
