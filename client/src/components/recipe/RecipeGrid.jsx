import RecipeCard, { RecipeCardSkeleton } from './RecipeCard';

/**
 * Masonry-style grid via CSS columns: 3col desktop / 2col tablet / 1col mobile.
 * Cards use break-inside-avoid to flow naturally across columns.
 */
export default function RecipeGrid({ recipes = [], loading = false, skeletonCount = 6, renderExtra }) {
  if (loading) {
    return (
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
      {recipes.map((recipe) => (
        <div key={recipe._id} className="break-inside-avoid">
          <RecipeCard recipe={recipe} />
          {renderExtra?.(recipe)}
        </div>
      ))}
    </div>
  );
}
