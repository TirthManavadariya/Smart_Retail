import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartTheme } from '@/hooks/useTheme';
import { ChartTooltip } from './ChartTooltip';

export interface BarPoint {
  label: string;
  value: number;
}

export function BarSeries({
  data,
  height = 240,
  name = 'Value',
  color,
  valueFormatter,
  /** Highlights the tallest bar so the peak is instantly findable. */
  highlightMax = true,
}: {
  data: BarPoint[];
  height?: number;
  name?: string;
  color?: string;
  valueFormatter?: (value: number) => string;
  highlightMax?: boolean;
}) {
  const theme = useChartTheme();
  const base = color ?? theme.primary;
  const max = Math.max(...data.map((point) => point.value), 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: theme.axis, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis tick={{ fill: theme.axis, fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
        <Tooltip
          content={<ChartTooltip valueFormatter={valueFormatter} />}
          cursor={{ fill: theme.primary, fillOpacity: 0.08 }}
        />
        <Bar dataKey="value" name={name} radius={[5, 5, 0, 0]} maxBarSize={44}>
          {data.map((point, index) => (
            <Cell
              key={index}
              fill={base}
              fillOpacity={highlightMax && point.value === max && max > 0 ? 1 : 0.45}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
