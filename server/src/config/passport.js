const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { User } = require('../models');

const hasGoogle =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL;

if (hasGoogle) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
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
