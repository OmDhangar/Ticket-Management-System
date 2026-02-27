import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useChangeStatus } from '@/hooks/useTickets';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const statuses = [
  { value: 'OPEN', label: 'Open', color: 'border-blue-500 bg-blue-500/10 text-blue-400' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'border-amber-500 bg-amber-500/10 text-amber-400' },
  { value: 'RESOLVED', label: 'Resolved', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
  { value: 'CLOSED', label: 'Closed', color: 'border-gray-500 bg-gray-500/10 text-gray-400' },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ticketId: string;
  currentStatus: string;
}

export default function ChangeStatusModal({ open, onOpenChange, ticketId, currentStatus }: Props) {
  const [selected, setSelected] = useState(currentStatus);
  const changeStatus = useChangeStatus();

  const handleSave = () => {
    if (selected !== currentStatus) {
      changeStatus.mutate({ id: ticketId, status: selected }, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Ticket Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelected(s.value)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium',
                selected === s.value ? s.color : 'border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary',
              )}
            >
              <div className={cn('h-3 w-3 rounded-full border-2', selected === s.value ? s.color : 'border-muted-foreground')} />
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={changeStatus.isPending || selected === currentStatus}>
            {changeStatus.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
