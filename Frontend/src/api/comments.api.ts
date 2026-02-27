import api from './axios';

export interface Comment {
  id: string;
  content: string;
  user: { id: string; name: string; email: string };
  createdAt: string;
}

export const commentsApi = {
  getByTicket: (ticketId: string): Promise<{ success: boolean; data: Comment[] }> =>
    api.get(`/tickets/${ticketId}/comments`),
  create: (ticketId: string, content: string): Promise<{ success: boolean; data: Comment }> =>
    api.post(`/tickets/${ticketId}/comments`, { content }),
};
