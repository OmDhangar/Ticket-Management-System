import { cn } from '@/lib/utils';

const statusConfig = {
  OPEN: { label: 'Open', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  RESOLVED: { label: 'Resolved', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  CLOSED: { label: 'Closed', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
};

interface TicketStatusBadgeProps {
  status: keyof typeof statusConfig;
  className?: string;
}

export default function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.OPEN;
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all',
      config.className,
      className,
    )}>
      {config.label}
    </span>
  );
}
