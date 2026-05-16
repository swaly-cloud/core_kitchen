import { cn } from '@/lib/utils';

type Variant =
  | 'default'
  | 'outline'
  | 'allergen'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted'
  | 'live';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  dot?: boolean;
  className?: string;
}

const variants: Record<Variant, string> = {
  default: 'bg-brand-100 text-brand-800 ring-1 ring-inset ring-brand-200',
  outline: 'border border-stone-300 text-stone-700 bg-white',
  allergen: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
  success: 'bg-brand-100 text-brand-800 ring-1 ring-inset ring-brand-200',
  warning: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  info: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  muted: 'bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200',
  live: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200',
};

const dotColors: Record<Variant, string> = {
  default: 'bg-brand-500',
  outline: 'bg-stone-400',
  allergen: 'bg-amber-500',
  success: 'bg-brand-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
  muted: 'bg-stone-400',
  live: 'bg-brand-500',
};

export function Badge({
  children,
  variant = 'default',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
