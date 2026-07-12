import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import recipeApi from '../api/recipe.api';
import { useToast } from '../components/ui/Toast';
import PageWrapper from '../components/layout/PageWrapper';
import RecipeWizard from '../components/forms/RecipeWizard';

export default function CreateRecipe() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => recipeApi.createRecipe(data),
    onSuccess: (res) => {
      const recipe = res.data.recipe;
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      success(recipe.isPublished ? 'Recipe published!' : 'Draft saved');
      navigate(`/recipes/${recipe._id}`);
    },
    onError: (err) => error(err.response?.data?.message || 'Could not save recipe'),
  });

  return (
    <PageWrapper className="max-w-3xl py-10">
      <Helmet>
        <title>Create recipe · RecipeRight</title>
      </Helmet>
      <h1 className="mb-8 font-heading text-4xl">Create a recipe</h1>
      <RecipeWizard onSubmit={(data) => mutation.mutate(data)} submitting={mutation.isPending} mode="create" />
    </PageWrapper>
  );
}
