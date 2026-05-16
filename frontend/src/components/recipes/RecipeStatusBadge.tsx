import { Badge } from '@/components/ui/Badge';
import type { RecipeStatus } from '@/types';

interface RecipeStatusBadgeProps {
  status: RecipeStatus;
}

const STATUS_CONFIG: Record<RecipeStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Brouillon',
    className: 'border border-zinc-300 text-zinc-600',
  },
  PUBLISHED: {
    label: 'Publiée',
    className: 'bg-green-100 text-green-800',
  },
  ARCHIVED: {
    label: 'Archivée',
    className: 'bg-amber-100 text-amber-800',
  },
};

export function RecipeStatusBadge({ status }: RecipeStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
