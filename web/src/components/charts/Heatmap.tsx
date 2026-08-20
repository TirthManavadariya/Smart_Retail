import { useMemo } from 'react';
import { cn } from '@/lib/cn';

/**
 * Matrix heatmap built with CSS grid rather than a charting library — it stays
 * crisp at any size, is keyboard/screen-reader friendly, and inherits theme
 * tokens directly. Intensity is encoded as opacity over the accent colour so
 * it reads correctly in both light and dark themes.
 */
export function Heatmap({
  rows,
  columns,
  matrix,
  valueLabel = 'events',
  accent = 'danger',
  maxColumnLabels = 8,
}: {
  rows: string[];
  columns: string[];
  /** matrix[rowIndex][columnIndex] */
  matrix: number[][];
  valueLabel?: string;
  accent?: 'danger' | 'primary' | 'warn';
  maxColumnLabels?: number;
}) {
  const max = useMemo(
    () => Math.max(1, ...matrix.flatMap((row) => row.map((value) => value ?? 0))),
    [matrix],
  );

  const accentVar = {
    danger: '--c-danger',
    primary: '--c-primary',
    warn: '--c-warn',
  }[accent];

  const labelStride = Math.max(1, Math.ceil(columns.length / maxColumnLabels));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[34rem]">
        {/* Column headings */}
        <div
          className="mb-1.5 grid gap-1 pl-[6.5rem]"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((column, index) => (
            <span
              key={column}
              className="truncate text-center text-[0.6rem] font-medium text-content-faint"
            >
              {index % labelStride === 0 ? column : ''}
            </span>
          ))}
        </div>

        {rows.map((row, rowIndex) => (
          <div key={row} className="mb-1 flex items-center gap-1 last:mb-0">
            <span className="w-[6.5rem] shrink-0 truncate pr-2 text-right text-2xs font-medium text-content-muted">
              {row}
            </span>
            <div
              className="grid flex-1 gap-1"
              style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
            >
              {columns.map((column, columnIndex) => {
                const value = matrix[rowIndex]?.[columnIndex] ?? 0;
                const intensity = value / max;
                return (
                  <div
                    key={`${row}-${column}`}
                    title={`${row} · ${column} — ${value} ${valueLabel}`}
                    className={cn(
                      'group relative h-6 rounded transition-transform duration-150',
                      'hover:z-10 hover:scale-[1.18] hover:ring-1 hover:ring-content/30',
                      value === 0 && 'bg-surface-high/60',
                    )}
                    style={
                      value > 0
                        ? {
                            // Floor at 0.14 so low-but-nonzero cells stay visible
                            background: `rgb(var(${accentVar}) / ${(0.14 + intensity * 0.86).toFixed(3)})`,
                          }
                        : undefined
                    }
                  >
                    <span className="sr-only">
                      {row} {column}: {value} {valueLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Scale legend */}
        <div className="mt-3 flex items-center justify-end gap-2 text-2xs text-content-faint">
          <span>0</span>
          <div className="flex gap-0.5">
            {[0.14, 0.32, 0.5, 0.68, 0.86, 1].map((step) => (
              <span
                key={step}
                className="size-3 rounded-sm"
                style={{ background: `rgb(var(${accentVar}) / ${step})` }}
              />
            ))}
          </div>
          <span>{max}</span>
          <span className="ml-1">{valueLabel}</span>
        </div>
      </div>
    </div>
  );
}
