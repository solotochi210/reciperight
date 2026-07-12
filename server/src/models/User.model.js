const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    googleId: { type: String, default: null, index: true },
    avatar: { type: imageSchema, default: () => ({}) },
    bio: { type: String, default: '', maxlength: 280, trim: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isEmailVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Hash the password when it has been set/modified.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, BCRYPT_ROUNDS);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email: String(email || '').toLowerCase().trim() });
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
