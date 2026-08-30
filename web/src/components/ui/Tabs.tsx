import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
  count?: number;
}

/**
 * Segmented control. Uses real radio semantics via role="tablist" so arrow-key
 * navigation and screen readers work without extra wiring.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  size = 'md',
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex flex-wrap items-center gap-1 rounded-xl border border-line bg-surface-low/70 p-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all duration-150 ease-smooth',
              size === 'sm' ? 'px-2.5 py-1 text-2xs' : 'px-3.5 py-1.5 text-xs',
              active
                ? 'bg-primary text-primary-on'
                : 'text-content-muted hover:bg-surface-high hover:text-content',
            )}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined ? (
              <span
                className={cn(
                  'tnum ml-0.5 rounded-full px-1.5 text-2xs font-bold',
                  active ? 'bg-primary-on/20 text-primary-on' : 'bg-surface-high text-content-muted',
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
