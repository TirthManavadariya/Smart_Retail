import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Plus,
  Trash2,
  User,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/cn';
import type { Task, StaffMember } from '@/lib/types';

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-blue-500/15 text-blue-400',
  medium: 'bg-yellow-500/15 text-yellow-400',
  high: 'bg-orange-500/15 text-orange-400',
  urgent: 'bg-red-500/15 text-red-400',
};

const STATUS_ICONS: Record<string, typeof Circle> = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
};

export default function Tasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isManager = user?.role === 'manager';

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.tasks.list(),
  });

  const { data: statsData } = useQuery({
    queryKey: ['task-stats'],
    queryFn: () => api.tasks.stats(),
  });

  const { data: staffData } = useQuery({
    queryKey: ['staff-list'],
    queryFn: () => api.staff.list(),
    enabled: isManager,
  });

  const tasks = tasksData?.tasks ?? [];
  const staff = staffData?.staff ?? [];

  const createMutation = useMutation({
    mutationFn: api.tasks.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: { status: string } }) =>
      api.tasks.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.tasks.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
    },
  });

  const markDone = (taskId: number) => {
    updateMutation.mutate({ taskId, data: { status: 'completed' } });
  };

  const startTask = (taskId: number) => {
    updateMutation.mutate({ taskId, data: { status: 'in_progress' } });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-content">
            {isManager ? 'Task Management' : 'My Tasks'}
          </h1>
          <p className="mt-1 text-sm text-content-muted">
            {isManager
              ? 'Assign and track tasks for your team'
              : 'View and complete your assigned tasks'}
          </p>
        </div>
        {isManager && <NewTaskModal staff={staff} onCreate={createMutation.mutate} />}
      </div>

      {/* Stats */}
      {statsData && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={statsData.total} icon={Circle} />
          <StatCard label="Pending" value={statsData.pending} icon={Clock} />
          <StatCard label="In Progress" value={statsData.in_progress} icon={Loader2} />
          <StatCard label="Completed" value={statsData.completed} icon={CheckCircle2} />
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <CheckCircle2 className="mx-auto mb-3 size-12 text-content-faint" />
            <p className="text-sm font-semibold text-content">No tasks yet</p>
            <p className="mt-1 text-xs text-content-faint">
              {isManager ? 'Assign a task to get started' : 'You have no assigned tasks'}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.task_id}
              task={task}
              isManager={isManager}
              onMarkDone={() => markDone(task.task_id)}
              onStart={() => startTask(task.task_id)}
              onDelete={() => deleteMutation.mutate(task.task_id)}
              isUpdating={updateMutation.isPending || deleteMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Circle }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-content">{value}</p>
          <p className="text-xs text-content-faint">{label}</p>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  isManager,
  onMarkDone,
  onStart,
  onDelete,
  isUpdating,
}: {
  task: Task;
  isManager: boolean;
  onMarkDone: () => void;
  onStart: () => void;
  onDelete: () => void;
  isUpdating: boolean;
}) {
  const StatusIcon = STATUS_ICONS[task.status] ?? Circle;
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={cn(
        'glass rounded-xl p-4 transition-all',
        isCompleted && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <button
          onClick={isCompleted ? undefined : onMarkDone}
          disabled={isCompleted || isUpdating}
          className={cn(
            'mt-0.5 shrink-0 transition-colors',
            isCompleted ? 'text-green-500' : 'text-content-faint hover:text-primary',
          )}
          title={isCompleted ? 'Completed' : 'Mark as done'}
        >
          <StatusIcon className="size-5" />
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'text-sm font-semibold text-content',
                isCompleted && 'line-through',
              )}
            >
              {task.title}
            </h3>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase',
                PRIORITY_COLORS[task.priority],
              )}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-content-muted">{task.description}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-content-faint">
            {isManager && (
              <span className="flex items-center gap-1">
                <User className="size-3" />
                {task.assignee_name}
              </span>
            )}
            {task.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {task.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {new Date(task.created_at).toLocaleDateString()}
            </span>
            {isCompleted && task.completed_at && (
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle2 className="size-3" />
                {new Date(task.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {!isCompleted && task.status === 'pending' && !isManager && (
            <button
              onClick={onStart}
              disabled={isUpdating}
              className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              Start
            </button>
          )}
          {isManager && (
            <button
              onClick={onDelete}
              disabled={isUpdating}
              className="rounded-lg p-1.5 text-content-faint transition-colors hover:bg-danger/10 hover:text-danger"
              title="Delete task"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NewTaskModal({
  staff,
  onCreate,
}: {
  staff: StaffMember[];
  onCreate: (data: {
    title: string;
    description?: string;
    assigned_to: number;
    priority?: string;
    location?: string;
    due_date?: string;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<number | ''>('');
  const [priority, setPriority] = useState('medium');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignedTo) return;
    onCreate({
      title,
      description,
      assigned_to: assignedTo as number,
      priority,
      location,
    });
    setTitle('');
    setDescription('');
    setAssignedTo('');
    setPriority('medium');
    setLocation('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-on transition-colors hover:bg-primary-hover"
      >
        <Plus className="size-4" />
        New Task
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-lg rounded-2xl p-6">
        <h2 className="mb-4 text-lg font-bold text-content">Assign New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-content-faint">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-content focus:border-primary focus:outline-none"
              placeholder="Task title"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-content-faint">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-content focus:border-primary focus:outline-none"
              placeholder="Task details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-content-faint">Assign To *</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(Number(e.target.value))}
                required
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-content focus:border-primary focus:outline-none"
              >
                <option value="">Select staff...</option>
                {staff.map((s) => (
                  <option key={s.user_id} value={s.user_id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-content-faint">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-content focus:border-primary focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-content-faint">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-content focus:border-primary focus:outline-none"
              placeholder="e.g., Aisle 3, Dairy Section"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-content-muted transition-colors hover:bg-surface-high"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-on transition-colors hover:bg-primary-hover"
            >
              <Plus className="size-4" />
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
