import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

const UNITS = ['', 'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'piece', 'pinch', 'clove'];

export default function IngredientEditor({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' });

  return (
    <div className="space-y-3">
      {errors?.ingredients?.message && (
        <p className="text-sm text-red-500">{errors.ingredients.message}</p>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-wrap items-start gap-2 rounded-2xl border border-[var(--border)] bg-white p-3 sm:flex-nowrap">
          <input
            placeholder="Qty"
            {...register(`ingredients.${index}.quantity`)}
            className="w-16 rounded-xl border border-[var(--border)] px-2.5 py-2 text-sm outline-none focus:border-accent"
          />
          <select
            {...register(`ingredients.${index}.unit`)}
            className="w-24 rounded-xl border border-[var(--border)] px-2.5 py-2 text-sm outline-none focus:border-accent"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u || 'unit'}
              </option>
            ))}
          </select>
          <div className="min-w-[140px] flex-1">
            <input
              placeholder="Ingredient name"
              {...register(`ingredients.${index}.name`)}
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {errors?.ingredients?.[index]?.name && (
              <p className="mt-1 text-xs text-red-500">{errors.ingredients[index].name.message}</p>
            )}
          </div>
          <input
            placeholder="Notes (optional)"
            {...register(`ingredients.${index}.notes`)}
            className="min-w-[120px] flex-1 rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
            className="mt-1 rounded-full p-2 text-text-tertiary transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
            aria-label="Remove ingredient"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        onClick={() => append({ name: '', quantity: '', unit: '', notes: '' })}
      >
        <Plus className="h-4 w-4" /> Add ingredient
      </Button>
    </div>
  );
}
