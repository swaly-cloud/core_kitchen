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

export interface UsdaIngredient {
  fdcId: string;
  name: string;
  dataType: string;
}

export interface UsdaNutrient {
  nutrientId: number;
  name: string;
  amount: number;
  unitName: string;
}

export interface UsdaFood {
  fdcId: string;
  description: string;
  dataType: string;
  nutrients: UsdaNutrient[];
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

  // USDA FDC API integration
  searchUsda: (query: string, pageNumber = 0, pageSize = 20) =>
    api.get<UsdaIngredient[]>('/api/ingredients/usda/search', {
      params: { query, pageNumber, pageSize }
    }).then(r => r.data),
  getUsdaFood: (fdcId: string) =>
    api.get<UsdaFood>(`/api/ingredients/usda/${fdcId}`).then(r => r.data),
};
