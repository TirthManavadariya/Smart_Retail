import type { CSSProperties, ReactNode } from 'react';
import { AlertTriangle, Inbox, RefreshCw, ServerCrash } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';
import { Button } from './Button';

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={cn('skeleton h-4 w-full', className)} style={style} aria-hidden="true" />;
}

/** Placeholder that matches the KPI card footprint to avoid layout shift. */
export function KpiSkeleton() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="size-10 rounded-xl" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-3 w-24" />
      <Skeleton className="mt-2 h-8 w-28" />
    </div>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="flex items-end gap-2 px-1" style={{ height }} aria-hidden="true">
      {[42, 66, 38, 78, 55, 88, 48, 72, 60, 92, 50, 70].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}>
      <span className="grid size-11 place-items-center rounded-xl bg-surface-high text-content-faint">
        {icon ?? <Inbox className="size-5" />}
      </span>
      <div>
        <p className="font-display text-sm font-bold text-content">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-content-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/**
 * Honest failure state. The old client silently swapped in mock data on any
 * error, which hid a down backend — this surfaces the cause and offers a retry.
 */
export function ErrorState({
  error,
  onRetry,
  className,
  compact = false,
}: {
  error: unknown;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}) {
  const isApi = error instanceof ApiError;
  const unreachable = isApi && error.status === 0;
  const message = error instanceof Error ? error.message : 'Something went wrong';
  const detail = isApi ? error.detail : undefined;

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-danger/25 bg-danger/5 text-center',
        compact ? 'px-4 py-6' : 'px-6 py-10',
        className,
      )}
    >
      <span className="grid size-10 place-items-center rounded-xl bg-danger/15 text-danger">
        {unreachable ? <ServerCrash className="size-5" /> : <AlertTriangle className="size-5" />}
      </span>
      <div>
        <p className="font-display text-sm font-bold text-content">{message}</p>
        {detail ? (
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-content-muted">{detail}</p>
        ) : null}
      </div>
      {onRetry ? (
        <Button variant="secondary" icon={<RefreshCw className="size-3.5" />} onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Single wrapper for the loading / error / empty / ready lifecycle so every
 * widget behaves identically.
 */
export function AsyncBoundary<T>({
  query,
  skeleton,
  children,
  isEmpty,
  empty,
  compactError = true,
}: {
  query: { data: T | undefined; isPending: boolean; error: unknown; refetch: () => void };
  skeleton: ReactNode;
  children: (data: T) => ReactNode;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  compactError?: boolean;
}) {
  if (query.isPending) return <>{skeleton}</>;
  if (query.error) {
    return <ErrorState error={query.error} onRetry={query.refetch} compact={compactError} />;
  }
  if (query.data === undefined) return <>{skeleton}</>;
  if (isEmpty?.(query.data)) return <>{empty ?? <EmptyState title="No data yet" />}</>;
  return <>{children(query.data)}</>;
}
