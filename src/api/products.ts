import { api } from './index';

export interface Product {
  id: string;
  name: string;
  description?: string;
  unitPrice?: number;
  unit?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  unitPrice?: number;
  unit?: string;
  categoryId?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  unitPrice?: number;
  unit?: string;
  categoryId?: string;
  isActive?: boolean;
}

export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  create: async (data: CreateProductRequest): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  }
};