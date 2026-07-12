import { UtensilsCrossed } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function EmptyState({ icon: Icon = UtensilsCrossed, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-20 text-center', className)}>
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft">
        <Icon className="h-9 w-9 text-accent" />
      </div>
      <h3 className="font-heading text-2xl">{title}</h3>
      {description && <p className="mt-2 max-w-md text-text-secondary">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
