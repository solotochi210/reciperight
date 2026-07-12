import clsx from 'clsx';

/**
 * Tiny className combiner. Wraps clsx so components stay terse.
 * Usage: cn('base', condition && 'active', props.className)
 */
export function cn(...inputs) {
  return clsx(inputs);
}

export default cn;
