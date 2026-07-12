import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ratingApi from '../../api/rating.api';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../ui/Toast';
import RatingStars from '../ui/RatingStars';

export default function RatingWidget({ recipeId, averageRating = 0, ratingCount = 0 }) {
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const { data: myRatingData } = useQuery({
    queryKey: ['rating', recipeId, 'me'],
    queryFn: () => ratingApi.myRating(recipeId),
    enabled: isAuthenticated && !!recipeId,
  });
  const myScore = myRatingData?.data?.score || 0;

  const mutation = useMutation({
    mutationFn: (score) => ratingApi.rate(recipeId, score),
    onMutate: async (score) => {
      await queryClient.cancelQueries({ queryKey: ['rating', recipeId, 'me'] });
      const prev = queryClient.getQueryData(['rating', recipeId, 'me']);
      queryClient.setQueryData(['rating', recipeId, 'me'], { data: { score } });
      return { prev };
    },
    onError: (err, _s, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['rating', recipeId, 'me'], ctx.prev);
      error(err.response?.data?.message || 'Could not save rating');
    },
    onSuccess: (res) => {
      success('Thanks for rating!');
      // Patch the recipe detail cache with the fresh aggregate.
      queryClient.setQueryData(['recipes', recipeId], (old) => {
        if (!old?.data?.recipe) return old;
        return {
          ...old,
          data: {
            ...old.data,
            recipe: {
              ...old.data.recipe,
              averageRating: res.data.averageRating,
              ratingCount: res.data.ratingCount,
            },
          },
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['rating', recipeId, 'me'] });
    },
  });

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <div className="flex items-baseline gap-2">
        <span className="font-heading text-4xl">{averageRating?.toFixed(1) || '0.0'}</span>
        <span className="text-sm text-text-tertiary">
          ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
        </span>
      </div>
      <RatingStars value={averageRating} readOnly className="mt-2" />

      {isAuthenticated ? (
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <p className="mb-2 text-sm font-medium text-text-secondary">
            {myScore ? 'Your rating' : 'Rate this recipe'}
          </p>
          <RatingStars value={myScore} size="lg" onChange={(s) => mutation.mutate(s)} />
        </div>
      ) : (
        <p className="mt-4 border-t border-[var(--border)] pt-4 text-sm text-text-tertiary">
          Log in to rate this recipe.
        </p>
      )}
    </div>
  );
}
