import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useChartTheme } from '@/hooks/useTheme';
import { ChartTooltip } from './ChartTooltip';

export interface DonutSlice {
  label: string;
  value: number;
  color?: string;
}

/**
 * Donut with a centred total. The legend is a plain list beside the chart
 * rather than Recharts' built-in legend, which wraps unpredictably.
 */
export function DonutBreakdown({
  data,
  height = 220,
  valueFormatter = (value) => String(value),
  centerLabel = 'Total',
}: {
  data: DonutSlice[];
  height?: number;
  valueFormatter?: (value: number) => string;
  centerLabel?: string;
}) {
  const theme = useChartTheme();
  const palette = [theme.primary, theme.violet, theme.warn, theme.success, theme.danger, theme.muted];
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="66%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((slice, index) => (
                <Cell key={slice.label} fill={slice.color ?? palette[index % palette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="tnum font-display text-xl font-extrabold text-content">
            {valueFormatter(total)}
          </span>
          <span className="text-2xs uppercase tracking-wider text-content-faint">{centerLabel}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2">
        {data.map((slice, index) => {
          const share = total > 0 ? (slice.value / total) * 100 : 0;
          return (
            <li key={slice.label} className="flex items-center gap-2.5 text-xs">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: slice.color ?? palette[index % palette.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-content-muted">{slice.label}</span>
              <span className="tnum shrink-0 font-semibold text-content">{valueFormatter(slice.value)}</span>
              <span className="tnum w-10 shrink-0 text-right text-content-faint">{share.toFixed(0)}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
