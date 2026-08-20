import { useId, useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartTheme } from '@/hooks/useTheme';
import { shortDate } from '@/lib/format';
import type { ForecastChart as ForecastChartData } from '@/lib/types';
import { ChartTooltip } from './ChartTooltip';

interface Row {
  date: string;
  history: number | null;
  forecast: number | null;
  /** [lower, upper] — Recharts renders a ranged Area from a tuple. */
  band: [number, number] | null;
}

/**
 * History + forecast on one continuous axis with a 95% confidence band.
 *
 * The band is drawn as a ranged Area (a [lower, upper] tuple per point), which
 * is far simpler and more robust than the old approach of stacking an
 * "upper bound" dataset with `fill: '+1'` over a transparent lower series.
 */
export function ForecastChart({ data, height = 320 }: { data: ForecastChartData; height?: number }) {
  const theme = useChartTheme();
  const bandId = useId();

  const rows = useMemo<Row[]>(() => {
    const history: Row[] = data.hist_dates.map((date, index) => ({
      date,
      history: data.hist_values[index] ?? null,
      forecast: null,
      band: null,
    }));

    // Join the two segments so the forecast line starts where history ends
    // instead of leaving a visual gap at "today".
    const lastHistory = history.at(-1);
    if (lastHistory) lastHistory.forecast = lastHistory.history;

    const forecast: Row[] = data.fore_dates.map((date, index) => ({
      date,
      history: null,
      forecast: data.fore_base[index] ?? null,
      band: [data.fore_lower[index] ?? 0, data.fore_upper[index] ?? 0],
    }));

    return [...history, ...forecast];
  }, [data]);

  const interval = Math.max(0, Math.ceil(rows.length / 9) - 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={rows} margin={{ top: 10, right: 12, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id={bandId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.primary} stopOpacity={0.22} />
            <stop offset="100%" stopColor={theme.primary} stopOpacity={0.06} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          interval={interval}
          tickFormatter={shortDate}
          tick={{ fill: theme.axis, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis tick={{ fill: theme.axis, fontSize: 10 }} axisLine={false} tickLine={false} width={46} />
        <Tooltip
          content={
            <ChartTooltip
              valueFormatter={(value) => value.toFixed(0)}
              labelFormatter={(label) => shortDate(label)}
            />
          }
          cursor={{ stroke: theme.primary, strokeOpacity: 0.3 }}
        />

        <Area
          dataKey="band"
          name="95% confidence"
          stroke="none"
          fill={`url(#${bandId})`}
          connectNulls
          isAnimationActive={false}
          activeDot={false}
        />

        <ReferenceLine
          x={data.today}
          stroke={theme.muted}
          strokeDasharray="4 4"
          label={{
            value: 'TODAY',
            position: 'insideTopRight',
            fill: theme.muted,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        />

        <Line
          type="monotone"
          dataKey="history"
          name="Historical"
          stroke={theme.muted}
          strokeWidth={1.75}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="forecast"
          name="Forecast"
          stroke={theme.primary}
          strokeWidth={2.5}
          dot={false}
          connectNulls
          activeDot={{ r: 4, strokeWidth: 2, stroke: theme.surface }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
