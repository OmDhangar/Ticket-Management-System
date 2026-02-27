export const QUERY_KEYS = {
  TICKETS: {
    ALL: ['tickets'] as const,
    LIST: (filters: object) => ['tickets', 'list', filters] as const,
    DETAIL: (id: string) => ['tickets', id] as const,
  },
  COMMENTS: {
    LIST: (ticketId: string) => ['comments', ticketId] as const,
  },
  USERS: {
    ALL: ['users'] as const,
    LIST: (params: object) => ['users', 'list', params] as const,
  },
  DASHBOARD: ['dashboard'] as const,
};
