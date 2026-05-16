import { Badge } from '@/components/ui/Badge';
import type { Allergen } from '@/types';

const ALLERGEN_LABELS: Record<Allergen, string> = {
  GLUTEN: 'gluten',
  CRUSTACEANS: 'crustacean',
  EGGS: 'egg',
  FISH: 'fish',
  PEANUTS: 'peanut',
  SOYBEANS: 'soy',
  MILK: 'milk',
  NUTS: 'nut',
  CELERY: 'celery',
  MUSTARD: 'mustard',
  SESAME: 'sesame',
  SULPHITES: 'sulphite',
  LUPIN: 'lupin',
  MOLLUSCS: 'mollusc',
};

interface AllergenBadgeProps {
  allergen: Allergen;
}

export function AllergenBadge({ allergen }: AllergenBadgeProps) {
  return (
    <Badge variant="allergen" dot>
      {ALLERGEN_LABELS[allergen]}
    </Badge>
  );
}

export { ALLERGEN_LABELS };
