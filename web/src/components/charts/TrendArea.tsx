import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartTheme } from '@/hooks/useTheme';
import { ChartTooltip } from './ChartTooltip';

export interface TrendPoint {
  label: string;
  value: number;
}

/** Single-series gradient area chart — the workhorse trend widget. */
export function TrendArea({
  data,
  height = 240,
  color,
  name = 'Value',
  valueFormatter,
  maxTicks = 8,
}: {
  data: TrendPoint[];
  height?: number;
  /** Defaults to the theme primary. */
  color?: string;
  name?: string;
  valueFormatter?: (value: number) => string;
  maxTicks?: number;
}) {
  const theme = useChartTheme();
  const gradientId = useId();
  const stroke = color ?? theme.primary;

  // Thin the X labels rather than letting Recharts overlap them.
  const interval = Math.max(0, Math.ceil(data.length / maxTicks) - 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          interval={interval}
          tick={{ fill: theme.axis, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          tick={{ fill: theme.axis, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          content={<ChartTooltip valueFormatter={valueFormatter} />}
          cursor={{ stroke: theme.primary, strokeOpacity: 0.35, strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          name={name}
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: theme.surface }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
