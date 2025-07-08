import { api } from './index';

export interface Venue {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  facilities?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  events?: Array<{
    id: string;
    title: string;
    dateTime: string | null;
    status: string;
  }>;
}

export interface CreateVenueRequest {
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  facilities?: string;
}

export interface UpdateVenueRequest {
  name?: string;
  description?: string;
  capacity?: number;
  location?: string;
  facilities?: string;
  isActive?: boolean;
}

export const venuesAPI = {
  getAll: async (): Promise<Venue[]> => {
    const response = await api.get('/venues');
    return response.data;
  },

  create: async (data: CreateVenueRequest): Promise<Venue> => {
    const response = await api.post('/venues', data);
    return response.data;
  },

  update: async (id: string, data: UpdateVenueRequest): Promise<Venue> => {
    const response = await api.put(`/venues/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/venues/${id}`);
  },

  assignVenue: async (venueId: string, eventId: string) => {
    const response = await api.post(`/venues/${venueId}/assign/${eventId}`);
    return response.data;
  },

  getEventsForAssignment: async () => {
    const response = await api.get('/venues/events-for-assignment');
    return response.data;
  }
};