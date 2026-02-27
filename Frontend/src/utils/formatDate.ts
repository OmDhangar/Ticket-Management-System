import { format, formatDistanceToNow, isPast, isValid } from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (!isValid(d)) return '—';
  return format(d, 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  if (!isValid(d)) return '—';
  return format(d, 'MMM dd, yyyy · h:mm a');
}

export function formatRelative(date: string | Date): string {
  const d = new Date(date);
  if (!isValid(d)) return '—';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isOverdue(dueDate: string | Date | null | undefined, status?: string): boolean {
  if (!dueDate) return false;
  if (status === 'RESOLVED' || status === 'CLOSED') return false;
  const d = new Date(dueDate);
  return isValid(d) && isPast(d);
}
