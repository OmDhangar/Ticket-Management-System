import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, LayoutGrid, List, X, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge';
import PriorityBadge from '@/components/tickets/PriorityBadge';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import { useTickets } from '@/hooks/useTickets';
import { useAuthStore } from '@/store/auth.store';
import { formatDate, isOverdue } from '@/utils/formatDate';
import { cn } from '@/lib/utils';
import { Ticket } from '@/api/tickets.api';

export default function TicketsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');

  // "view" param: 'all' = All Tickets (admin only), anything else = My Tickets
  const viewParam = searchParams.get('view');
  const isAllTicketsView = isAdmin && viewParam === 'all';

  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  const filters = useMemo(() => {
    const f: Record<string, any> = { page, limit };
    if (status !== 'ALL') f.status = status;
    if (priority !== 'ALL') f.priority = priority;
    if (search) f.search = search;
    // For admins on "My Tickets" view, send myTickets=true so backend filters by their creatorId
    if (isAdmin && !isAllTicketsView) f.myTickets = true;
    return f;
  }, [status, priority, search, page, limit, isAdmin, isAllTicketsView]);

  const { data, isLoading, error, refetch } = useTickets(filters);
  const tickets = data?.data?.items || [];
  const pagination = data?.data?.pagination;
  const hasFilters = status !== 'ALL' || priority !== 'ALL' || search;

  const clearFilters = () => { setStatus('ALL'); setPriority('ALL'); setSearch(''); setPage(1); };

  const switchToMyTickets = () => {
    setSearchParams({});
    setPage(1);
  };

  const switchToAllTickets = () => {
    setSearchParams({ view: 'all' });
    setPage(1);
  };

  if (error) return <ErrorState message="Failed to load tickets" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">
            {isAdmin ? (isAllTicketsView ? 'All Tickets' : 'My Tickets') : 'My Tickets'}
          </h2>
          {pagination && <Badge variant="secondary" className="text-xs">{pagination.total}</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex border border-border rounded-lg overflow-hidden">
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" className="rounded-none" onClick={() => setViewMode('table')}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" className="rounded-none" onClick={() => setViewMode('card')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => navigate('/tickets/new')}>
            <Plus className="mr-2 h-4 w-4" /> New Ticket
          </Button>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      {isAdmin && (
        <div className="flex items-center gap-1 p-1 bg-secondary/50 border border-border rounded-lg w-fit">
          <button
            onClick={switchToMyTickets}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              !isAllTicketsView
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            My Tickets
          </button>
          <button
            onClick={switchToAllTickets}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              isAllTicketsView
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            All Tickets
          </button>
        </div>
      )}

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-10"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(v) => { setPriority(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priority</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : tickets.length === 0 ? (
        <EmptyState
          title={isAdmin && !isAllTicketsView ? 'No tickets created by you' : 'No tickets found'}
          description="Try changing your filters or create a new ticket."
          actionLabel="Create Ticket"
          onAction={() => navigate('/tickets/new')}
        />
      ) : viewMode === 'table' ? (
        <Card className="border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                {isAllTicketsView && <TableHead className="hidden md:table-cell">Created By</TableHead>}
                <TableHead className="hidden md:table-cell">Assignee</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => navigate(`/tickets/${t.id}`)}>
                  <TableCell className="font-medium max-w-[250px] truncate">{t.title}</TableCell>
                  <TableCell><TicketStatusBadge status={t.status} /></TableCell>
                  <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                  {isAllTicketsView && (
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {t.creator?.name || <span className="italic text-muted-foreground/50">Unknown</span>}
                    </TableCell>
                  )}
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {t.assignee?.name || <span className="italic text-muted-foreground/50">Unassigned</span>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{formatDate(t.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tickets.map((t) => (
            <TicketCard key={t.id} ticket={t} onClick={() => navigate(`/tickets/${t.id}`)} showCreator={isAllTicketsView} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).slice(
              Math.max(0, page - 3), Math.min(pagination.totalPages, page + 2)
            ).map((p) => (
              <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}>{p}</Button>
            ))}
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket: t, onClick, showCreator }: { ticket: Ticket; onClick: () => void; showCreator?: boolean }) {
  const overdue = isOverdue(t.dueDate, t.status);
  return (
    <Card className="border-border bg-card hover:bg-secondary/30 transition-colors cursor-pointer" onClick={onClick}>
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground line-clamp-2 text-sm">{t.title}</h3>
        </div>
        {showCreator && t.creator && (
          <p className="text-xs text-muted-foreground">By: {t.creator.name}</p>
        )}
        {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <TicketStatusBadge status={t.status} />
          <PriorityBadge priority={t.priority} />
          {overdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
          <span>{t.assignee?.name || 'Unassigned'}</span>
          <div className="flex items-center gap-3">
            {t.dueDate && (
              <span className={cn('flex items-center gap-1', overdue && 'text-destructive')}>
                <Calendar className="h-3 w-3" /> {formatDate(t.dueDate)}
              </span>
            )}
            {t.commentsCount != null && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> {t.commentsCount}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
