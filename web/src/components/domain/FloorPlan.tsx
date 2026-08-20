import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { parsePct } from '@/lib/format';
import { shelfStatus, tone } from '@/lib/status';
import type { FloorSection, ShelfStatusCode } from '@/lib/types';

const STATUS_ORDER: ShelfStatusCode[] = ['FULL', 'LOW', 'EMPTY', 'VIOLATION'];

/**
 * Interactive store floor plan. Each aisle is a row of shelf-section tiles;
 * status is encoded redundantly (colour + fill bar + label) so it is not
 * colour-only information.
 */
export function FloorPlan({
  sections,
  onSelect,
  selectedLabel,
}: {
  sections: FloorSection[];
  onSelect?: (section: FloorSection) => void;
  selectedLabel?: string;
}) {
  const aisles = useMemo(() => {
    const grouped = new Map<number, FloorSection[]>();
    for (const section of sections) {
      const list = grouped.get(section.aisle_idx) ?? [];
      list.push(section);
      grouped.set(section.aisle_idx, list);
    }
    return [...grouped.entries()]
      .sort(([a], [b]) => a - b)
      .map(([index, items]) => ({
        index,
        items: [...items].sort((a, b) => a.section - b.section),
      }));
  }, [sections]);

  return (
    <div className="space-y-2.5">
      {aisles.map((aisle) => (
        <div key={aisle.index} className="flex items-stretch gap-3">
          <div className="flex w-16 shrink-0 flex-col justify-center rounded-lg bg-surface-mid/60 px-2 py-1.5">
            <span className="font-mono text-2xs font-bold text-content-muted">
              A{String(aisle.index + 1).padStart(2, '0')}
            </span>
            <span className="text-[0.6rem] text-content-faint">Aisle</span>
          </div>

          <div className="grid flex-1 gap-2" style={{ gridTemplateColumns: `repeat(${aisle.items.length}, minmax(0, 1fr))` }}>
            {aisle.items.map((section) => (
              <FloorSlot
                key={`${section.aisle_idx}-${section.section}`}
                section={section}
                selected={selectedLabel === section.label}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FloorSlot({
  section,
  selected,
  onSelect,
}: {
  section: FloorSection;
  selected: boolean;
  onSelect?: (section: FloorSection) => void;
}) {
  const status = shelfStatus[section.status];
  const t = tone[status.tone];
  const fill = parsePct(section.fill);

  return (
    <button
      type="button"
      onClick={onSelect ? () => onSelect(section) : undefined}
      aria-label={`${section.label}, ${section.name}, ${status.label}, fill ${section.fill}`}
      className={cn(
        'group relative overflow-hidden rounded-lg border p-2 text-left transition-all duration-150 ease-smooth',
        t.bg,
        t.border,
        onSelect && 'cursor-pointer hover:-translate-y-0.5 hover:brightness-110',
        selected && 'ring-2 ring-offset-2 ring-offset-transparent',
        selected && t.ring,
        section.status === 'EMPTY' && 'animate-pulse',
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="font-mono text-[0.6rem] font-bold text-content">{section.label}</span>
        <span className={cn('size-1.5 shrink-0 rounded-full', t.fill)} />
      </div>

      <p className="mt-1 truncate text-[0.65rem] leading-tight text-content-muted" title={section.name}>
        {section.name}
      </p>

      <div className="mt-1.5 flex items-center gap-1.5">
        <span className={cn('tnum text-[0.6rem] font-bold', t.text)}>{section.fill}</span>
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-highest/70">
          {fill !== null && (
            <span className={cn('block h-full rounded-full', t.fill)} style={{ width: `${fill}%` }} />
          )}
        </span>
      </div>
    </button>
  );
}

/** Legend + counts. Doubles as the summary strip under the floor plan. */
export function FloorPlanLegend({
  summary,
}: {
  summary: { full: number; low: number; empty: number; violation: number };
}) {
  const counts: Record<ShelfStatusCode, number> = {
    FULL: summary.full,
    LOW: summary.low,
    EMPTY: summary.empty,
    VIOLATION: summary.violation,
  };

  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {STATUS_ORDER.map((code) => {
        const status = shelfStatus[code];
        const t = tone[status.tone];
        return (
          <li key={code} className="flex items-center gap-2 text-xs">
            <span className={cn('size-2 rounded-full', t.fill)} />
            <span className="text-content-muted">{status.label}</span>
            <span className={cn('tnum font-bold', t.text)}>{counts[code]}</span>
          </li>
        );
      })}
    </ul>
  );
}
