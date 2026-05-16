import { Badge } from '@/components/ui/Badge';
import type { Allergen } from '@/types';

const ALLERGEN_LABELS: Record<Allergen, string> = {
  GLUTEN: 'Gluten',
  CRUSTACEANS: 'Crustacés',
  EGGS: 'Œufs',
  FISH: 'Poisson',
  PEANUTS: 'Arachides',
  SOYBEANS: 'Soja',
  MILK: 'Lait',
  NUTS: 'Fruits à coque',
  CELERY: 'Céleri',
  MUSTARD: 'Moutarde',
  SESAME: 'Sésame',
  SULPHITES: 'Sulfites',
  LUPIN: 'Lupin',
  MOLLUSCS: 'Mollusques',
};

interface AllergenBadgeProps {
  allergen: Allergen;
}

export function AllergenBadge({ allergen }: AllergenBadgeProps) {
  return <Badge variant="allergen">{ALLERGEN_LABELS[allergen]}</Badge>;
}

export { ALLERGEN_LABELS };
