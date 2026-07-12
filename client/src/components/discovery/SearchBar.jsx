import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';
import { useQuickSearch } from '../../hooks/useRecipes';
import { thumbUrl } from '../../utils/cloudinary';
import { cn } from '../../utils/cn';

export default function SearchBar({ expandable = true, className }) {
  const [open, setOpen] = useState(!expandable);
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const { data, isFetching } = useQuickSearch(debounced);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const results = data?.data?.slice(0, 5) || [];
  const showDropdown = open && debounced.trim().length > 1;

  useEffect(() => {
    if (open && expandable) inputRef.current?.focus();
  }, [open, expandable]);

  useEffect(() => {
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (expandable) setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [expandable]);

  const goToRecipe = (id) => {
    setQuery('');
    if (expandable) setOpen(false);
    navigate(`/recipes/${id}`);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <motion.form
        layout
        onSubmit={onSubmit}
        className={cn(
          'flex items-center gap-2 rounded-full border border-[var(--border)] bg-white transition-all',
          open ? 'w-full px-4 py-2.5' : 'w-11 cursor-pointer justify-center p-2.5'
        )}
        onClick={() => !open && setOpen(true)}
      >
        <Search className="h-5 w-5 shrink-0 text-text-tertiary" />
        {open && (
          <>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-text-tertiary"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear">
                <X className="h-4 w-4 text-text-tertiary" />
              </button>
            )}
          </>
        )}
      </motion.form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="glass absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-[var(--border)] shadow-lg"
          >
            {isFetching && results.length === 0 ? (
              <p className="px-4 py-4 text-sm text-text-tertiary">Searching…</p>
            ) : results.length === 0 ? (
              <p className="px-4 py-4 text-sm text-text-tertiary">No recipes found</p>
            ) : (
              results.map((r) => (
                <button
                  key={r._id}
                  onClick={() => goToRecipe(r._id)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/60"
                >
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-bg-secondary">
                    {r.coverImage?.url && (
                      <img src={thumbUrl(r.coverImage.url)} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="truncate text-xs text-text-tertiary">{r.author?.name}</p>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
