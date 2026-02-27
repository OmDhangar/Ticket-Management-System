import api from './axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface UsersResponse {
  success: boolean;
  data: {
    items: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const usersApi = {
  getAll: (params?: { page?: number; limit?: number }): Promise<UsersResponse> =>
    api.get('/users', { params }),
};
