import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import commentApi from '../../api/comment.api';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../ui/Toast';
import ReplyForm from './ReplyForm';
import CommentItem from './CommentItem';
import Button from '../ui/Button';

export default function CommentThread({ recipeId }) {
  const { isAuthenticated } = useAuth();
  const { error } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['comments', 'recipe', recipeId],
    queryFn: ({ pageParam = 1 }) => commentApi.getForRecipe(recipeId, { page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { page, pages } = last.meta || {};
      return page && pages && page < pages ? page + 1 : undefined;
    },
    enabled: !!recipeId,
  });

  const comments = data?.pages.flatMap((p) => p.data || []) ?? [];
  const total = data?.pages?.[0]?.meta?.total ?? comments.length;

  const createMutation = useMutation({
    mutationFn: (content) => commentApi.create(recipeId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'recipe', recipeId] });
    },
    onError: (err) => error(err.response?.data?.message || 'Could not post comment'),
  });

  return (
    <section className="mt-12">
      <h2 className="mb-6 flex items-center gap-2 font-heading text-2xl">
        <MessageSquare className="h-6 w-6 text-accent" />
        Comments {total > 0 && <span className="text-text-tertiary">({total})</span>}
      </h2>

      {isAuthenticated ? (
        <div className="mb-8">
          <ReplyForm
            submitting={createMutation.isPending}
            onSubmit={(content, reset) =>
              createMutation.mutate(content, { onSuccess: reset })
            }
          />
        </div>
      ) : (
        <p className="mb-8 rounded-2xl bg-bg-secondary px-4 py-3 text-sm text-text-secondary">
          Log in to join the conversation.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-text-tertiary">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-text-tertiary">No comments yet — be the first!</p>
      ) : (
        <div className="space-y-6">
          {comments.map((c) => (
            <CommentItem key={c._id} comment={c} recipeId={recipeId} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
            Load more comments
          </Button>
        </div>
      )}
    </section>
  );
}
