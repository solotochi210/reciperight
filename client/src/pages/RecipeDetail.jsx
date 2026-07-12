import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Clock, Users, ChefHat, Flame, Bookmark, Share2, Pencil, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRecipeDetail } from '../hooks/useRecipes';
import { useSaveToggle } from '../hooks/useSaveToggle';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../components/ui/Toast';
import recipeApi from '../api/recipe.api';
import PageWrapper from '../components/layout/PageWrapper';
import IngredientList from '../components/recipe/IngredientList';
import StepList from '../components/recipe/StepList';
import RatingWidget from '../components/recipe/RatingWidget';
import CommentThread from '../components/comment/CommentThread';
import RecipeCard from '../components/recipe/RecipeCard';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import RatingStars from '../components/ui/RatingStars';
import RecipeDetailSkeleton from '../components/recipe/RecipeDetailSkeleton';
import { coverUrl } from '../utils/cloudinary';
import { cn } from '../utils/cn';

function MetaBlock({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-accent" />
      <div>
        <p className="text-xs text-text-tertiary">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipe: recipeQuery, related: relatedQuery } = useRecipeDetail(id);
  const { user, isAuthenticated } = useAuth();
  const { success, error, info } = useToast();
  const saveToggle = useSaveToggle(id);
  const queryClient = useQueryClient();

  const recipe = recipeQuery.data?.data?.recipe;
  const related = relatedQuery.data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: () => recipeApi.deleteRecipe(id),
    onSuccess: () => {
      success('Recipe deleted');
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      navigate('/');
    },
    onError: (err) => error(err.response?.data?.message || 'Could not delete recipe'),
  });

  if (recipeQuery.isLoading) return <RecipeDetailSkeleton />;

  if (recipeQuery.isError || !recipe) {
    return (
      <PageWrapper className="py-24 text-center">
        <h1 className="font-heading text-3xl">Recipe not found</h1>
        <Link to="/" className="mt-4 inline-block text-accent hover:underline">
          Back to home
        </Link>
      </PageWrapper>
    );
  }

  const isOwner = String(recipe.author?._id) === String(user?._id);
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: recipe.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        info('Link copied to clipboard');
      }
    } catch {
      /* user cancelled */
    }
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    saveToggle.mutate();
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.coverImage?.url ? [recipe.coverImage.url] : undefined,
    author: { '@type': 'Person', name: recipe.author?.name },
    recipeCuisine: recipe.cuisine,
    prepTime: `PT${recipe.prepTime || 0}M`,
    cookTime: `PT${recipe.cookTime || 0}M`,
    totalTime: `PT${totalTime}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeIngredient: recipe.ingredients?.map((i) => `${i.quantity} ${i.unit} ${i.name}`.trim()),
    recipeInstructions: recipe.steps?.map((s) => ({ '@type': 'HowToStep', text: s.instruction })),
    aggregateRating:
      recipe.ratingCount > 0
        ? { '@type': 'AggregateRating', ratingValue: recipe.averageRating, ratingCount: recipe.ratingCount }
        : undefined,
  };

  return (
    <div>
      <Helmet>
        <title>{recipe.title} · RecipeRight</title>
        <meta name="description" content={recipe.description?.slice(0, 160)} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative h-[420px] w-full overflow-hidden bg-bg-secondary sm:h-[520px]">
        {recipe.coverImage?.url && (
          <img src={coverUrl(recipe.coverImage.url)} alt={recipe.title} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0">
          <PageWrapper className="pb-8" animate={false}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="max-w-2xl font-heading text-4xl text-white sm:text-5xl">{recipe.title}</h1>
                <div className="mt-3 flex items-center gap-3 text-white/90">
                  <Avatar src={recipe.author?.avatar?.url} name={recipe.author?.name} size="md" />
                  <div>
                    <p className="text-sm font-medium">{recipe.author?.name}</p>
                    <p className="text-xs text-white/70">
                      {new Date(recipe.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="flex items-center gap-2">
                {recipe.ratingCount > 0 && (
                  <div className="glass flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium">
                    <RatingStars value={recipe.averageRating} readOnly size="sm" />
                    {recipe.averageRating?.toFixed(1)}
                  </div>
                )}
                <button
                  onClick={handleSave}
                  className="glass rounded-full p-3 transition hover:scale-105"
                  aria-label="Save recipe"
                >
                  <Bookmark className={cn('h-5 w-5', recipe.isSaved && 'fill-accent text-accent')} />
                </button>
                <button onClick={handleShare} className="glass rounded-full p-3 transition hover:scale-105" aria-label="Share">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </PageWrapper>
        </div>
      </section>

      <PageWrapper className="py-8">
        {/* Owner controls */}
        {isOwner && (
          <div className="mb-6 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/recipes/${id}/edit`)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleteMutation.isPending}
              onClick={() => {
                if (window.confirm('Delete this recipe? This cannot be undone.')) deleteMutation.mutate();
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        )}

        {/* Meta strip */}
        <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
          <MetaBlock icon={Clock} label="Prep" value={`${recipe.prepTime || 0} min`} />
          <MetaBlock icon={Flame} label="Cook" value={`${recipe.cookTime || 0} min`} />
          <MetaBlock icon={Clock} label="Total" value={`${totalTime} min`} />
          <MetaBlock icon={Users} label="Servings" value={recipe.servings} />
          <MetaBlock icon={ChefHat} label="Difficulty" value={recipe.difficulty} />
          {recipe.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.tags.map((t) => (
                <Badge key={t} variant="accent">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {recipe.description && (
          <p className="mb-8 max-w-3xl text-lg leading-relaxed text-text-secondary">{recipe.description}</p>
        )}

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-12">
            <IngredientList ingredients={recipe.ingredients} baseServings={recipe.servings} />
            <StepList steps={recipe.steps} />
            <CommentThread recipeId={id} />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <RatingWidget recipeId={id} averageRating={recipe.averageRating} ratingCount={recipe.ratingCount} />
            <Button className="w-full" variant={recipe.isSaved ? 'secondary' : 'primary'} onClick={handleSave}>
              <Bookmark className={cn('h-4 w-4', recipe.isSaved && 'fill-accent text-accent')} />
              {recipe.isSaved ? 'Saved' : 'Save recipe'} · {recipe.saveCount || 0}
            </Button>

            {related.length > 0 && (
              <div className="hidden lg:block">
                <h3 className="mb-3 font-heading text-lg">Related recipes</h3>
                <div className="space-y-4">
                  {related.slice(0, 3).map((r) => (
                    <Link key={r._id} to={`/recipes/${r._id}`} className="flex items-center gap-3 group">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bg-secondary">
                        {r.coverImage?.url && (
                          <img src={coverUrl(r.coverImage.url)} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium group-hover:text-accent">{r.title}</p>
                        <p className="truncate text-xs text-text-tertiary">{r.author?.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Related strip (horizontal scroll) */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-5 font-heading text-2xl">More to explore</h2>
            <div className="no-scrollbar flex gap-5 overflow-x-auto pb-2">
              {related.map((r) => (
                <div key={r._id} className="w-72 shrink-0">
                  <RecipeCard recipe={r} />
                </div>
              ))}
            </div>
          </section>
        )}
      </PageWrapper>
    </div>
  );
}
