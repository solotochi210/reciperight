import { cn } from '../../utils/cn';

export default function Card({ children, glass = false, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-[20px] border border-[var(--border)] shadow-md',
        glass ? 'glass' : 'bg-white',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
