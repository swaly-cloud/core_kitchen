import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'allergen';
  className?: string;
}

const variants = {
  default: 'bg-brand-100 text-brand-700',
  outline: 'border border-zinc-300 text-zinc-600',
  allergen: 'bg-amber-100 text-amber-800',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
