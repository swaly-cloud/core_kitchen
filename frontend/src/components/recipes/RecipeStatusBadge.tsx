import { Badge } from '@/components/ui/Badge';
import type { RecipeStatus } from '@/types';

interface RecipeStatusBadgeProps {
  status: RecipeStatus;
}

const STATUS_CONFIG: Record<
  RecipeStatus,
  { label: string; variant: 'live' | 'muted' | 'warning' }
> = {
  DRAFT: { label: 'Draft', variant: 'muted' },
  PUBLISHED: { label: 'Live', variant: 'live' },
  ARCHIVED: { label: 'Archived', variant: 'warning' },
};

export function RecipeStatusBadge({ status }: RecipeStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
