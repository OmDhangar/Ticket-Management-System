import api from './axios';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignee?: { id: string; name: string; email: string } | null;
  createdBy: { id: string; name: string; email: string };
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  commentsCount?: number;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
  search?: string;
  myTickets?: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority?: string;
  dueDate?: string;
  assigneeId?: string;
}

export const ticketsApi = {
  getAll: (filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> =>
    api.get('/tickets', { params: filters }),
  getById: (id: string): Promise<{ success: boolean; data: Ticket }> =>
    api.get(`/tickets/${id}`),
  create: (payload: CreateTicketPayload): Promise<{ success: boolean; data: Ticket }> =>
    api.post('/tickets', payload),
  update: (id: string, payload: Partial<CreateTicketPayload>): Promise<{ success: boolean; data: Ticket }> =>
    api.patch(`/tickets/${id}`, payload),
  assign: (id: string, assigneeId: string | null): Promise<{ success: boolean; data: Ticket }> =>
    api.post(`/tickets/${id}/assign`, { assigneeId }),
  changeStatus: (id: string, status: string): Promise<{ success: boolean; data: Ticket }> =>
    api.post(`/tickets/${id}/status`, { status }),
  delete: (id: string): Promise<{ success: boolean; message: string }> =>
    api.delete(`/tickets/${id}`),
};
