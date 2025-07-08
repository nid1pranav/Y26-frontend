import { api } from './index';

export interface Expense {
  id: string;
  itemName: string;
  quantity: number;
  amount: number;
  unitPrice: number;
  remarks?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
  eventId: string;
  categoryId: string;
  addedById: string;
  productId?: string;
  category: {
    id: string;
    name: string;
    description?: string;
  };
  addedBy: {
    id: string;
    name: string;
    email: string;
  };
  product?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface ExpenseSummary {
  category: {
    id: string;
    name: string;
    description?: string;
  };
  budgetAmount: number;
  totalExpense: number;
  remaining: number;
  expenseCount: number;
}

export interface CreateExpenseRequest {
  eventId: string;
  categoryId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  remarks?: string;
  productId?: string;
}

export interface UpdateExpenseRequest {
  itemName?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  remarks?: string;
}

export const expensesAPI = {
  getByEventId: async (eventId: string): Promise<Expense[]> => {
    const response = await api.get(`/expenses/event/${eventId}`);
    return response.data;
  },

  getSummaryByEventId: async (eventId: string): Promise<ExpenseSummary[]> => {
    const response = await api.get(`/expenses/event/${eventId}/summary`);
    return response.data;
  },

  create: async (data: CreateExpenseRequest): Promise<Expense> => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  update: async (id: string, data: UpdateExpenseRequest): Promise<Expense> => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  }
};