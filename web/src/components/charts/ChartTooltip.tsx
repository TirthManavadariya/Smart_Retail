import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

/**
 * Glass tooltip shared by every chart. Colours come from the token layer via
 * Tailwind classes, so it follows theme changes with no JS.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (value) => String(value),
  labelFormatter,
}: TooltipProps<ValueType, NameType> & {
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="glass rounded-xl px-3 py-2 shadow-pop">
      {label !== undefined && (
        <p className="mb-1.5 text-2xs font-bold uppercase tracking-wider text-content-faint">
          {labelFormatter ? labelFormatter(String(label)) : String(label)}
        </p>
      )}
      <ul className="space-y-1">
        {payload.map((entry, index) => (
          <li key={index} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: entry.color ?? entry.stroke ?? 'currentColor' }}
            />
            <span className="text-content-muted">{entry.name}</span>
            <span className="tnum ml-auto font-bold text-content">
              {typeof entry.value === 'number' ? valueFormatter(entry.value) : String(entry.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
