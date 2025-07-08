import { api } from './index';

export interface Budget {
  id: string;
  amount: number;
  sponsorContribution: number;
  approvedAmount?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    description?: string;
  };
  eventId: string;
  categoryId: string;
}

export interface CreateBudgetRequest {
  budgets: {
    categoryId: string;
    amount: number;
    sponsorContribution?: number;
    remarks?: string;
  }[];
}

export interface ApproveBudgetRequest {
  status: 'APPROVED' | 'REJECTED';
  remarks: string;
  budgetAdjustments?: {
    categoryId: string;
    approvedAmount: number;
  }[];
}

export const budgetsAPI = {
  getByEventId: async (eventId: string): Promise<Budget[]> => {
    const response = await api.get(`/events/${eventId}/budgets`);
    return response.data;
  },

  createOrUpdate: async (eventId: string, data: CreateBudgetRequest): Promise<Budget[]> => {
    const response = await api.post(`/events/${eventId}/budgets`, data);
    return response.data;
  },

  approve: async (eventId: string, data: ApproveBudgetRequest) => {
    const response = await api.post(`/events/${eventId}/budgets/approve`, data);
    return response.data;
  }
};