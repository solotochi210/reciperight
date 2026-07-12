const mongoose = require('mongoose');

const savedSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  },
  { timestamps: true }
);

savedSchema.index({ user: 1, recipe: 1 }, { unique: true });

async function adjustSaveCount(recipeId, delta) {
  if (!recipeId) return;
  const Recipe = mongoose.model('Recipe');
  if (delta < 0) {
    // Decrement but never below 0.
    await Recipe.updateOne(
      { _id: recipeId, saveCount: { $gt: 0 } },
      { $inc: { saveCount: delta } }
    );
  } else {
    await Recipe.updateOne({ _id: recipeId }, { $inc: { saveCount: delta } });
  }
}

// Increment saveCount when a recipe is saved.
savedSchema.post('save', async function postSave(doc) {
  await adjustSaveCount(doc.recipe, 1);
});

// Decrement saveCount when a save is removed (both document + query deletes).
savedSchema.post('deleteOne', { document: true, query: false }, async function postRemove(doc) {
  await adjustSaveCount(doc.recipe, -1);
});
savedSchema.post('findOneAndDelete', async function postFindOneAndDelete(doc) {
  if (doc) await adjustSaveCount(doc.recipe, -1);
});

module.exports = mongoose.models.Saved || mongoose.model('Saved', savedSchema);
