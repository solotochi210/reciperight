const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.index({ recipe: 1, parent: 1 });
commentSchema.index({ author: 1 });

commentSchema.virtual('likeCount').get(function likeCount() {
  return Array.isArray(this.likes) ? this.likes.length : 0;
});

commentSchema.methods.softDelete = function softDelete() {
  this.isDeleted = true;
  this.content = '[deleted]';
  return this.save();
};

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
