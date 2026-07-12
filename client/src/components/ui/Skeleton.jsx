import { cn } from '../../utils/cn';

export default function Skeleton({ className, rounded = 'rounded-[14px]' }) {
  return <div className={cn('skeleton animate-shimmer', rounded, className)} />;
}
