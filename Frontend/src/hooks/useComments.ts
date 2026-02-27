import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi, Comment } from '@/api/comments.api';
import { QUERY_KEYS } from '@/constants/queryKeys';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

export function useComments(ticketId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.COMMENTS.LIST(ticketId),
    queryFn: () => commentsApi.getByTicket(ticketId),
    enabled: !!ticketId,
  });
}

export function useAddComment(ticketId: string) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (content: string) => commentsApi.create(ticketId, content),
    onMutate: async (content) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.COMMENTS.LIST(ticketId) });
      const prev = qc.getQueryData(QUERY_KEYS.COMMENTS.LIST(ticketId));
      const optimistic: Comment = {
        id: `temp-${Date.now()}`,
        content,
        user: user ? { id: user.id, name: user.name, email: user.email } : { id: '', name: '', email: '' },
        createdAt: new Date().toISOString(),
      };
      qc.setQueryData(QUERY_KEYS.COMMENTS.LIST(ticketId), (old: any) => ({
        ...old,
        data: [...(old?.data || []), optimistic],
      }));
      return { prev };
    },
    onError: (err: Error, _, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.COMMENTS.LIST(ticketId), ctx.prev);
      toast.error(err.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.COMMENTS.LIST(ticketId) });
    },
  });
}
