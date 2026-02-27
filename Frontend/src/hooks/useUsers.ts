import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useUsers(params?: { page?: number; limit?: number; enabled?: boolean }) {
  const { enabled = true, ...queryParams } = params || {};
  return useQuery({
    queryKey: QUERY_KEYS.USERS.LIST(queryParams),
    queryFn: () => usersApi.getAll(queryParams),
    enabled,
  });
}
