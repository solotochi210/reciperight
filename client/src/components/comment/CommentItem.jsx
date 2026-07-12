import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Trash2, ChevronDown } from 'lucide-react';
import commentApi from '../../api/comment.api';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../ui/Toast';
import Avatar from '../ui/Avatar';
import ReplyForm from './ReplyForm';
import { cn } from '../../utils/cn';

function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CommentItem({ comment, recipeId, isReply = false }) {
  const { user, isAuthenticated } = useAuth();
  const { error } = useToast();
  const queryClient = useQueryClient();
  const [showReplies, setShowReplies] = useState(false);
  const [replying, setReplying] = useState(false);

  const liked = comment.likes?.some((id) => String(id) === String(user?._id));
  const [optimisticLike, setOptimisticLike] = useState({ liked, count: comment.likes?.length || 0 });

  const replies = useQuery({
    queryKey: ['comments', 'replies', comment._id],
    queryFn: () => commentApi.getReplies(comment._id),
    enabled: showReplies,
  });

  const likeMutation = useMutation({
    mutationFn: () => commentApi.like(comment._id),
    onMutate: () => {
      setOptimisticLike((s) => ({ liked: !s.liked, count: s.count + (s.liked ? -1 : 1) }));
    },
    onError: (err) => {
      setOptimisticLike((s) => ({ liked: !s.liked, count: s.count + (s.liked ? -1 : 1) }));
      error(err.response?.data?.message || 'Could not like comment');
    },
  });

  const replyMutation = useMutation({
    mutationFn: (content) => commentApi.reply(comment._id, recipeId, content),
    onSuccess: () => {
      setReplying(false);
      setShowReplies(true);
      queryClient.invalidateQueries({ queryKey: ['comments', 'replies', comment._id] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'recipe', recipeId] });
    },
    onError: (err) => error(err.response?.data?.message || 'Could not post reply'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => commentApi.remove(comment._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'recipe', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'replies', comment._id] });
    },
    onError: (err) => error(err.response?.data?.message || 'Could not delete comment'),
  });

  const isOwner = String(comment.author?._id) === String(user?._id);
  const replyList = replies.data?.data || [];

  return (
    <div className={cn('flex gap-3', isReply && 'mt-4')}>
      <Avatar src={comment.author?.avatar?.url} name={comment.author?.name} size="md" />
      <div className="flex-1">
        <div className="rounded-2xl bg-bg-secondary px-4 py-3">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-semibold">{comment.author?.name}</span>
            <span className="text-xs text-text-tertiary">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className={cn('text-[15px]', comment.isDeleted && 'italic text-text-tertiary')}>
            {comment.content}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-1.5 flex items-center gap-4 px-2 text-xs">
          <button
            onClick={() => isAuthenticated && likeMutation.mutate()}
            disabled={!isAuthenticated}
            className={cn('flex items-center gap-1 font-medium transition', optimisticLike.liked ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary')}
          >
            <Heart className={cn('h-3.5 w-3.5', optimisticLike.liked && 'fill-accent')} />
            {optimisticLike.count > 0 && optimisticLike.count}
          </button>

          {!isReply && isAuthenticated && (
            <button
              onClick={() => setReplying((r) => !r)}
              className="flex items-center gap-1 font-medium text-text-tertiary transition hover:text-text-secondary"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Reply
            </button>
          )}

          {isOwner && !comment.isDeleted && (
            <button
              onClick={() => deleteMutation.mutate()}
              className="flex items-center gap-1 font-medium text-text-tertiary transition hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>

        {/* Reply form */}
        <AnimatePresence>
          {replying && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3">
              <ReplyForm
                compact
                placeholder={`Reply to ${comment.author?.name}…`}
                submitting={replyMutation.isPending}
                onCancel={() => setReplying(false)}
                onSubmit={(content) => replyMutation.mutate(content)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replies toggle */}
        {!isReply && comment.replyCount > 0 && (
          <button
            onClick={() => setShowReplies((s) => !s)}
            className="mt-2 flex items-center gap-1 px-2 text-xs font-medium text-accent"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', showReplies && 'rotate-180')} />
            {showReplies ? 'Hide' : 'Show'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
          </button>
        )}

        {/* Replies (indented with connector) */}
        <AnimatePresence>
          {showReplies && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ml-3 mt-2 border-l-2 border-[var(--border)] pl-4"
            >
              {replies.isLoading ? (
                <p className="py-2 text-xs text-text-tertiary">Loading replies…</p>
              ) : (
                replyList.map((r) => (
                  <CommentItem key={r._id} comment={r} recipeId={recipeId} isReply />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
