import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';
import { useRecipesFeed, flattenPages } from '../hooks/useRecipes';
import PageWrapper from '../components/layout/PageWrapper';
import FilterBar from '../components/discovery/FilterBar';
import RecipeGrid from '../components/recipe/RecipeGrid';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import SearchBar from '../components/discovery/SearchBar';

const DEFAULT_FILTERS = { cuisine: '', difficulty: '', maxTime: 120, sort: 'createdAt' };

export default function Home() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRecipesFeed(filters);

  const recipes = flattenPages(data);

  return (
    <div>
      <Helmet>
        <title>RecipeRight · Discover, Cook, Share</title>
        <meta name="description" content="Discover community recipes, cook something new, and share your own." />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #ECEBFD 0%, #FAF9FD 55%, #EFEDF7 100%)' }}
        />
        <PageWrapper className="relative py-20 sm:py-28" animate={false}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="font-heading text-5xl leading-[1.05] sm:text-6xl">
              Discover. Cook. <span className="accent-text">Share.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-text-secondary">
              A community kitchen where home cooks share their favourite recipes. Find your next
              meal, save the ones you love, and post your own.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button to="/explore" size="lg">
                Explore recipes <ArrowRight className="h-4 w-4" />
              </Button>
              <Button to="/create" size="lg" variant="secondary">
                Share a recipe
              </Button>
            </div>
            <div className="mt-8 max-w-md">
              <SearchBar expandable={false} />
            </div>
          </motion.div>
        </PageWrapper>
      </section>

      {/* Feed */}
      <PageWrapper className="py-12" animate={false}>
        <div className="mb-8">
          <h2 className="mb-5 font-heading text-3xl">Fresh from the community</h2>
          <FilterBar filters={filters} onChange={setFilters} />
        </div>

        {isError ? (
          <EmptyState
            title="Couldn't load recipes"
            description="Something went wrong fetching the feed. Please try again."
          />
        ) : !isLoading && recipes.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="Be the first to share a recipe!"
            description="No recipes match these filters yet."
            action={<Button to="/create">Create a recipe</Button>}
          />
        ) : (
          <>
            <RecipeGrid recipes={recipes} loading={isLoading} />
            {hasNextPage && (
              <div className="mt-10 flex justify-center">
                <Button variant="secondary" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </PageWrapper>
    </div>
  );
}
