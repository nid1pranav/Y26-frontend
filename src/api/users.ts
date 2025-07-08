import { api } from './index';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EVENT_TEAM_LEAD' | 'FINANCE_TEAM' | 'FACILITIES_TEAM' | 'EVENT_COORDINATOR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: User['role'];
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: User['role'];
  isActive?: boolean;
}

export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};