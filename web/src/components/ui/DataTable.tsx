import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface Column<Row> {
  key: string;
  header: ReactNode;
  align?: 'left' | 'center' | 'right';
  /** Tailwind width hint, e.g. 'w-32'. */
  width?: string;
  cell: (row: Row, index: number) => ReactNode;
  /** Hide below the md breakpoint to keep narrow screens readable. */
  hideOnMobile?: boolean;
}

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

/**
 * Typed table with sticky header and zebra-free row separation (dividers read
 * cleaner than stripes on glass surfaces). The old implementation passed
 * pre-concatenated <td> HTML strings, which made cells impossible to reuse.
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  className,
  maxHeight,
}: {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string | number;
  onRowClick?: (row: Row) => void;
  className?: string;
  maxHeight?: number;
}) {
  return (
    <div
      className={cn('overflow-auto', className)}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-surface-mid/95 backdrop-blur">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'whitespace-nowrap border-b border-line px-4 py-3 text-2xs font-bold uppercase tracking-wider text-content-muted',
                  alignClass[col.align ?? 'left'],
                  col.width,
                  col.hideOnMobile && 'hidden md:table-cell',
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-line/50 transition-colors last:border-0',
                onRowClick && 'cursor-pointer',
                'hover:bg-surface-low',
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3 align-middle',
                    alignClass[col.align ?? 'left'],
                    col.hideOnMobile && 'hidden md:table-cell',
                  )}
                >
                  {col.cell(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Two-line cell: strong primary line over a dim secondary line. */
export function StackedCell({
  primary,
  secondary,
  mono = false,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="truncate text-sm font-semibold text-content">{primary}</div>
      {secondary ? (
        <div className={cn('truncate text-2xs text-content-faint', mono && 'font-mono')}>{secondary}</div>
      ) : null}
    </div>
  );
}
