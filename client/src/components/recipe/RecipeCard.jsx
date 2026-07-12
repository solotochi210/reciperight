import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Star, Clock } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Skeleton from '../ui/Skeleton';
import { useSaveToggle } from '../../hooks/useSaveToggle';
import { useAuth } from '../../store/AuthContext';
import { coverUrl } from '../../utils/cloudinary';
import { cn } from '../../utils/cn';

export function RecipeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white shadow-sm">
      <Skeleton className="aspect-[4/3] w-full" rounded="rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-8 w-8" rounded="rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export default function RecipeCard({ recipe }) {
  const [loaded, setLoaded] = useState(false);
  const { isAuthenticated } = useAuth();
  const saveToggle = useSaveToggle(recipe._id);
  const [saved, setSaved] = useState(!!recipe.isSaved);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setSaved((s) => !s); // optimistic local flip
    saveToggle.mutate(undefined, {
      onError: () => setSaved((s) => !s),
    });
  };

  const cover = recipe.coverImage?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group break-inside-avoid"
    >
      <Link
        to={`/recipes/${recipe._id}`}
        className="block overflow-hidden rounded-[20px] border border-[var(--border)] bg-white shadow-sm transition-shadow duration-300 group-hover:shadow-lg"
      >
        {/* Cover */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-secondary">
          {cover ? (
            <img
              src={coverUrl(cover)}
              alt={recipe.title}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className={cn(
                'h-full w-full object-cover transition-all duration-500 group-hover:scale-105',
                loaded ? 'blur-0 opacity-100' : 'blur-md opacity-0'
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-tertiary">
              No image
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
            <span className="rounded-full bg-white/90 px-5 py-2 text-sm font-medium text-text-primary">
              View Recipe
            </span>
          </div>

          {/* Rating badge */}
          {recipe.ratingCount > 0 && (
            <div className="glass absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-text-primary">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              {recipe.averageRating?.toFixed(1)}
            </div>
          )}

          {/* Save toggle */}
          {isAuthenticated && (
            <button
              onClick={handleSave}
              aria-label={saved ? 'Unsave' : 'Save'}
              className="glass absolute bottom-3 right-3 rounded-full p-2 text-text-primary transition hover:scale-110"
            >
              <Bookmark className={cn('h-4 w-4', saved && 'fill-accent text-accent')} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="line-clamp-2 font-heading text-lg leading-snug">{recipe.title}</h3>

          {(recipe.tags?.length > 0 || recipe.prepTime != null) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {recipe.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="muted">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar src={recipe.author?.avatar?.url} name={recipe.author?.name} size="sm" />
              <span className="text-sm text-text-secondary">{recipe.author?.name}</span>
            </div>
            <span className="flex items-center gap-1 text-xs text-text-tertiary">
              <Clock className="h-3.5 w-3.5" />
              {(recipe.prepTime || 0) + (recipe.cookTime || 0)}m
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
