import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

const SIZE = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' };

/**
 * Star rating with half-star display precision.
 * - readOnly: just renders `value` (supports halves)
 * - interactive: hover preview + onChange(score)
 */
export default function RatingStars({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  className,
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} role={readOnly ? 'img' : 'radiogroup'}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPct = Math.max(0, Math.min(1, display - (star - 1))) * 100;
        return (
          <motion.button
            key={star}
            type="button"
            whileTap={readOnly ? undefined : { scale: 0.85 }}
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onChange?.(star)}
            className={cn('relative', !readOnly && 'cursor-pointer')}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star className={cn(SIZE[size], 'text-[var(--border)]')} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPct}%` }}>
              <Star className={cn(SIZE[size], 'fill-accent text-accent')} />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
