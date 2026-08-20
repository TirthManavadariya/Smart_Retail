import { useMemo, useState } from 'react';
import {
  Boxes,
  ChevronRight,
  Cpu,
  Eye,
  LayoutList,
  PackageCheck,
  Ruler,
  ScanSearch,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Controls';
import { DataTable, StackedCell, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressBar, RadialGauge } from '@/components/ui/Progress';
import { AsyncBoundary, EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { useAisleDetail, useFloorPlan, usePlanogramGrid } from '@/hooks/queries';
import { useActiveStore } from '@/hooks/useActiveStore';
import { cn } from '@/lib/cn';
import { parsePct, pct } from '@/lib/format';
import { shelfStatus, tone, type Tone } from '@/lib/status';
import type { FloorSection, PlanogramGrid } from '@/lib/types';

export default function ShelfAnalysisPage() {
  const { storeId, activeStore } = useActiveStore();
  const [aisleIdx, setAisleIdx] = useState(0);

  const grid = usePlanogramGrid(storeId, aisleIdx);
  const floorPlan = useFloorPlan(storeId);
  const detail = useAisleDetail();

  const aisleName = grid.data?.aisle_names[aisleIdx]?.name ?? `Aisle ${aisleIdx + 1}`;

  // Sections the CV pass reported for this aisle.
  const detected = useMemo(
    () => (floorPlan.data?.sections ?? []).filter((section) => section.aisle_idx === aisleIdx),
    [floorPlan.data, aisleIdx],
  );

  return (
    <>
      <PageHeader
        eyebrow="Shelf intelligence"
        title="Shelf Analysis"
        description={
          <span className="flex flex-wrap items-center gap-1.5">
            <span>{activeStore?.name ?? storeId}</span>
            <ChevronRight className="size-3" />
            <span>{aisleName}</span>
            <ChevronRight className="size-3" />
            <span className="text-primary">Planogram vs detected state</span>
          </span>
        }
        actions={
          grid.data && grid.data.aisle_names.length > 0 ? (
            <Select
              label="Aisle"
              value={String(aisleIdx)}
              onChange={(value) => setAisleIdx(Number(value))}
              icon={<LayoutList className="size-3.5" />}
              options={grid.data.aisle_names.map((aisle, index) => ({
                value: String(index),
                label: aisle.name,
              }))}
            />
          ) : null
        }
      />

      {/* ── Health strip ─────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Planogram match" subtitle="Detected layout vs reference" />
          <CardBody className="flex items-center justify-center gap-6">
            <AsyncBoundary query={detail} skeleton={<Skeleton className="size-24 rounded-full" />}>
              {(data) => (
                <>
                  <RadialGauge value={data.compliance_pct} size={104} caption="Compliance" />
                  <div className="space-y-2 text-xs">
                    <Metric label="Stock level" value={pct(data.stock_pct)} />
                    <Metric label="Violations" value={String(data.violations)} />
                    <Metric
                      label="1h change"
                      value={pct(data.delta_pct)}
                      valueTone={data.delta_pct >= 0 ? 'success' : 'danger'}
                    />
                  </div>
                </>
              )}
            </AsyncBoundary>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Bay coverage" subtitle="Sections observed in this aisle" icon={<Eye className="size-4" />} />
          <CardBody>
            <AsyncBoundary query={floorPlan} skeleton={<Skeleton className="h-28 rounded-xl" />}>
              {() => {
                const counts = detected.reduce<Record<string, number>>((acc, section) => {
                  acc[section.status] = (acc[section.status] ?? 0) + 1;
                  return acc;
                }, {});
                return (
                  <ul className="space-y-3">
                    {(['FULL', 'LOW', 'EMPTY', 'VIOLATION'] as const).map((code) => {
                      const status = shelfStatus[code];
                      const count = counts[code] ?? 0;
                      const share = detected.length > 0 ? (count / detected.length) * 100 : 0;
                      return (
                        <li key={code}>
                          <div className="mb-1 flex items-baseline justify-between text-xs">
                            <span className="text-content-muted">{status.label}</span>
                            <span className={cn('tnum font-bold', tone[status.tone].text)}>{count}</span>
                          </div>
                          <ProgressBar value={share} variant={status.tone} />
                        </li>
                      );
                    })}
                  </ul>
                );
              }}
            </AsyncBoundary>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Vision pipeline" subtitle="Detector telemetry" icon={<Cpu className="size-4" />} />
          <CardBody className="space-y-4">
            <AsyncBoundary query={detail} skeleton={<Skeleton className="h-28 rounded-xl" />}>
              {(data) => (
                <>
                  <div>
                    <div className="mb-1.5 flex items-baseline justify-between text-xs">
                      <span className="text-content-muted">Model confidence</span>
                      <span className="tnum font-bold text-content">{pct(data.compliance_pct)}</span>
                    </div>
                    <ProgressBar value={data.compliance_pct} variant="primary" />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-baseline justify-between text-xs">
                      <span className="text-content-muted">Shelf fill rate</span>
                      <span className="tnum font-bold text-content">{pct(data.stock_pct)}</span>
                    </div>
                    <ProgressBar value={data.stock_pct} variant="success" />
                  </div>
                  <dl className="grid grid-cols-2 gap-3 border-t border-line/60 pt-3">
                    <div>
                      <dt className="text-2xs uppercase tracking-wider text-content-faint">Detector</dt>
                      <dd className="mt-0.5 font-mono text-xs font-semibold text-content">YOLOv8</dd>
                    </div>
                    <div>
                      <dt className="text-2xs uppercase tracking-wider text-content-faint">Log entries</dt>
                      <dd className="tnum mt-0.5 text-xs font-semibold text-content">
                        {data.detections.length}
                      </dd>
                    </div>
                  </dl>
                </>
              )}
            </AsyncBoundary>
          </CardBody>
        </Card>
      </div>

      {/* ── Reference vs detected ────────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Reference planogram"
            subtitle={`${aisleName} — shelves ordered top to bottom`}
            icon={<Ruler className="size-4" />}
            action={<Badge variant="primary">Reference</Badge>}
          />
          <CardBody>
            {grid.error ? (
              <ErrorState
                error={grid.error}
                onRetry={() => void grid.refetch()}
                compact
              />
            ) : (
              <AsyncBoundary
                query={grid}
                skeleton={
                  <div className="space-y-3">
                    {Array.from({ length: 4 }, (_, index) => (
                      <Skeleton key={index} className="h-24 rounded-xl" />
                    ))}
                  </div>
                }
                isEmpty={(data) => data.shelves.length === 0}
                empty={
                  <EmptyState
                    title="No planogram for this aisle"
                    description="Seed the sample planograms or run the optimizer to generate one."
                  />
                }
              >
                {(data) => <PlanogramTiers grid={data} />}
              </AsyncBoundary>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Detected shelf state"
            subtitle="What the latest CV pass actually observed"
            icon={<ScanSearch className="size-4" />}
            action={
              <Badge variant={detected.some((s) => s.status === 'EMPTY') ? 'danger' : 'primary'}>
                {detected.filter((s) => s.status !== 'FULL').length} discrepancies
              </Badge>
            }
          />
          <CardBody>
            <AsyncBoundary
              query={floorPlan}
              skeleton={
                <div className="space-y-3">
                  {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-20 rounded-xl" />
                  ))}
                </div>
              }
              isEmpty={() => detected.length === 0}
              empty={
                <EmptyState
                  title="No observations for this aisle"
                  description="The floor-plan pass covers a different aisle range than the planogram."
                />
              }
            >
              {() => (
                <ul className="space-y-2.5">
                  {detected.map((section) => (
                    <DetectedRow key={`${section.aisle_idx}-${section.section}`} section={section} />
                  ))}
                </ul>
              )}
            </AsyncBoundary>
          </CardBody>
        </Card>
      </div>

      {/* ── SKU-level analysis ──────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="SKU-level analysis"
          subtitle="Planogram allocation joined to CV observations by SKU"
          icon={<Boxes className="size-4" />}
        />
        <AsyncBoundary
          query={grid}
          skeleton={<div className="space-y-2 p-5">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-10" />)}</div>}
          isEmpty={(data) => data.shelves.length === 0}
          empty={<EmptyState title="Nothing to analyse" description="No planogram sections for this aisle." />}
        >
          {(data) => <SkuTable grid={data} detected={detected} />}
        </AsyncBoundary>
        <CardFooter>
          <p className="text-2xs text-content-faint">
            Expected facings come from the planogram. Observed fill is matched on SKU from the latest
            detection pass — SKUs the camera has not reported yet show as unobserved.
          </p>
        </CardFooter>
      </Card>
    </>
  );
}

/** Reference planogram rendered as physical shelf tiers. */
function PlanogramTiers({ grid }: { grid: PlanogramGrid }) {
  return (
    <div className="space-y-3">
      {grid.shelves.map((shelf) => {
        const filled = shelf.sections.filter((section) => section.sku_id !== 'EMPTY').length;
        return (
          <div
            key={shelf.shelf_number}
            className={cn(
              'rounded-xl border p-3',
              shelf.is_eye_level ? 'border-primary/35 bg-primary/5' : 'border-line bg-surface-mid/40',
            )}
          >
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 font-mono text-2xs font-bold',
                    shelf.is_eye_level ? 'bg-primary/15 text-primary' : 'bg-surface-high text-content-muted',
                  )}
                >
                  SHELF {shelf.shelf_number}
                </span>
                {shelf.is_eye_level ? <Badge variant="primary">Eye level</Badge> : null}
              </span>
              <span className="tnum text-2xs font-semibold text-content-muted">
                {filled}/{shelf.sections.length} slots allocated
              </span>
            </div>

            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${Math.min(shelf.sections.length, 6)}, minmax(0, 1fr))` }}
            >
              {shelf.sections.map((section, index) => {
                const empty = section.sku_id === 'EMPTY';
                return (
                  <div
                    key={`${shelf.shelf_number}-${index}`}
                    title={empty ? 'Unallocated slot' : `${section.sku_id} — ${section.product_name}`}
                    className={cn(
                      'rounded-lg border p-2',
                      empty
                        ? 'border-dashed border-line bg-transparent'
                        : 'border-line bg-surface-high/60',
                    )}
                  >
                    {empty ? (
                      <p className="text-center text-[0.6rem] text-content-faint">empty</p>
                    ) : (
                      <>
                        <p className="truncate font-mono text-[0.6rem] font-bold text-primary">
                          {section.sku_id}
                        </p>
                        <p className="mt-0.5 truncate text-[0.65rem] leading-tight text-content-muted">
                          {section.product_name}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DetectedRow({ section }: { section: FloorSection }) {
  const status = shelfStatus[section.status];
  const t = tone[status.tone];
  const fill = parsePct(section.fill);

  return (
    <li className={cn('flex items-center gap-3 rounded-xl border border-l-2 bg-surface-mid/50 p-3', t.border)}>
      <span className="w-14 shrink-0 font-mono text-2xs font-bold text-content">{section.label}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-content">{section.name}</p>
        <p className="truncate font-mono text-[0.6rem] text-content-faint">{section.sku || 'no SKU'}</p>
      </div>
      <div className="w-24 shrink-0">
        <ProgressBar value={fill ?? 0} variant={status.tone} />
      </div>
      <Badge variant={status.tone} dot className="shrink-0">
        {status.label}
      </Badge>
    </li>
  );
}

interface SkuRow {
  sku: string;
  name: string;
  expected: number;
  shelves: number[];
  observedFill: number | null;
  observedStatus: FloorSection['status'] | null;
}

function SkuTable({ grid, detected }: { grid: PlanogramGrid; detected: FloorSection[] }) {
  const rows = useMemo<SkuRow[]>(() => {
    const bySku = new Map<string, SkuRow>();

    for (const shelf of grid.shelves) {
      for (const section of shelf.sections) {
        if (section.sku_id === 'EMPTY') continue;
        const existing = bySku.get(section.sku_id);
        if (existing) {
          existing.expected += 1;
          if (!existing.shelves.includes(shelf.shelf_number)) existing.shelves.push(shelf.shelf_number);
        } else {
          bySku.set(section.sku_id, {
            sku: section.sku_id,
            name: section.product_name || 'Unnamed product',
            expected: 1,
            shelves: [shelf.shelf_number],
            observedFill: null,
            observedStatus: null,
          });
        }
      }
    }

    // Join CV observations on SKU.
    for (const observation of detected) {
      const row = bySku.get(observation.sku);
      if (row) {
        row.observedFill = parsePct(observation.fill);
        row.observedStatus = observation.status;
      }
    }

    return [...bySku.values()].sort((a, b) => {
      // Unobserved rows last, worst observed status first.
      const rank = (row: SkuRow) =>
        row.observedStatus === 'EMPTY'
          ? 0
          : row.observedStatus === 'VIOLATION'
            ? 1
            : row.observedStatus === 'LOW'
              ? 2
              : row.observedStatus === 'FULL'
                ? 3
                : 4;
      return rank(a) - rank(b) || b.expected - a.expected;
    });
  }, [grid, detected]);

  const columns: Column<SkuRow>[] = [
    {
      key: 'product',
      header: 'Product / SKU',
      cell: (row) => <StackedCell primary={row.name} secondary={row.sku} mono />,
    },
    {
      key: 'expected',
      header: 'Expected facings',
      align: 'center',
      cell: (row) => <span className="tnum text-sm font-bold text-content">{row.expected}</span>,
    },
    {
      key: 'shelves',
      header: 'Shelves',
      align: 'center',
      hideOnMobile: true,
      cell: (row) => (
        <span className="font-mono text-2xs text-content-muted">
          {row.shelves.sort((a, b) => a - b).join(', ')}
        </span>
      ),
    },
    {
      key: 'observed',
      header: 'Observed fill',
      align: 'center',
      width: 'w-40',
      cell: (row) =>
        row.observedFill === null ? (
          <span className="text-2xs italic text-content-faint">not observed</span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <ProgressBar
              value={row.observedFill}
              variant={row.observedStatus ? shelfStatus[row.observedStatus].tone : 'neutral'}
              className="w-16"
            />
            <span className="tnum text-xs font-semibold text-content">{row.observedFill}%</span>
          </span>
        ),
    },
    {
      key: 'status',
      header: 'Stock status',
      align: 'center',
      cell: (row) =>
        row.observedStatus ? (
          <Badge variant={shelfStatus[row.observedStatus].tone} dot>
            {shelfStatus[row.observedStatus].label}
          </Badge>
        ) : (
          <Badge variant="neutral">Pending scan</Badge>
        ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (row) => {
        if (row.observedStatus === 'EMPTY') {
          return (
            <span className="inline-flex items-center gap-1 text-2xs font-bold text-danger">
              <PackageCheck className="size-3.5" /> Restock now
            </span>
          );
        }
        if (row.observedStatus === 'LOW') {
          return <span className="text-2xs font-bold text-warn">Schedule top-up</span>;
        }
        if (row.observedStatus === 'VIOLATION') {
          return <span className="text-2xs font-bold text-violet">Realign slot</span>;
        }
        return <span className="text-2xs text-content-faint">—</span>;
      },
    },
  ];

  return <DataTable columns={columns} rows={rows} rowKey={(row) => row.sku} maxHeight={520} />;
}

function Metric({
  label,
  value,
  valueTone = 'neutral',
}: {
  label: string;
  value: string;
  valueTone?: Tone;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-content-muted">{label}</span>
      <span className={cn('tnum font-bold', valueTone === 'neutral' ? 'text-content' : tone[valueTone].text)}>
        {value}
      </span>
    </div>
  );
}
