import { useState, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Clock,
  ListChecks,
  MapPin,
  Plus,
  Radio,
  UserPlus,
  Users,
  Wrench,
} from 'lucide-react';
import { AlertItem } from '@/components/domain/AlertItem';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card';
import { Select, TextField } from '@/components/ui/Controls';
import { DataTable, StackedCell, type Column } from '@/components/ui/DataTable';
import { KpiCard, KpiGrid } from '@/components/ui/KpiCard';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressBar } from '@/components/ui/Progress';
import { AsyncBoundary, EmptyState, KpiSkeleton, Skeleton } from '@/components/ui/States';
import { keys, useAlertInbox, useAssociates, useTaskBoard } from '@/hooks/queries';
import { useActiveStore } from '@/hooks/useActiveStore';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';
import type { AssociatesPayload } from '@/lib/types';

export default function AlertsPage() {
  const { storeId } = useActiveStore();
  const { push } = useToast();
  const queryClient = useQueryClient();

  const inbox = useAlertInbox(storeId);
  const board = useTaskBoard();
  const associates = useAssociates();

  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState({ title: '', location: '', urgency: 'Medium', assignee: '' });
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [localProgress, setLocalProgress] = useState<Record<string, 'claimed' | 'done'>>({});

  const assign = useMutation({
    mutationFn: (alertId: number) => api.alerts.assign(alertId),
    onSuccess: (result) => {
      push({ kind: 'success', title: 'Alert assigned', message: `Dispatched to ${result.assignee}.` });
      void queryClient.invalidateQueries({ queryKey: keys.alertInbox(storeId) });
    },
    onError: (error: Error) => push({ kind: 'error', title: 'Assignment failed', message: error.message }),
  });

  const createTask = useMutation({
    mutationFn: () =>
      api.alerts.createTask({
        title: draft.title,
        location: draft.location,
        urgency: draft.urgency,
        assignee: draft.assignee,
      }),
    onSuccess: () => {
      push({ kind: 'success', title: 'Task created', message: `"${draft.title}" added to the board.` });
      setComposerOpen(false);
      setDraft({ title: '', location: '', urgency: 'Medium', assignee: '' });
      void queryClient.invalidateQueries({ queryKey: keys.tasks() });
      void queryClient.invalidateQueries({ queryKey: keys.alertInbox(storeId) });
    },
    onError: (error: Error) => push({ kind: 'error', title: 'Could not create task', message: error.message }),
  });

  const visibleAlerts = (inbox.data?.alerts ?? []).filter((alert) => !dismissed.has(alert.id));

  const associateColumns: Column<AssociatesPayload['associates'][number]>[] = [
    {
      key: 'name',
      header: 'Associate',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-2xs font-bold text-primary-on">
            {initials(row.name)}
          </span>
          <StackedCell primary={row.name} secondary="Floor team" />
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Shift status',
      align: 'center',
      cell: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'warn'} dot>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'tasks',
      header: 'Tasks resolved',
      align: 'center',
      cell: (row) => <span className="tnum text-sm font-bold text-content">{row.tasks_done}</span>,
    },
    {
      key: 'resp',
      header: 'Avg response',
      align: 'right',
      cell: (row) => <span className="tnum font-mono text-xs text-content-muted">{row.avg_resp}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Incident response"
        title="Alerts & Tasks"
        description="Everything the vision pipeline flagged, and the floor work it generated."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="size-4" />}
            onClick={() => setComposerOpen(true)}
          >
            New floor task
          </Button>
        }
      />

      {/* ── Response KPIs ───────────────────────────────────────────── */}
      <AsyncBoundary
        query={associates}
        skeleton={
          <KpiGrid>
            {Array.from({ length: 3 }, (_, index) => (
              <KpiSkeleton key={index} />
            ))}
          </KpiGrid>
        }
      >
        {(data) => (
          <KpiGrid>
            <KpiCard
              label="Average response time"
              value={data.avg_response_time.toFixed(1)}
              unit="min"
              icon={<Clock className="size-5" />}
              variant={data.avg_response_time <= 5 ? 'success' : 'warn'}
              hint="From alert raised to associate acknowledgement"
            />
            <KpiCard
              label="Resolved this shift"
              value={data.tasks_resolved}
              unit="tasks"
              icon={<ListChecks className="size-5" />}
              variant="primary"
              hint="Completed and CV-verified"
            />
            <KpiCard
              label="Associates on floor"
              value={data.associates.filter((a) => a.status === 'Active').length}
              unit={`of ${data.associates.length}`}
              icon={<Users className="size-5" />}
              variant="violet"
              hint="Currently clocked in and available"
            />
          </KpiGrid>
        )}
      </AsyncBoundary>

      <div className="grid gap-6 xl:grid-cols-5">
        {/* ── Alert stream ──────────────────────────────────────────── */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Live incident stream"
            subtitle="Highest impact first"
            icon={<Radio className="size-4" />}
            action={<Badge variant="danger">{visibleAlerts.length} open</Badge>}
          />
          <CardBody className="space-y-3 p-4">
            <AsyncBoundary
              query={inbox}
              skeleton={
                <div className="space-y-3">
                  {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-40 rounded-xl" />
                  ))}
                </div>
              }
              isEmpty={() => visibleAlerts.length === 0}
              empty={
                <EmptyState
                  icon={<CheckCircle2 className="size-5" />}
                  title="Inbox clear"
                  description="No open incidents for this store."
                />
              }
            >
              {() =>
                visibleAlerts.map((alert) => (
                  <AlertItem
                    key={alert.id}
                    severity={alert.severity}
                    title={alert.title}
                    detail={alert.detail}
                    timeAgo={alert.time_ago}
                    impact={alert.impact}
                    metricLabel="Impact"
                    footer={
                      <div className="space-y-2.5">
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
                          <p className="mb-0.5 flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-primary">
                            <Wrench className="size-3" />
                            Corrective action
                          </p>
                          <p className="text-xs leading-snug text-content-muted">{alert.corrective}</p>
                        </div>

                        {alert.assigned_to ? (
                          <div className="flex items-center gap-2 text-2xs text-content-muted">
                            <span className="grid size-5 place-items-center rounded-full bg-primary/15 text-[0.55rem] font-bold text-primary">
                              {initials(alert.assigned_to)}
                            </span>
                            Assigned to {alert.assigned_to}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              icon={<UserPlus className="size-3.5" />}
                              loading={assign.isPending && assign.variables === alert.id}
                              onClick={() => assign.mutate(alert.id)}
                            >
                              Assign
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() =>
                                setDismissed((current) => new Set(current).add(alert.id))
                              }
                            >
                              Dismiss
                            </Button>
                          </div>
                        )}
                      </div>
                    }
                  />
                ))
              }
            </AsyncBoundary>
          </CardBody>
        </Card>

        {/* ── Task board ────────────────────────────────────────────── */}
        <Card className="xl:col-span-3">
          <CardHeader
            title="Floor task board"
            subtitle="Work generated from alerts and manual dispatch"
            icon={<ClipboardList className="size-4" />}
          />
          <CardBody>
            <AsyncBoundary
              query={board}
              skeleton={
                <div className="grid gap-4 md:grid-cols-3">
                  {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-48 rounded-xl" />
                  ))}
                </div>
              }
            >
              {(data) => (
                <div className="grid gap-4 md:grid-cols-3">
                  <BoardColumn
                    title="To do"
                    tone="danger"
                    count={data.todo.length + data.manual_tasks.length}
                  >
                    {data.todo.map((task) => (
                      <TaskCard
                        key={task.title}
                        title={task.title}
                        location={task.location}
                        meta={`Due ${task.due}`}
                        urgent={task.due.toLowerCase() === 'urgent'}
                        action={
                          localProgress[task.title] ? (
                            <Badge variant="primary" dot>Claimed</Badge>
                          ) : (
                            <Button
                              onClick={() => {
                                setLocalProgress((current) => ({ ...current, [task.title]: 'claimed' }));
                                push({ kind: 'info', title: 'Task claimed', message: task.title });
                              }}
                            >
                              Claim
                            </Button>
                          )
                        }
                      />
                    ))}
                    {data.manual_tasks.map((task, index) => (
                      <TaskCard
                        key={`${task.title}-${index}`}
                        title={task.title}
                        location={task.location || 'Unspecified'}
                        meta={`Created ${task.created} · ${task.urgency}`}
                        urgent={task.urgency === 'High'}
                        action={<Badge variant="violet">Manual</Badge>}
                      />
                    ))}
                  </BoardColumn>

                  <BoardColumn title="In progress" tone="warn" count={data.in_progress.length}>
                    {data.in_progress.map((task) => (
                      <TaskCard
                        key={task.title}
                        title={task.title}
                        meta={`${task.assignee} · started ${task.started}`}
                        progress={task.progress}
                        action={
                          localProgress[task.title] === 'done' ? (
                            <Badge variant="success" dot>Done</Badge>
                          ) : (
                            <Button
                              onClick={() => {
                                setLocalProgress((current) => ({ ...current, [task.title]: 'done' }));
                                push({ kind: 'success', title: 'Marked complete', message: task.title });
                              }}
                            >
                              Mark done
                            </Button>
                          )
                        }
                      />
                    ))}
                  </BoardColumn>

                  <BoardColumn title="Verified" tone="success" count={data.completed.length}>
                    {data.completed.map((task) => (
                      <TaskCard
                        key={task.title}
                        title={task.title}
                        meta={task.assignee}
                        action={
                          task.verified ? (
                            <Badge variant="success" dot>CV verified</Badge>
                          ) : (
                            <Badge variant="neutral">Pending</Badge>
                          )
                        }
                      />
                    ))}
                  </BoardColumn>
                </div>
              )}
            </AsyncBoundary>
          </CardBody>
          <CardFooter>
            <p className="text-2xs text-content-faint">
              Claim and completion states are local to this session — the backend exposes a read-only
              board plus manual task creation.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* ── Associate performance ───────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Associate performance"
          subtitle="Shift telemetry by team member"
          icon={<Users className="size-4" />}
        />
        <AsyncBoundary
          query={associates}
          skeleton={
            <div className="space-y-2 p-5">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-12" />
              ))}
            </div>
          }
        >
          {(data) => (
            <DataTable
              columns={associateColumns}
              rows={data.associates}
              rowKey={(row) => row.name}
            />
          )}
        </AsyncBoundary>
      </Card>

      {/* ── Task composer ───────────────────────────────────────────── */}
      <Modal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        title="Create floor task"
        subtitle="Dispatch work that didn't come from an alert"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setComposerOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={createTask.isPending}
              disabled={draft.title.trim().length === 0}
              onClick={() => createTask.mutate()}
            >
              Create task
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField
            label="Task title"
            value={draft.title}
            placeholder="e.g. Restock energy drinks in bay 3"
            onChange={(title) => setDraft((current) => ({ ...current, title }))}
          />
          <TextField
            label="Location"
            value={draft.location}
            placeholder="e.g. Aisle 01 · Bay 3"
            onChange={(location) => setDraft((current) => ({ ...current, location }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-2xs font-bold uppercase tracking-wider text-content-muted">
                Urgency
              </p>
              <Select
                label="Urgency"
                value={draft.urgency}
                onChange={(urgency) => setDraft((current) => ({ ...current, urgency }))}
                options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' },
                ]}
                className="w-full"
              />
            </div>
            <div>
              <p className="mb-1.5 text-2xs font-bold uppercase tracking-wider text-content-muted">
                Assign to
              </p>
              <Select
                label="Assignee"
                value={draft.assignee}
                onChange={(assignee) => setDraft((current) => ({ ...current, assignee }))}
                options={[
                  { value: '', label: 'Unassigned' },
                  ...(associates.data?.associates ?? []).map((a) => ({
                    value: a.name,
                    label: `${a.name} (${a.status})`,
                  })),
                ]}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

function BoardColumn({
  title,
  tone: toneName,
  count,
  children,
}: {
  title: string;
  tone: 'danger' | 'warn' | 'success';
  count: number;
  children: ReactNode;
}) {
  const dotClass = { danger: 'bg-danger', warn: 'bg-warn', success: 'bg-success' }[toneName];

  return (
    <div className="rounded-xl border border-line bg-surface-low/50 p-3">
      <div className="mb-3 flex items-center gap-2">
        <span className={cn('size-2 rounded-full', dotClass)} />
        <h3 className="text-2xs font-bold uppercase tracking-wider text-content">{title}</h3>
        <span className="tnum ml-auto rounded-full bg-surface-high px-1.5 text-2xs font-bold text-content-muted">
          {count}
        </span>
      </div>
      <div className="max-h-[30rem] space-y-2.5 overflow-y-auto pr-0.5">
        {count === 0 ? (
          <p className="py-6 text-center text-2xs text-content-faint">Nothing here</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function TaskCard({
  title,
  location,
  meta,
  progress,
  urgent = false,
  action,
}: {
  title: string;
  location?: string;
  meta?: string;
  progress?: number;
  urgent?: boolean;
  action?: ReactNode;
}) {
  return (
    <article
      className={cn(
        'rounded-lg border bg-surface-mid/60 p-3 transition-colors hover:bg-surface-high/60',
        urgent ? 'border-danger/35' : 'border-line',
      )}
    >
      <div className="mb-1.5 flex items-start gap-2">
        <CircleDot className={cn('mt-0.5 size-3 shrink-0', urgent ? 'text-danger' : 'text-content-faint')} />
        <h4 className="text-xs font-bold leading-tight text-content">{title}</h4>
      </div>

      {location ? (
        <p className="mb-1 flex items-center gap-1 text-2xs text-content-muted">
          <MapPin className="size-3 shrink-0" />
          {location}
        </p>
      ) : null}
      {meta ? <p className="text-2xs text-content-faint">{meta}</p> : null}

      {progress !== undefined ? (
        <div className="mt-2">
          <div className="mb-1 flex justify-between text-2xs text-content-faint">
            <span>Progress</span>
            <span className="tnum font-bold">{progress}%</span>
          </div>
          <ProgressBar value={progress} variant="warn" />
        </div>
      ) : null}

      {action ? <div className="mt-2.5">{action}</div> : null}
    </article>
  );
}
