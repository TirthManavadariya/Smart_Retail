import type { ReactNode } from 'react';
import { AlertOctagon, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/cn';
import { money } from '@/lib/format';
import { severityTone, tone } from '@/lib/status';
import { Badge } from '@/components/ui/Badge';

const severityIcon = {
  danger: AlertOctagon,
  warn: AlertTriangle,
  primary: Info,
} as const;

/**
 * Compact alert row for feeds. Severity drives a left border, an icon and a
 * badge — three redundant cues so scanning a long list is fast.
 */
export function AlertItem({
  severity,
  title,
  detail,
  timeAgo,
  impact,
  badgeLabel,
  metricLabel,
  footer,
}: {
  severity: number;
  title: string;
  detail?: string;
  timeAgo: string;
  /** Numeric revenue impact, or a pre-formatted string from the API. */
  impact?: number | string;
  badgeLabel?: string;
  metricLabel?: string;
  footer?: ReactNode;
}) {
  const t = severityTone(severity);
  const classes = tone[t.tone];
  const Icon = severityIcon[t.tone as keyof typeof severityIcon] ?? Info;

  return (
    <article
      className={cn(
        'rounded-xl border border-l-2 bg-surface-mid/50 p-3.5 transition-colors hover:bg-surface-high/50',
        classes.border,
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <Badge variant={t.tone} dot>
          {badgeLabel ?? t.label}
        </Badge>
        <span className="shrink-0 text-2xs text-content-faint">{timeAgo}</span>
      </div>

      <div className="flex gap-2.5">
        <span className={cn('mt-0.5 shrink-0', classes.text)}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold leading-tight text-content">{title}</h3>
          {detail ? <p className="mt-0.5 truncate text-xs text-content-muted">{detail}</p> : null}
        </div>
      </div>

      {impact !== undefined && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-surface-lowest/60 px-2.5 py-1.5">
          <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-content-faint">
            {metricLabel ?? 'Revenue at risk'}
          </span>
          <span className="tnum text-sm font-extrabold text-content">
            {typeof impact === 'number' ? `${money(impact)}/hr` : impact}
          </span>
        </div>
      )}

      {footer ? <div className="mt-3">{footer}</div> : null}
    </article>
  );
}
