import { useFieldArray, Controller } from 'react-hook-form';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import Button from '../ui/Button';
import ImageUpload from './ImageUpload';

function SortableStep({ id, index, field, register, control, errors, remove, canRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 rounded-2xl border border-[var(--border)] bg-white p-4"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-1 touch-none cursor-grab self-start text-text-tertiary hover:text-text-secondary active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
        {index + 1}
      </div>

      <div className="flex-1 space-y-3">
        <div>
          <textarea
            placeholder="Describe this step…"
            rows={2}
            {...register(`steps.${index}.instruction`)}
            className="w-full resize-none rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {errors?.steps?.[index]?.instruction && (
            <p className="mt-1 text-xs text-red-500">{errors.steps[index].instruction.message}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            Duration
            <input
              type="number"
              min="0"
              placeholder="0"
              {...register(`steps.${index}.duration`)}
              className="w-20 rounded-xl border border-[var(--border)] px-2.5 py-1.5 text-sm outline-none focus:border-accent"
            />
            min
          </label>

          <Controller
            control={control}
            name={`steps.${index}.image`}
            render={({ field: imgField }) => (
              <ImageUpload value={imgField.value} onChange={imgField.onChange} kind="step" compact />
            )}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => remove(index)}
        disabled={!canRemove}
        className="self-start rounded-full p-2 text-text-tertiary transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
        aria-label="Remove step"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function StepEditor({ control, register, errors, setValue }) {
  const { fields, append, remove, move } = useFieldArray({ control, name: 'steps' });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    move(oldIndex, newIndex);
    // Re-number the order field to match the new positions.
    const reordered = arrayMove(fields, oldIndex, newIndex);
    reordered.forEach((_, i) => setValue(`steps.${i}.order`, i + 1));
  };

  return (
    <div className="space-y-3">
      {errors?.steps?.message && <p className="text-sm text-red-500">{errors.steps.message}</p>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <SortableStep
                key={field.id}
                id={field.id}
                index={index}
                field={field}
                register={register}
                control={control}
                errors={errors}
                remove={remove}
                canRemove={fields.length > 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="secondary"
        onClick={() => append({ order: fields.length + 1, instruction: '', image: { url: '', publicId: '' }, duration: 0 })}
      >
        <Plus className="h-4 w-4" /> Add step
      </Button>
    </div>
  );
}
