'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogCloseButton,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { ALLERGEN_LABELS } from './AllergenBadge';
import { useCreateIngredient, useUpdateIngredient } from '@/hooks/useIngredients';
import type { Ingredient, Unit, Allergen } from '@/types';

const UNITS: { value: Unit; label: string }[] = [
  { value: 'KG', label: 'Kilogramme (kg)' },
  { value: 'G', label: 'Gramme (g)' },
  { value: 'L', label: 'Litre (L)' },
  { value: 'ML', label: 'Millilitre (ml)' },
  { value: 'CL', label: 'Centilitre (cl)' },
  { value: 'PIECE', label: 'Pièce' },
  { value: 'BUNCH', label: 'Botte' },
  { value: 'PORTION', label: 'Portion' },
];

const ALL_ALLERGENS = Object.keys(ALLERGEN_LABELS) as Allergen[];

const schema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  unit: z.enum(['KG', 'G', 'L', 'ML', 'CL', 'PIECE', 'BUNCH', 'PORTION'] as const),
  costPerUnit: z.coerce.number().min(0, 'Le coût doit être positif'),
  category: z.string().optional(),
  supplier: z.string().optional(),
  allergens: z.array(z.enum(['GLUTEN', 'CRUSTACEANS', 'EGGS', 'FISH', 'PEANUTS', 'SOYBEANS', 'MILK', 'NUTS', 'CELERY', 'MUSTARD', 'SESAME', 'SULPHITES', 'LUPIN', 'MOLLUSCS'] as const)).optional(),
});

type FormValues = z.infer<typeof schema>;

interface IngredientModalProps {
  open: boolean;
  onClose: () => void;
  ingredient?: Ingredient;
}

export function IngredientModal({ open, onClose, ingredient }: IngredientModalProps) {
  const isEdit = !!ingredient;
  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      unit: 'KG',
      costPerUnit: 0,
      category: '',
      supplier: '',
      allergens: [],
    },
  });

  useEffect(() => {
    if (open && ingredient) {
      reset({
        name: ingredient.name,
        unit: ingredient.unit,
        costPerUnit: ingredient.costPerUnit,
        category: ingredient.category ?? '',
        supplier: ingredient.supplier ?? '',
        allergens: ingredient.allergens,
      });
    } else if (open && !ingredient) {
      reset({
        name: '',
        unit: 'KG',
        costPerUnit: 0,
        category: '',
        supplier: '',
        allergens: [],
      });
    }
  }, [open, ingredient, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      unit: values.unit,
      costPerUnit: values.costPerUnit,
      category: values.category || undefined,
      supplier: values.supplier || undefined,
      allergens: values.allergens,
    };

    if (isEdit) {
      await updateMutation.mutateAsync({ id: ingredient.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier l\'ingrédient' : 'Nouvel ingrédient'}</DialogTitle>
          <DialogCloseButton onClose={onClose} />
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 px-6 py-5">
            <FormField id="name" label="Nom" error={errors.name?.message}>
              <Input
                id="name"
                {...register('name')}
                error={!!errors.name}
                placeholder="Ex : Farine de blé"
              />
            </FormField>

            <FormField id="unit" label="Unité" error={errors.unit?.message}>
              <Select id="unit" {...register('unit')} error={!!errors.unit}>
                {UNITS.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </Select>
            </FormField>

            <FormField
              id="costPerUnit"
              label="Coût par unité (€)"
              error={errors.costPerUnit?.message}
            >
              <Input
                id="costPerUnit"
                type="number"
                step="0.0001"
                min="0"
                {...register('costPerUnit')}
                error={!!errors.costPerUnit}
                placeholder="0.0000"
              />
            </FormField>

            <FormField id="category" label="Catégorie (optionnel)" error={errors.category?.message}>
              <Input
                id="category"
                {...register('category')}
                placeholder="Ex : Produits laitiers"
              />
            </FormField>

            <FormField id="supplier" label="Fournisseur (optionnel)" error={errors.supplier?.message}>
              <Input
                id="supplier"
                {...register('supplier')}
                placeholder="Ex : Metro"
              />
            </FormField>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700">Allergènes</p>
              <Controller
                name="allergens"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2 rounded-md border border-zinc-200 p-3">
                    {ALL_ALLERGENS.map(allergen => (
                      <label key={allergen} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-zinc-300 accent-brand-600"
                          checked={field.value?.includes(allergen) ?? false}
                          onChange={e => {
                            const current = field.value ?? [];
                            if (e.target.checked) {
                              field.onChange([...current, allergen]);
                            } else {
                              field.onChange(current.filter(a => a !== allergen));
                            }
                          }}
                        />
                        <span className="text-sm text-zinc-700">{ALLERGEN_LABELS[allergen]}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
              Annuler
            </Button>
            <Button type="submit" loading={isPending}>
              {isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
