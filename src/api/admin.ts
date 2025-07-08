import { api } from './index';

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  pendingEvents: number;
  approvedEvents: number;
  totalExpenses: number;
  totalBudget: number;
}

export interface LogsResponse {
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const adminAPI = {
  getLogs: async (params?: {
    page?: number;
    limit?: number;
    entity?: string;
    userId?: string;
  }): Promise<LogsResponse> => {
    const response = await api.get('/admin/logs', { params });
    return response.data;
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  }
};