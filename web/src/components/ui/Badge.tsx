import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { tone, type Tone } from '@/lib/status';

interface BadgeProps {
  children: ReactNode;
  variant?: Tone;
  className?: string;
  /** Adds a leading status dot. */
  dot?: boolean;
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'neutral', className, dot = false, size = 'sm' }: BadgeProps) {
  const t = tone[variant];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide',
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs',
        t.bg,
        t.text,
        t.border,
        className,
      )}
    >
      {dot ? <span className={cn('size-1.5 rounded-full', t.fill)} /> : null}
      {children}
    </span>
  );
}

/** A pulsing "live" indicator — used for the CV pipeline status. */
export function PulseDot({ variant = 'primary' }: { variant?: Tone }) {
  const t = tone[variant];
  return (
    <span className="relative grid size-2 place-items-center">
      <span className={cn('size-2 rounded-full', t.fill)} />
      <span className={cn('absolute size-2 rounded-full opacity-60 animate-ripple', t.fill)} />
    </span>
  );
}

/** Small delta indicator: green/red arrow + value. */
export function TrendPill({
  value,
  suffix = '%',
  /** Set false when a rise is bad (e.g. stockouts). */
  higherIsBetter = true,
  className,
}: {
  value: number;
  suffix?: string;
  higherIsBetter?: boolean;
  className?: string;
}) {
  const rising = value >= 0;
  const good = higherIsBetter ? rising : !rising;
  const t = tone[good ? 'success' : 'danger'];
  return (
    <span
      className={cn(
        'tnum inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-bold',
        t.bg,
        t.text,
        className,
      )}
    >
      <span aria-hidden="true">{rising ? '▲' : '▼'}</span>
      {Math.abs(value).toFixed(1)}
      {suffix}
      <span className="sr-only">{rising ? 'increase' : 'decrease'}</span>
    </span>
  );
}
