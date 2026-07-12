const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

ratingSchema.index({ recipe: 1, user: 1 }, { unique: true });

/**
 * Recalculate a recipe's averageRating + ratingCount from the Rating collection
 * using an aggregation pipeline, then persist onto the Recipe document.
 */
async function recalcRecipeRating(recipeId) {
  if (!recipeId) return;
  const Rating = mongoose.model('Rating');
  const Recipe = mongoose.model('Recipe');

  const [agg] = await Rating.aggregate([
    { $match: { recipe: new mongoose.Types.ObjectId(recipeId) } },
    {
      $group: {
        _id: '$recipe',
        averageRating: { $avg: '$score' },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  await Recipe.findByIdAndUpdate(recipeId, {
    averageRating: agg ? Math.round(agg.averageRating * 10) / 10 : 0,
    ratingCount: agg ? agg.ratingCount : 0,
  });
}

// Recalculate after a rating is saved (create or .save() update).
ratingSchema.post('save', async function postSave(doc) {
  await recalcRecipeRating(doc.recipe);
});

// Recalculate after an upsert via findOneAndUpdate (used by the rating service).
ratingSchema.post('findOneAndUpdate', async function postUpdate(doc) {
  if (doc) await recalcRecipeRating(doc.recipe);
});

// Recalculate after a rating is removed.
ratingSchema.post('deleteOne', { document: true, query: false }, async function postRemove(doc) {
  await recalcRecipeRating(doc.recipe);
});
ratingSchema.post('findOneAndDelete', async function postFindOneAndDelete(doc) {
  if (doc) await recalcRecipeRating(doc.recipe);
});

ratingSchema.statics.recalc = recalcRecipeRating;

module.exports = mongoose.models.Rating || mongoose.model('Rating', ratingSchema);
