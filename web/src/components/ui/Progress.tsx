import { cn } from '@/lib/cn';
import { complianceTone, tone, type Tone } from '@/lib/status';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: Tone;
  className?: string;
  height?: 'sm' | 'md';
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  className,
  height = 'sm',
  label,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-full bg-surface-high',
        height === 'sm' ? 'h-1.5' : 'h-2.5',
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-700 ease-smooth', tone[variant].fill)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/**
 * Labelled compliance rows: name, value, bar, and an automatic status word.
 * Tone is derived from the percentage so the colour can never contradict it.
 */
export function ComplianceBars({
  items,
  showStatus = true,
  className,
}: {
  items: { name: string; pct: number }[];
  showStatus?: boolean;
  className?: string;
}) {
  return (
    <ul className={cn('space-y-3.5', className)}>
      {items.map((item) => {
        const status = complianceTone(item.pct);
        return (
          <li key={item.name}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="truncate text-xs font-medium text-content">{item.name}</span>
              <span className="flex shrink-0 items-baseline gap-2">
                {showStatus ? (
                  <span className={cn('text-2xs font-semibold uppercase', tone[status.tone].text)}>
                    {status.label}
                  </span>
                ) : null}
                <span className="tnum text-xs font-bold text-content">{item.pct}%</span>
              </span>
            </div>
            <ProgressBar value={item.pct} variant={status.tone} label={item.name} />
          </li>
        );
      })}
    </ul>
  );
}

/** Circular gauge for a single headline percentage. */
export function RadialGauge({
  value,
  size = 96,
  variant,
  caption,
}: {
  value: number;
  size?: number;
  variant?: Tone;
  caption?: string;
}) {
  const resolved = variant ?? complianceTone(value).tone;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, value)) / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-surface-high"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-[stroke-dashoffset] duration-700 ease-smooth', {
              'stroke-primary': resolved === 'primary',
              'stroke-warn': resolved === 'warn',
              'stroke-danger': resolved === 'danger',
              'stroke-success': resolved === 'success',
              'stroke-violet': resolved === 'violet',
              'stroke-content-faint': resolved === 'neutral',
            })}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center">
          <span className="tnum font-display text-xl font-extrabold text-content">
            {Math.round(value)}%
          </span>
        </span>
      </div>
      {caption ? <span className="text-2xs uppercase tracking-wider text-content-faint">{caption}</span> : null}
    </div>
  );
}
