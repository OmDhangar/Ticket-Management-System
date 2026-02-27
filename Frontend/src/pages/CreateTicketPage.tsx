import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import Spinner from '@/components/shared/Spinner';
import { useCreateTicket } from '@/hooks/useTickets';
import { useUsers } from '@/hooks/useUsers';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.string().default('MEDIUM'),
  dueDate: z.date().optional(),
  assigneeId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const createTicket = useCreateTicket();
  const { data: usersData } = useUsers({ limit: 100 });
  const users = usersData?.data?.items || [];

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM' },
    mode: 'onBlur',
  });

  const title = watch('title', '');

  const onSubmit = async (data: FormData) => {
    const payload: any = { title: data.title, description: data.description, priority: data.priority };
    if (data.dueDate) payload.dueDate = data.dueDate.toISOString();
    if (data.assigneeId && data.assigneeId !== 'none') payload.assigneeId = data.assigneeId;
    createTicket.mutate(payload, {
      onSuccess: (res) => navigate(`/tickets/${res.data.id}`),
    });
  };

  return (
    <div className="max-w-[680px] mx-auto">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Create New Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Title *</Label>
                <span className="text-xs text-muted-foreground">{title?.length || 0} / 255</span>
              </div>
              <Input placeholder="Short, descriptive summary of the issue" maxLength={255} {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Provide full details: steps to reproduce, expected vs actual behavior..."
                className="min-h-[150px]"
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Low</span></SelectItem>
                        <SelectItem value="MEDIUM"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-400" /> Medium</span></SelectItem>
                        <SelectItem value="HIGH"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" /> High</span></SelectItem>
                        <SelectItem value="URGENT"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-400" /> Urgent</span></SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Controller
                  control={control}
                  name="dueDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Controller
                  control={control}
                  name="assigneeId"
                  render={({ field }) => (
                    <Select value={field.value || 'none'} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="No assignee" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No assignee</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || createTicket.isPending}>
                {createTicket.isPending ? <Spinner size={18} className="text-primary-foreground" /> : 'Create Ticket'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
