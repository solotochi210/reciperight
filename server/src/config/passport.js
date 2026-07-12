const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { User } = require('../models');

/**
 * Prefer an explicit GOOGLE_CALLBACK_URL.
 * In production, default to the Vercel same-origin proxy path so the OAuth
 * cookie is first-party on the frontend domain.
 */
function resolveGoogleCallbackUrl() {
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL.replace(/\/$/, '');
  }
  const client = (process.env.CLIENT_URL || '').replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production' && client) {
    return `${client}/api/auth/google/callback`;
  }
  return 'http://localhost:5000/api/auth/google/callback';
}

const googleCallbackUrl = resolveGoogleCallbackUrl();
const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (hasGoogle) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: googleCallbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const googleId = profile.id;

          // 1) Match by googleId, or 2) link to an existing email account.
          let user = await User.findOne({ googleId });
          if (!user && email) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId = googleId;
              if (!user.isEmailVerified) user.isEmailVerified = true;
              await user.save();
            }
          }

          // 3) Otherwise create a new account.
          if (!user) {
            user = await User.create({
              name: profile.displayName || email?.split('@')[0] || 'New Cook',
              email,
              googleId,
              isEmailVerified: true,
              avatar: { url: profile.photos?.[0]?.value || '', publicId: '' },
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  console.log(`[passport] Google OAuth enabled. callbackURL=${googleCallbackUrl}`);
} else {
  console.warn('[passport] Google OAuth not configured — /api/auth/google disabled.');
}

passport.serializeUser((user, done) => done(null, user.id || user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
module.exports.hasGoogle = hasGoogle;
module.exports.googleCallbackUrl = googleCallbackUrl;
