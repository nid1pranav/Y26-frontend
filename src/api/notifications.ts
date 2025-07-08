import { api } from './index';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  targetRole?: string;
  sendToAll?: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

export const notificationsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationsResponse> => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  create: async (data: CreateNotificationRequest) => {
    const response = await api.post('/notifications', data);
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/mark-all-read');
  }
};