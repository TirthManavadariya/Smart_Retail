import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { tone, type Tone } from '@/lib/status';
import { TrendPill } from './Badge';

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  /** Rendered small and dim next to the value, e.g. "units". */
  unit?: string;
  icon: ReactNode;
  variant?: Tone;
  delta?: { value: number; suffix?: string; higherIsBetter?: boolean };
  /** Replaces the delta pill when you need free-form text (e.g. "Model v4.2"). */
  tag?: string;
  hint?: string;
  className?: string;
}

/**
 * Scannability rules applied here:
 *  - the number is the largest thing in the card and uses tabular figures
 *  - the label sits above the value so the eye reads label → value top-down
 *  - status lives in colour + a single pill, never in the value itself
 *  - a bottom accent rule encodes the tone for at-a-glance grouping
 */
export function KpiCard({
  label,
  value,
  unit,
  icon,
  variant = 'primary',
  delta,
  tag,
  hint,
  className,
}: KpiCardProps) {
  const t = tone[variant];

  return (
    <article
      className={cn(
        'glass glass-seam group relative overflow-hidden rounded-2xl p-5',
        'transition-all duration-200 ease-smooth hover:-translate-y-0.5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'grid size-10 place-items-center rounded-xl border transition-transform duration-200 group-hover:scale-105',
            t.bg,
            t.text,
            t.border,
          )}
        >
          {icon}
        </span>
        {delta ? (
          <TrendPill
            value={delta.value}
            suffix={delta.suffix}
            higherIsBetter={delta.higherIsBetter ?? true}
          />
        ) : tag ? (
          <span className={cn('rounded-full px-2 py-0.5 text-2xs font-semibold', t.bg, t.text)}>
            {tag}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-content-muted">{label}</p>

      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="tnum font-display text-3xl font-extrabold leading-none tracking-tight text-content">
          {value}
        </span>
        {unit ? <span className="text-sm font-medium text-content-muted">{unit}</span> : null}
      </p>

      {hint ? <p className="mt-2 text-2xs text-content-faint">{hint}</p> : null}

      {/* Tone accent rule — lets a row of KPIs be grouped by status at a glance */}
      <span className={cn('absolute inset-x-0 bottom-0 h-0.5 opacity-70', t.fill)} aria-hidden="true" />
    </article>
  );
}

/** Responsive KPI row. auto-fit keeps cards from getting narrower than 220px. */
export function KpiGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('grid gap-4', className)}
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
    >
      {children}
    </div>
  );
}
