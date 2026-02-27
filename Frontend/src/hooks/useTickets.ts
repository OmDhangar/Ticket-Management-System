import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi, TicketFilters, CreateTicketPayload } from '@/api/tickets.api';
import { QUERY_KEYS } from '@/constants/queryKeys';
import toast from 'react-hot-toast';

export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.TICKETS.LIST(filters || {}),
    queryFn: () => ticketsApi.getAll(filters),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TICKETS.DETAIL(id),
    queryFn: () => ticketsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => ticketsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.TICKETS.ALL });
      toast.success('Ticket created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateTicketPayload>) =>
      ticketsApi.update(id, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.TICKETS.DETAIL(vars.id) });
      toast.success('Ticket updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useChangeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ticketsApi.changeStatus(id, status),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.TICKETS.DETAIL(vars.id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.TICKETS.ALL });
      toast.success('Status updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAssignTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string | null }) =>
      ticketsApi.assign(id, assigneeId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.TICKETS.DETAIL(vars.id) });
      toast.success('Ticket assigned');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.TICKETS.ALL });
      toast.success('Ticket deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
