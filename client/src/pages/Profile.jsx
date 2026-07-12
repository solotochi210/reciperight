import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Bookmark, UserPlus, UserCheck, BookOpen } from 'lucide-react';
import userApi from '../api/user.api';
import recipeApi from '../api/recipe.api';
import savedApi from '../api/saved.api';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../components/ui/Toast';
import PageWrapper from '../components/layout/PageWrapper';
import RecipeGrid from '../components/recipe/RecipeGrid';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import EditProfileModal from '../components/profile/EditProfileModal';
import { flattenPages } from '../hooks/useRecipes';
import { cn } from '../utils/cn';

export default function Profile() {
  const { userId: paramId } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const userId = paramId || me?._id;
  const isOwn = !paramId || String(paramId) === String(me?._id);

  const [tab, setTab] = useState('recipes');
  const [editing, setEditing] = useState(false);
  const [following, setFollowing] = useState(false);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => userApi.getProfile(userId),
    enabled: !!userId,
  });
  const profile = profileData?.data?.user;

  const recipesQuery = useInfiniteQuery({
    queryKey: ['profile', userId, 'recipes'],
    queryFn: ({ pageParam = 1 }) => recipeApi.getRecipesByUser(userId, { page: pageParam, limit: 12 }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { page, pages } = last.meta || {};
      return page && pages && page < pages ? page + 1 : undefined;
    },
    enabled: !!userId,
  });

  const savedQuery = useInfiniteQuery({
    queryKey: ['saved', 'list'],
    queryFn: ({ pageParam = 1 }) => savedApi.list({ page: pageParam, limit: 12 }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { page, pages } = last.meta || {};
      return page && pages && page < pages ? page + 1 : undefined;
    },
    enabled: isOwn && tab === 'saved',
  });

  const followMutation = useMutation({
    mutationFn: () => userApi.follow(userId),
    onMutate: () => setFollowing((f) => !f),
    onError: (err) => {
      setFollowing((f) => !f);
      error(err.response?.data?.message || 'Could not update follow');
    },
    onSuccess: (res) => setFollowing(res.data.following),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => recipeApi.deleteRecipe(id),
    onSuccess: () => {
      success('Recipe deleted');
      queryClient.invalidateQueries({ queryKey: ['profile', userId, 'recipes'] });
    },
    onError: (err) => error(err.response?.data?.message || 'Could not delete recipe'),
  });

  const unsaveMutation = useMutation({
    mutationFn: (id) => savedApi.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved', 'list'] });
    },
    onError: (err) => error(err.response?.data?.message || 'Could not unsave'),
  });

  const recipes = flattenPages(recipesQuery.data);
  const saved = flattenPages(savedQuery.data);

  if (profileLoading) {
    return (
      <PageWrapper className="py-10">
        <div className="h-40 w-full animate-shimmer skeleton rounded-[28px]" />
      </PageWrapper>
    );
  }

  if (!profile) {
    return (
      <PageWrapper className="py-24 text-center">
        <h1 className="font-heading text-3xl">User not found</h1>
      </PageWrapper>
    );
  }

  return (
    <div>
      <Helmet>
        <title>{profile.name} · RecipeRight</title>
      </Helmet>

      {/* Header */}
      <div className="accent-gradient relative h-44 w-full" />
      <PageWrapper className="-mt-16" animate={false}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <div className="rounded-full border-4 border-bg-primary bg-bg-primary">
              <Avatar src={profile.avatar?.url} name={profile.name} size="xl" />
            </div>
            <div className="pb-1 text-center sm:text-left">
              <h1 className="font-heading text-3xl">{profile.name}</h1>
              {profile.bio && <p className="mt-1 max-w-md text-text-secondary">{profile.bio}</p>}
              <div className="mt-2 flex items-center justify-center gap-4 text-sm text-text-secondary sm:justify-start">
                <span><b className="text-text-primary">{profile.recipeCount || 0}</b> recipes</span>
                <span><b className="text-text-primary">{profile.followerCount || 0}</b> followers</span>
                <span><b className="text-text-primary">{profile.followingCount || 0}</b> following</span>
              </div>
            </div>
          </div>

          <div className="pb-1">
            {isOwn ? (
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" /> Edit profile
              </Button>
            ) : (
              me && (
                <Button variant={following ? 'secondary' : 'primary'} onClick={() => followMutation.mutate()}>
                  {following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {following ? 'Following' : 'Follow'}
                </Button>
              )
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 border-b border-[var(--border)]">
          <button
            onClick={() => setTab('recipes')}
            className={cn(
              'relative px-4 py-3 text-sm font-medium transition',
              tab === 'recipes' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            My Recipes
            {tab === 'recipes' && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />}
          </button>
          {isOwn && (
            <button
              onClick={() => setTab('saved')}
              className={cn(
                'relative px-4 py-3 text-sm font-medium transition',
                tab === 'saved' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              Saved
              {tab === 'saved' && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="py-8">
          {tab === 'recipes' ? (
            recipesQuery.isLoading ? (
              <RecipeGrid loading />
            ) : recipes.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title={isOwn ? 'No recipes yet' : `${profile.name} hasn't posted yet`}
                description={isOwn ? 'Share your first recipe with the community.' : undefined}
                action={isOwn ? <Button to="/create">Create a recipe</Button> : undefined}
              />
            ) : (
              <RecipeGrid
                recipes={recipes}
                renderExtra={
                  isOwn
                    ? (r) => (
                        <div className="mt-2 flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => navigate(`/recipes/${r._id}/edit`)}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Delete this recipe?')) deleteMutation.mutate(r._id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      )
                    : undefined
                }
              />
            )
          ) : savedQuery.isLoading ? (
            <RecipeGrid loading />
          ) : saved.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="Nothing saved yet"
              description="Save recipes you love to find them here later."
              action={<Button to="/explore">Browse recipes</Button>}
            />
          ) : (
            <RecipeGrid
              recipes={saved}
              renderExtra={(r) => (
                <div className="mt-2">
                  <Button variant="secondary" size="sm" onClick={() => unsaveMutation.mutate(r._id)}>
                    <Bookmark className="h-3.5 w-3.5 fill-accent text-accent" /> Unsave
                  </Button>
                </div>
              )}
            />
          )}
        </div>
      </PageWrapper>

      {isOwn && <EditProfileModal open={editing} onClose={() => setEditing(false)} user={profile} />}
    </div>
  );
}
