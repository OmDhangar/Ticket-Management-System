import { cn } from '@/lib/utils';

const priorityConfig: Record<string, { label: string; dotClass: string; className: string; pulse?: boolean }> = {
  LOW: { label: 'Low', dotClass: 'bg-emerald-400', className: 'bg-emerald-500/10 text-emerald-400' },
  MEDIUM: { label: 'Medium', dotClass: 'bg-blue-400', className: 'bg-blue-500/10 text-blue-400' },
  HIGH: { label: 'High', dotClass: 'bg-amber-400', className: 'bg-amber-500/10 text-amber-400' },
  URGENT: { label: 'Urgent', dotClass: 'bg-red-400', className: 'bg-red-500/10 text-red-400', pulse: true },
};

interface PriorityBadgeProps {
  priority: keyof typeof priorityConfig;
  className?: string;
}

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
      config.className,
      className,
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass, config.pulse && 'animate-pulse-dot')} />
      {config.label}
    </span>
  );
}
