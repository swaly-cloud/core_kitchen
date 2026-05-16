import { api } from './client';
import type { Ingredient, IngredientPage, CreateIngredientRequest, UpdateIngredientRequest } from '@/types';

export interface IngredientListParams {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const ingredientsApi = {
  list: (params: IngredientListParams = {}) =>
    api.get<IngredientPage>('/api/ingredients', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<Ingredient>(`/api/ingredients/${id}`).then(r => r.data),
  create: (data: CreateIngredientRequest) =>
    api.post<Ingredient>('/api/ingredients', data).then(r => r.data),
  update: (id: string, data: UpdateIngredientRequest) =>
    api.put<Ingredient>(`/api/ingredients/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/api/ingredients/${id}`),
};
