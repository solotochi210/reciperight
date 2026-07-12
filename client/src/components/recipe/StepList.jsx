import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import { cldUrl } from '../../utils/cloudinary';
import { cn } from '../../utils/cn';

export default function StepList({ steps = [] }) {
  const ordered = [...steps].sort((a, b) => (a.order || 0) - (b.order || 0));
  const [completed, setCompleted] = useState({});

  const toggle = (i) => setCompleted((c) => ({ ...c, [i]: !c[i] }));

  return (
    <div>
      <h2 className="mb-5 font-heading text-2xl">Steps</h2>
      <ol className="relative space-y-6">
        {/* connecting line */}
        <div className="absolute bottom-4 left-[15px] top-4 w-px bg-[var(--border)]" aria-hidden />

        {ordered.map((step, i) => {
          const done = completed[i];
          return (
            <motion.li
              key={i}
              className={cn('relative flex gap-4 transition-opacity', done && 'opacity-50')}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: done ? 0.5 : 1, x: 0 }}
              viewport={{ once: true }}
            >
              <button
                onClick={() => toggle(i)}
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  done
                    ? 'border-[var(--accent-green)] bg-[var(--accent-green)] text-white'
                    : 'border-accent bg-white text-accent'
                )}
                aria-label={done ? 'Mark step incomplete' : 'Mark step complete'}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </button>

              <div className="flex-1 pb-2">
                <p className={cn('text-[15px] leading-relaxed', done && 'line-through')}>
                  {step.instruction}
                </p>
                {step.duration > 0 && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                    <Clock className="h-3 w-3" /> {step.duration} min
                  </span>
                )}
                {step.image?.url && (
                  <img
                    src={cldUrl(step.image.url, 'w_600,h_400,c_fill')}
                    alt={`Step ${i + 1}`}
                    loading="lazy"
                    className="mt-3 w-full max-w-md rounded-2xl object-cover"
                  />
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
