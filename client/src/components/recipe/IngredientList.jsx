import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Scales a numeric quantity string by a multiplier, preserving non-numeric
 * quantities (e.g. "a pinch") untouched. Handles simple fractions like "1/2".
 */
function scaleQuantity(quantity, multiplier) {
  if (!quantity) return '';
  const trimmed = String(quantity).trim();

  // Fraction e.g. "1/2"
  const frac = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) {
    const val = (Number(frac[1]) / Number(frac[2])) * multiplier;
    return formatNum(val);
  }

  const num = Number(trimmed);
  if (!Number.isNaN(num)) return formatNum(num * multiplier);

  // Mixed like "1 1/2"
  const mixed = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const val = (Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3])) * multiplier;
    return formatNum(val);
  }

  return quantity; // non-numeric, leave as-is
}

function formatNum(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}

export default function IngredientList({ ingredients = [], baseServings = 1 }) {
  const [servings, setServings] = useState(baseServings || 1);
  const [checked, setChecked] = useState({});
  const multiplier = (servings || 1) / (baseServings || 1);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-2xl">Ingredients</h2>
        <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white px-2 py-1">
          <button
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="rounded-full p-1.5 text-text-secondary transition hover:bg-bg-secondary"
            aria-label="Decrease servings"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[68px] text-center text-sm font-medium">
            {servings} {servings === 1 ? 'serving' : 'servings'}
          </span>
          <button
            onClick={() => setServings((s) => s + 1)}
            className="rounded-full p-1.5 text-text-secondary transition hover:bg-bg-secondary"
            aria-label="Increase servings"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ul className="space-y-1">
        {ingredients.map((ing, i) => {
          const isChecked = checked[i];
          return (
            <li key={i}>
              <label
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-bg-secondary',
                  isChecked && 'opacity-50'
                )}
              >
                <input
                  type="checkbox"
                  checked={!!isChecked}
                  onChange={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
                  className="mt-1 h-4 w-4 accent-[var(--accent)]"
                />
                <span className={cn('text-[15px]', isChecked && 'line-through')}>
                  {(ing.quantity || ing.unit) && (
                    <span className="font-semibold">
                      {scaleQuantity(ing.quantity, multiplier)} {ing.unit}{' '}
                    </span>
                  )}
                  {ing.name}
                  {ing.notes && <span className="text-text-tertiary"> — {ing.notes}</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
