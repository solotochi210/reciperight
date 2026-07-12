import { cn } from '../../utils/cn';

const VARIANTS = {
  default: 'bg-bg-secondary text-text-secondary',
  accent: 'bg-accent-soft text-accent',
  green: 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]',
  muted: 'bg-black/5 text-text-tertiary',
};

export default function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
