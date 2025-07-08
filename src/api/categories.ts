import { api } from './index';

export interface BudgetCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  order?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export const categoriesAPI = {
  getAll: async (): Promise<BudgetCategory[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  create: async (data: CreateCategoryRequest): Promise<BudgetCategory> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryRequest): Promise<BudgetCategory> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};