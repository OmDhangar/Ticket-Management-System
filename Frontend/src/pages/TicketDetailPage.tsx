import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Send, Trash2, UserPlus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge';
import PriorityBadge from '@/components/tickets/PriorityBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import ErrorState from '@/components/shared/ErrorState';
import Spinner from '@/components/shared/Spinner';
import ChangeStatusModal from '@/components/tickets/ChangeStatusModal';
import AssignTicketModal from '@/components/tickets/AssignTicketModal';
import { useTicket, useUpdateTicket, useDeleteTicket } from '@/hooks/useTickets';
import { useComments, useAddComment } from '@/hooks/useComments';
import { useAuthStore } from '@/store/auth.store';
import { formatDate, formatDateTime, formatRelative, isOverdue } from '@/utils/formatDate';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading, error, refetch } = useTicket(id!);
  const { data: commentsData, isLoading: commentsLoading } = useComments(id!);
  const addComment = useAddComment(id!);
  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();

  const [comment, setComment] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  if (error) return <ErrorState message="Failed to load ticket" onRetry={refetch} />;
  if (isLoading) return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;

  const ticket = data?.data;
  if (!ticket) return <ErrorState message="Ticket not found" />;

  const comments = commentsData?.data || [];
  const canEdit = isAdmin || user?.id === ticket.createdBy?.id;
  const canChangeStatus = isAdmin || user?.id === ticket.createdBy?.id || user?.id === ticket.assignee?.id;
  const overdue = isOverdue(ticket.dueDate, ticket.status);

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addComment.mutate(comment);
    setComment('');
  };

  const handleSaveTitle = () => {
    if (titleValue.trim() && titleValue !== ticket.title) {
      updateTicket.mutate({ id: ticket.id, title: titleValue });
    }
    setEditingTitle(false);
  };

  const handleSaveDesc = () => {
    if (descValue !== ticket.description) {
      updateTicket.mutate({ id: ticket.id, description: descValue });
    }
    setEditingDesc(false);
  };

  const handleDelete = () => {
    deleteTicket.mutate(ticket.id, { onSuccess: () => navigate('/tickets') });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/tickets" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Tickets
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground truncate max-w-[200px]">{ticket.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Title */}
          <div>
            {editingTitle ? (
              <div className="flex gap-2">
                <Input value={titleValue} onChange={(e) => setTitleValue(e.target.value)} className="text-xl font-bold" autoFocus />
                <Button size="sm" onClick={handleSaveTitle}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingTitle(false)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <h1 className="text-2xl font-bold text-foreground">{ticket.title}</h1>
                {canEdit && (
                  <Button variant="ghost" size="icon" className="shrink-0 mt-1" onClick={() => { setTitleValue(ticket.title); setEditingTitle(true); }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <TicketStatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              {overdue && <Badge variant="destructive">Overdue</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Created by <span className="text-foreground font-medium">{ticket.createdBy?.name}</span> · {formatRelative(ticket.createdAt)}
            </p>
          </div>

          {/* Description */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Description</CardTitle>
              {canEdit && !editingDesc && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setDescValue(ticket.description); setEditingDesc(true); }}>
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingDesc ? (
                <div className="space-y-2">
                  <Textarea value={descValue} onChange={(e) => setDescValue(e.target.value)} rows={5} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveDesc}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingDesc(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.description || 'No description provided.'}</p>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Comments ({comments.length})</h3>
            {commentsLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-lg bg-secondary/50 p-4 border-l-2 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        {(c.user?.name ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">{c.user?.name ?? 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">{formatRelative(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground pl-9">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <Button onClick={handleAddComment} disabled={!comment.trim() || addComment.isPending} size="sm">
              {addComment.isPending ? <Spinner size={16} /> : <Send className="h-4 w-4 mr-1" />}
              Send
            </Button>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border bg-card">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  <TicketStatusBadge status={ticket.status} />
                  {canChangeStatus && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowStatus(true)}>
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <PriorityBadge priority={ticket.priority} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assignee</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{ticket.assignee?.name || 'Unassigned'}</span>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowAssign(true)}>
                      <UserPlus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reporter</span>
                <span className="text-sm text-foreground">{ticket.createdBy?.name}</span>
              </div>
              {ticket.dueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Due Date</span>
                  <span className={cn('text-sm', overdue ? 'text-destructive font-medium' : 'text-foreground')}>
                    {formatDate(ticket.dueDate)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-xs text-foreground">{formatDateTime(ticket.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Updated</span>
                <span className="text-xs text-foreground">{formatRelative(ticket.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="border-destructive/20 bg-card">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-3">Danger Zone</p>
                <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => setShowDelete(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Ticket
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <ChangeStatusModal open={showStatus} onOpenChange={setShowStatus} ticketId={ticket.id} currentStatus={ticket.status} />
      <AssignTicketModal open={showAssign} onOpenChange={setShowAssign} ticketId={ticket.id} currentAssignee={ticket.assignee} />
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Ticket"
        description="This will permanently remove the ticket. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteTicket.isPending}
      />
    </div>
  );
}
