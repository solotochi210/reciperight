import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBlocker } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { recipeSchema } from '../../utils/validators';
import { CUISINES } from '../discovery/FilterBar';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ImageUpload from './ImageUpload';
import IngredientEditor from './IngredientEditor';
import StepEditor from './StepEditor';
import IngredientList from '../recipe/IngredientList';
import StepList from '../recipe/StepList';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { cn } from '../../utils/cn';

const STEPS = ['Basics', 'Ingredients', 'Steps', 'Review'];
const STEP_FIELDS = [
  ['title', 'description', 'cuisine', 'difficulty', 'prepTime', 'cookTime', 'servings', 'tags', 'coverImage'],
  ['ingredients'],
  ['steps'],
  [],
];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

function ProgressBar({ current }) {
  return (
    <div className="mb-10 flex items-center">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  done && 'bg-[var(--accent-green)] text-white',
                  active && 'bg-accent text-white',
                  !done && !active && 'bg-bg-secondary text-text-tertiary'
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn('mt-1.5 text-xs font-medium', active ? 'text-text-primary' : 'text-text-tertiary')}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('mx-2 h-0.5 flex-1 rounded-full transition-colors', done ? 'bg-[var(--accent-green)]' : 'bg-bg-secondary')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RecipeWizard({ defaultValues, onSubmit, submitting, mode = 'create' }) {
  const [step, setStep] = useState(0);
  const [tagInput, setTagInput] = useState('');

  const form = useForm({
    resolver: zodResolver(recipeSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      coverImage: { url: '', publicId: '' },
      cuisine: '',
      difficulty: 'Easy',
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      tags: [],
      ingredients: [{ name: '', quantity: '', unit: '', notes: '' }],
      steps: [{ order: 1, instruction: '', image: { url: '', publicId: '' }, duration: 0 }],
    },
    mode: 'onBlur',
  });

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty, isSubmitSuccessful },
  } = form;

  // Warn on navigation away with unsaved changes.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !isSubmitSuccessful && currentLocation.pathname !== nextLocation.pathname
  );

  const tags = watch('tags') || [];
  const description = watch('description') || '';
  const difficulty = watch('difficulty');
  const coverImage = watch('coverImage');

  const next = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const addTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase();
      if (t && !tags.includes(t) && tags.length < 10) {
        setValue('tags', [...tags, t], { shouldDirty: true });
      }
      setTagInput('');
    }
  };
  const removeTag = (t) => setValue('tags', tags.filter((x) => x !== t), { shouldDirty: true });

  const submit = (isPublished) => handleSubmit((data) => onSubmit({ ...data, isPublished }))();

  return (
    <div>
      <ProgressBar current={step} />

      <form onSubmit={(e) => e.preventDefault()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* STEP 1 — Basics */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-secondary">Cover photo</label>
                  <ImageUpload value={coverImage} onChange={(v) => setValue('coverImage', v, { shouldDirty: true })} kind="cover" className="max-w-md" />
                </div>

                <Input label="Title" error={errors.title?.message} {...register('title')} />

                <div>
                  <textarea
                    placeholder="Description"
                    rows={4}
                    maxLength={500}
                    {...register('description')}
                    className="w-full resize-none rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                  <div className="mt-1 flex justify-between text-xs text-text-tertiary">
                    <span className="text-red-500">{errors.description?.message}</span>
                    <span>{description.length}/500</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Cuisine</label>
                    <select
                      {...register('cuisine')}
                      className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[15px] outline-none focus:border-accent"
                    >
                      <option value="">Select cuisine</option>
                      {CUISINES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Difficulty</label>
                    <div className="flex gap-2">
                      {DIFFICULTIES.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setValue('difficulty', d, { shouldDirty: true })}
                          className={cn(
                            'flex-1 rounded-2xl border px-3 py-3 text-sm font-medium transition',
                            difficulty === d ? 'border-accent bg-accent text-white' : 'border-[var(--border)] text-text-secondary'
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Prep (min)</label>
                    <input type="number" min="0" {...register('prepTime')} className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Cook (min)</label>
                    <input type="number" min="0" {...register('cookTime')} className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Servings</label>
                    <input type="number" min="1" {...register('servings')} className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-accent" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-secondary">Tags (press Enter to add, max 10)</label>
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="e.g. vegan, quick, dessert"
                    className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-accent"
                  />
                  {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.map((t) => (
                        <button key={t} type="button" onClick={() => removeTag(t)}>
                          <Badge variant="accent">
                            {t} <X className="h-3 w-3" />
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2 — Ingredients */}
            {step === 1 && (
              <div>
                <h2 className="mb-4 font-heading text-2xl">Ingredients</h2>
                <IngredientEditor control={control} register={register} errors={errors} />
              </div>
            )}

            {/* STEP 3 — Steps */}
            {step === 2 && (
              <div>
                <h2 className="mb-4 font-heading text-2xl">Steps</h2>
                <p className="mb-4 text-sm text-text-tertiary">Drag the handle to reorder steps.</p>
                <StepEditor control={control} register={register} errors={errors} setValue={setValue} />
              </div>
            )}

            {/* STEP 4 — Review */}
            {step === 3 && (
              <div className="space-y-8">
                <h2 className="font-heading text-2xl">Review your recipe</h2>
                {coverImage?.url && (
                  <img src={coverImage.url} alt="" className="aspect-[16/9] w-full rounded-2xl object-cover" />
                )}
                <div>
                  <h1 className="font-heading text-3xl">{getValues('title')}</h1>
                  <p className="mt-2 text-text-secondary">{getValues('description')}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <Badge key={t} variant="accent">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                  <IngredientList ingredients={getValues('ingredients')} baseServings={getValues('servings')} />
                  <StepList steps={getValues('steps')} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
          <Button type="button" variant="ghost" onClick={back} disabled={step === 0}>
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Next
            </Button>
          ) : (
            <div className="flex flex-1 flex-wrap justify-end gap-2 sm:flex-none">
              <Button type="button" variant="secondary" loading={submitting} onClick={() => submit(false)}>
                Save as draft
              </Button>
              <Button type="button" loading={submitting} onClick={() => submit(true)}>
                {mode === 'edit' ? 'Save changes' : 'Publish recipe'}
              </Button>
            </div>
          )}
        </div>
      </form>

      {/* Unsaved changes guard */}
      <Modal
        open={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        title="Discard unsaved changes?"
      >
        <p className="text-text-secondary">You have unsaved changes. Are you sure you want to leave this page?</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => blocker.reset?.()}>
            Keep editing
          </Button>
          <Button variant="danger" onClick={() => blocker.proceed?.()}>
            Discard
          </Button>
        </div>
      </Modal>
    </div>
  );
}
