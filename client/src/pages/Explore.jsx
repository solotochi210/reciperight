import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Sparkles } from 'lucide-react';
import { useRecipeSearch, flattenPages } from '../hooks/useRecipes';
import useDebounce from '../hooks/useDebounce';
import PageWrapper from '../components/layout/PageWrapper';
import RecipeGrid from '../components/recipe/RecipeGrid';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { CUISINES, DIFFICULTIES, SORTS } from '../components/discovery/FilterBar';
import { cn } from '../utils/cn';

const POPULAR_TAGS = ['vegan', 'quick', 'dessert', 'healthy', 'comfort-food', 'gluten-free', 'breakfast', 'dinner'];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [tags, setTags] = useState([]);
  const [cuisine, setCuisine] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxTime, setMaxTime] = useState(180);
  const [sort, setSort] = useState('createdAt');

  const debouncedQ = useDebounce(q, 300);

  useEffect(() => {
    setSearchParams(debouncedQ ? { q: debouncedQ } : {}, { replace: true });
  }, [debouncedQ, setSearchParams]);

  const params = useMemo(
    () => ({
      q: debouncedQ || undefined,
      tags: tags.length ? tags.join(',') : undefined,
      cuisine: cuisine || undefined,
      difficulty: difficulty || undefined,
      maxTime,
      sort,
    }),
    [debouncedQ, tags, cuisine, difficulty, maxTime, sort]
  );

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useRecipeSearch(params);
  const recipes = flattenPages(data);

  const toggleTag = (t) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  return (
    <PageWrapper className="py-10">
      <Helmet>
        <title>Explore · RecipeRight</title>
      </Helmet>

      <h1 className="mb-6 font-heading text-4xl">Explore recipes</h1>

      {/* Search input */}
      <div className="relative mb-8">
        <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, ingredient, or tag…"
          className="w-full rounded-full border border-[var(--border)] bg-white py-4 pl-14 pr-5 text-lg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar filters */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((t) => (
                <button key={t} onClick={() => toggleTag(t)}>
                  <Badge variant={tags.includes(t) ? 'accent' : 'muted'}>{t}</Badge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">Cuisine</h3>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">Any cuisine</option>
              {CUISINES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">Difficulty</h3>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(difficulty === d ? '' : d)}
                  className={cn(
                    'flex-1 rounded-xl border px-2 py-2 text-sm font-medium transition',
                    difficulty === d ? 'border-accent bg-accent text-white' : 'border-[var(--border)] text-text-secondary'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
              Max time: {maxTime}m
            </h3>
            <input
              type="range"
              min="15"
              max="240"
              step="15"
              value={maxTime}
              onChange={(e) => setMaxTime(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-tertiary">Sort</h3>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Results */}
        <div>
          {!isLoading && recipes.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title={debouncedQ ? `Nothing found for "${debouncedQ}"` : 'No recipes match your filters'}
              description="Try removing a filter or searching for something else."
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
        </div>
      </div>
    </PageWrapper>
  );
}
