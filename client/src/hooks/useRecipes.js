import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import recipeApi from '../api/recipe.api';

const LIMIT = 12;

/** Infinite, filterable discovery feed → GET /api/recipes */
export function useRecipesFeed(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['recipes', 'feed', filters],
    queryFn: ({ pageParam = 1 }) =>
      recipeApi.getRecipes({ ...filters, page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.meta || {};
      return page && pages && page < pages ? page + 1 : undefined;
    },
    staleTime: 60 * 1000,
  });
}

/** Infinite search results → GET /api/search */
export function useRecipeSearch(params = {}, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['recipes', 'search', params],
    queryFn: ({ pageParam = 1 }) =>
      recipeApi.searchRecipes({ ...params, page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.meta || {};
      return page && pages && page < pages ? page + 1 : undefined;
    },
    enabled,
    staleTime: 30 * 1000,
  });
}

/** Lightweight, debounced search for the navbar/search dropdown. */
export function useQuickSearch(q) {
  return useQuery({
    queryKey: ['recipes', 'quick-search', q],
    queryFn: () => recipeApi.searchRecipes({ q, limit: 5 }),
    enabled: !!q && q.trim().length > 1,
    staleTime: 30 * 1000,
  });
}

/** Single recipe detail (+ related). Used by the detail page. */
export function useRecipeDetail(id) {
  const recipe = useQuery({
    queryKey: ['recipes', id],
    queryFn: () => recipeApi.getRecipeById(id),
    enabled: !!id,
    staleTime: Infinity,
  });

  const related = useQuery({
    queryKey: ['recipes', id, 'related'],
    queryFn: () => recipeApi.getRelatedRecipes(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return { recipe, related };
}

/** Flatten infinite-query pages into a single recipe array. */
export function flattenPages(data) {
  return data?.pages?.flatMap((p) => p.data || []) ?? [];
}
