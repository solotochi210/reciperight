import { SlidersHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';

export const CUISINES = ['Italian', 'Mexican', 'Indian', 'Japanese', 'Thai', 'French', 'Chinese', 'American', 'Mediterranean'];
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
export const SORTS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'averageRating', label: 'Top rated' },
  { value: 'saveCount', label: 'Most saved' },
  { value: 'prepTime', label: 'Quickest' },
];

function Pill({ active, children, ...props }) {
  return (
    <button
      className={cn(
        'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-accent bg-accent text-white'
          : 'border-[var(--border)] bg-white text-text-secondary hover:text-text-primary'
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default function FilterBar({ filters, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="space-y-4">
      {/* Cuisine pills */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        <Pill active={!filters.cuisine} onClick={() => set({ cuisine: '' })}>
          All cuisines
        </Pill>
        {CUISINES.map((c) => (
          <Pill key={c} active={filters.cuisine === c} onClick={() => set({ cuisine: filters.cuisine === c ? '' : c })}>
            {c}
          </Pill>
        ))}
      </div>

      {/* Difficulty + time + sort */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-text-tertiary" />
          {DIFFICULTIES.map((d) => (
            <Pill
              key={d}
              active={filters.difficulty === d}
              onClick={() => set({ difficulty: filters.difficulty === d ? '' : d })}
            >
              {d}
            </Pill>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-text-secondary">
            Max time: <span className="font-medium text-text-primary">{filters.maxTime || 120}m</span>
          </label>
          <input
            type="range"
            min="15"
            max="180"
            step="15"
            value={filters.maxTime || 120}
            onChange={(e) => set({ maxTime: Number(e.target.value) })}
            className="accent-[var(--accent)]"
          />
        </div>

        <select
          value={filters.sort || 'createdAt'}
          onChange={(e) => set({ sort: e.target.value })}
          className="ml-auto rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-text-primary outline-none focus:border-accent"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
