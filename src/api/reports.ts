import { api } from './index';

export interface FinancialReport {
  event: {
    id: string;
    name: string;
    type: string;
    status: string;
    creator: {
      id: string;
      name: string;
      email: string;
    };
    coordinator?: {
      id: string;
      name: string;
      email: string;
    };
  };
  budgets: Array<{
    category: string;
    budgetAmount: number;
    approvedAmount?: number;
    sponsorContribution: number;
  }>;
  expenses: Array<{
    itemName: string;
    category: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    addedBy: string;
    createdAt: string;
  }>;
  summary: {
    totalBudget: number;
    totalApprovedBudget: number;
    totalExpenses: number;
    totalSponsorContribution: number;
  };
}

export interface SummaryReport {
  id: string;
  name: string;
  type: string;
  status: string;
  totalBudget: number;
  totalApprovedBudget: number;
  totalExpenses: number;
  totalSponsorContribution: number;
}

export const reportsAPI = {
  getEventFinancialReport: async (eventId: string): Promise<FinancialReport> => {
    const response = await api.get(`/reports/event/${eventId}/financial`);
    return response.data;
  },

  getSummaryReport: async (): Promise<SummaryReport[]> => {
    const response = await api.get('/reports/summary');
    return response.data;
  }
};