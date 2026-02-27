import { useNavigate } from 'react-router-dom';
import { Ticket, AlertCircle, Clock, CheckCircle, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge';
import PriorityBadge from '@/components/tickets/PriorityBadge';
import ErrorState from '@/components/shared/ErrorState';
import { useTickets } from '@/hooks/useTickets';
import { formatRelative } from '@/utils/formatDate';

const statsConfig = [
  { key: 'total', label: 'Total Tickets', icon: Ticket, color: 'text-primary' },
  { key: 'open', label: 'Open', icon: AlertCircle, color: 'text-blue-400' },
  { key: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-amber-400' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-emerald-400' },
];

const priorityColors: Record<string, string> = {
  LOW: 'bg-emerald-500',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-amber-500',
  URGENT: 'bg-red-500',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: allData, isLoading, error, refetch } = useTickets({ limit: 5 });
  const { data: openData } = useTickets({ limit: 1, status: 'OPEN' } as any);
  const { data: inProgressData } = useTickets({ limit: 1, status: 'IN_PROGRESS' } as any);
  const { data: resolvedData } = useTickets({ limit: 1, status: 'RESOLVED' } as any);
  const { data: closedData } = useTickets({ limit: 1, status: 'CLOSED' } as any);

  if (error) return <ErrorState message="Failed to load dashboard" onRetry={refetch} />;

  const tickets = allData?.data?.items || [];
  const stats = {
    total: allData?.data?.pagination?.total ?? 0,
    open: openData?.data?.pagination?.total ?? 0,
    in_progress: inProgressData?.data?.pagination?.total ?? 0,
    resolved: (resolvedData?.data?.pagination?.total ?? 0) + (closedData?.data?.pagination?.total ?? 0),
  };

  const priorityCounts = {
    LOW: tickets.filter((t) => t.priority === 'LOW').length,
    MEDIUM: tickets.filter((t) => t.priority === 'MEDIUM').length,
    HIGH: tickets.filter((t) => t.priority === 'HIGH').length,
    URGENT: tickets.filter((t) => t.priority === 'URGENT').length,
  };
  const maxCount = Math.max(...Object.values(priorityCounts), 1);
  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((s) => (
          <Card key={s.key} className="border-border bg-card">
            <CardContent className="pt-6">
              {isLoading ? (
                <Skeleton className="h-12 w-20" />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stats[s.key as keyof typeof stats]}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent tickets */}
        <Card className="lg:col-span-3 border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Tickets</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : recentTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No tickets yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.map((t) => (
                    <TableRow key={t.id} className="cursor-pointer" onClick={() => navigate(`/tickets/${t.id}`)}>
                      <TableCell className="font-medium max-w-[200px] truncate">{t.title}</TableCell>
                      <TableCell><TicketStatusBadge status={t.status} /></TableCell>
                      <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">{formatRelative(t.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Priority breakdown */}
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : (
              Object.entries(priorityCounts).map(([key, count]) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key.toLowerCase()}</span>
                    <span className="font-medium text-foreground">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${priorityColors[key]}`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate('/tickets/new')}>
          <Plus className="mr-2 h-4 w-4" /> Create New Ticket
        </Button>
        <Button variant="outline" onClick={() => navigate('/tickets')}>
          View All Tickets
        </Button>
      </div>
    </div>
  );
}
