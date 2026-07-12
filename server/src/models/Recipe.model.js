const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: String, default: '', trim: true },
    unit: { type: String, default: '', trim: true },
    notes: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const stepSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    instruction: { type: String, required: true, trim: true },
    image: { type: imageSchema, default: () => ({}) },
    duration: { type: Number, default: 0 }, // minutes
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', trim: true },
    coverImage: { type: imageSchema, default: () => ({}) },
    images: { type: [imageSchema], default: [] },
    ingredients: { type: [ingredientSchema], default: [] },
    steps: { type: [stepSchema], default: [] },
    tags: { type: [String], default: [] },
    cuisine: { type: String, default: '', trim: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    prepTime: { type: Number, default: 0 },
    cookTime: { type: Number, default: 0 },
    servings: { type: Number, default: 1 },
    isPublished: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Indexes ---------------------------------------------------------------
recipeSchema.index({
  title: 'text',
  description: 'text',
  'ingredients.name': 'text',
  tags: 'text',
});
recipeSchema.index({ author: 1 });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ difficulty: 1 });
recipeSchema.index({ createdAt: -1 });

// --- Virtuals --------------------------------------------------------------
recipeSchema.virtual('timeTotal').get(function timeTotal() {
  return (this.prepTime || 0) + (this.cookTime || 0);
});

// --- Cascade delete --------------------------------------------------------
// Runs on both doc.deleteOne() and Model.findOneAndDelete()/findByIdAndDelete().
async function cascadeDelete(recipeId) {
  if (!recipeId) return;
  const Rating = mongoose.model('Rating');
  const Comment = mongoose.model('Comment');
  const Saved = mongoose.model('Saved');
  await Promise.all([
    Rating.deleteMany({ recipe: recipeId }),
    Comment.deleteMany({ recipe: recipeId }),
    Saved.deleteMany({ recipe: recipeId }),
  ]);
}

// Document middleware: recipe.deleteOne()
recipeSchema.pre('deleteOne', { document: true, query: false }, async function preRemove(next) {
  await cascadeDelete(this._id);
  next();
});

// Query middleware: Recipe.findOneAndDelete(), findByIdAndDelete()
recipeSchema.pre('findOneAndDelete', async function preFindOneAndDelete(next) {
  const doc = await this.model.findOne(this.getFilter()).select('_id');
  if (doc) await cascadeDelete(doc._id);
  next();
});

module.exports = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);
