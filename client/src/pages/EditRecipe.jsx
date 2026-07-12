import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import recipeApi from '../api/recipe.api';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../store/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import RecipeWizard from '../components/forms/RecipeWizard';
import PageLoader from '../components/ui/PageLoader';

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['recipes', id],
    queryFn: () => recipeApi.getRecipeById(id),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (payload) => recipeApi.updateRecipe(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      success('Recipe updated');
      navigate(`/recipes/${res.data.recipe._id}`);
    },
    onError: (err) => error(err.response?.data?.message || 'Could not update recipe'),
  });

  if (isLoading) return <PageLoader />;

  const recipe = data?.data?.recipe;
  if (!recipe) {
    return (
      <PageWrapper className="py-24 text-center">
        <h1 className="font-heading text-3xl">Recipe not found</h1>
      </PageWrapper>
    );
  }

  if (String(recipe.author?._id) !== String(user?._id)) {
    return (
      <PageWrapper className="py-24 text-center">
        <h1 className="font-heading text-3xl">Not authorized</h1>
        <p className="mt-2 text-text-secondary">You can only edit your own recipes.</p>
      </PageWrapper>
    );
  }

  const defaultValues = {
    title: recipe.title || '',
    description: recipe.description || '',
    coverImage: recipe.coverImage || { url: '', publicId: '' },
    cuisine: recipe.cuisine || '',
    difficulty: recipe.difficulty || 'Easy',
    prepTime: recipe.prepTime || 0,
    cookTime: recipe.cookTime || 0,
    servings: recipe.servings || 1,
    tags: recipe.tags || [],
    ingredients: recipe.ingredients?.length
      ? recipe.ingredients
      : [{ name: '', quantity: '', unit: '', notes: '' }],
    steps: recipe.steps?.length
      ? recipe.steps.map((s, i) => ({ ...s, order: s.order || i + 1, image: s.image || { url: '', publicId: '' } }))
      : [{ order: 1, instruction: '', image: { url: '', publicId: '' }, duration: 0 }],
  };

  return (
    <PageWrapper className="max-w-3xl py-10">
      <Helmet>
        <title>Edit recipe · RecipeRight</title>
      </Helmet>
      <h1 className="mb-8 font-heading text-4xl">Edit recipe</h1>
      <RecipeWizard
        defaultValues={defaultValues}
        onSubmit={(payload) => mutation.mutate(payload)}
        submitting={mutation.isPending}
        mode="edit"
      />
    </PageWrapper>
  );
}
