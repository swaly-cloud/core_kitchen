import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ingredientsApi, type IngredientListParams, type UsdaFood } from '@/lib/api/ingredients';
import type { CreateIngredientRequest, UpdateIngredientRequest } from '@/types';

export function useIngredients(params: IngredientListParams = {}) {
  return useQuery({
    queryKey: ['ingredients', params],
    queryFn: () => ingredientsApi.list(params),
  });
}

export function useIngredient(id: string | null) {
  return useQuery({
    queryKey: ['ingredients', id],
    queryFn: () => ingredientsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIngredientRequest) => ingredientsApi.create(data),
    onSuccess: () => {
      toast.success('Ingrédient créé');
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    },
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIngredientRequest }) =>
      ingredientsApi.update(id, data),
    onSuccess: () => {
      toast.success('Ingrédient mis à jour');
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ingredientsApi.delete(id),
    onSuccess: () => {
      toast.success('Ingrédient supprimé');
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });
}

export function useSearchUsda(query: string, pageNumber = 0, pageSize = 20) {
  return useQuery({
    queryKey: ['usda-search', query, pageNumber, pageSize],
    queryFn: () => ingredientsApi.searchUsda(query, pageNumber, pageSize),
    enabled: query.length > 0,
  });
}

export function useUsdaFood(fdcId: string | null) {
  return useQuery({
    queryKey: ['usda-food', fdcId],
    queryFn: () => ingredientsApi.getUsdaFood(fdcId!),
    enabled: !!fdcId,
  });
}
