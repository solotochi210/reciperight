import { useMutation, useQueryClient } from '@tanstack/react-query';
import savedApi from '../api/saved.api';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../store/AuthContext';

/**
 * Optimistic save/unsave toggle. Updates the recipe detail cache and any feed
 * lists immediately, rolling back on error.
 */
export function useSaveToggle(recipeId) {
  const queryClient = useQueryClient();
  const { error: toastError } = useToast();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: () => savedApi.toggle(recipeId),
    onMutate: async () => {
      if (!isAuthenticated) return {};
      await queryClient.cancelQueries({ queryKey: ['recipes', recipeId] });
      const prev = queryClient.getQueryData(['recipes', recipeId]);
      queryClient.setQueryData(['recipes', recipeId], (old) => {
        if (!old?.data?.recipe) return old;
        const r = old.data.recipe;
        return {
          ...old,
          data: {
            ...old.data,
            recipe: {
              ...r,
              isSaved: !r.isSaved,
              saveCount: Math.max(0, (r.saveCount || 0) + (r.isSaved ? -1 : 1)),
            },
          },
        };
      });
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['recipes', recipeId], ctx.prev);
      toastError(err.response?.data?.message || 'Could not update saved recipes');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
  });
}

export default useSaveToggle;
