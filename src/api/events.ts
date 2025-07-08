import { api } from './index';

export interface Event {
  id: string;
  name: string;
  description?: string;
  type: 'CULTURAL' | 'TECHNICAL' | 'WORKSHOP' | 'COMPETITION' | 'SEMINAR' | 'EVENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  expectedParticipants?: number;
  venue?: string;
  dateTime?: string;
  createdAt: string;
  updatedAt: string;
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
  budgets?: any[];
  budgetApprovals?: any[];
  expenses?: any[];
  _count?: {
    expenses: number;
  };
}

export interface CreateEventRequest {
  name: string;
  description?: string;
  type: Event['type'];
  expectedParticipants?: number;
  venue?: string;
  dateTime?: string;
  coordinatorId?: string;
}

export interface UpdateEventRequest {
  name?: string;
  description?: string;
  type?: Event['type'];
  expectedParticipants?: number;
  venue?: string;
  dateTime?: string;
  coordinatorId?: string;
}

export const eventsAPI = {
  getAll: async (): Promise<Event[]> => {
    const response = await api.get('/events');
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  create: async (data: CreateEventRequest): Promise<Event> => {
    const response = await api.post('/events', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEventRequest): Promise<Event> => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  }
};