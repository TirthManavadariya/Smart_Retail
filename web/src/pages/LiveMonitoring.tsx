import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cctv,
  Eye,
  Footprints,
  Info,
  LayoutGrid,
  ScanLine,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { BarSeries } from '@/components/charts/BarSeries';
import { ShelfScanner } from '@/components/domain/ShelfScanner';
import { Badge, PulseDot } from '@/components/ui/Badge';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Controls';
import { PageHeader } from '@/components/ui/PageHeader';
import { ComplianceBars, ProgressBar, RadialGauge } from '@/components/ui/Progress';
import { AsyncBoundary, ChartSkeleton, Skeleton } from '@/components/ui/States';
import { Tabs } from '@/components/ui/Tabs';
import {
  useAisleDetail,
  usePlanogramCompliance,
  useShelfStatus,
  useTraffic,
} from '@/hooks/queries';
import { useActiveStore } from '@/hooks/useActiveStore';
import { cn } from '@/lib/cn';
import { num, pct } from '@/lib/format';
import { aisleHealth, logKind, tone } from '@/lib/status';
import type { DetectionLogKind } from '@/lib/types';

type Tab = 'aisles' | 'scanner' | 'traffic';

const logIcon: Record<DetectionLogKind, typeof Info> = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Eye,
};

export default function LiveMonitoringPage() {
  const { storeId } = useActiveStore();
  const [tab, setTab] = useState<Tab>('aisles');

  const shelfStatusQuery = useShelfStatus(storeId);
  const detail = useAisleDetail();
  const planogram = usePlanogramCompliance(storeId);
  const traffic = useTraffic(storeId);

  const [selectedAisle, setSelectedAisle] = useState(0);
  const [zoneIndex, setZoneIndex] = useState(0);

  // Reset the selection when the store changes so we never point at a stale row.
  useEffect(() => {
    setSelectedAisle(0);
  }, [storeId]);

  const aisles = shelfStatusQuery.data ?? [];
  const active = aisles[selectedAisle];

  return (
    <>
      <PageHeader
        eyebrow="Computer vision"
        title="Live Monitoring"
        description="Per-aisle shelf state from the detection pipeline, plus on-demand inference for any shelf photo."
        actions={
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-2 text-2xs font-semibold text-primary">
            <PulseDot />
            6 cameras streaming
          </span>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'aisles', label: 'Aisle status', icon: <LayoutGrid className="size-3.5" /> },
          { id: 'scanner', label: 'Image inference', icon: <ScanLine className="size-3.5" /> },
          { id: 'traffic', label: 'Customer traffic', icon: <Footprints className="size-3.5" /> },
        ]}
      />

      {tab === 'aisles' && (
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Aisle picker */}
          <Card className="xl:col-span-2">
            <CardHeader
              title="Aisle compliance matrix"
              subtitle="Select an aisle to inspect its live detection feed"
              action={
                aisles.length > 0 ? <Badge variant="primary">{aisles.length} aisles</Badge> : null
              }
            />
            <CardBody>
              <AsyncBoundary
                query={shelfStatusQuery}
                skeleton={
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }, (_, index) => (
                      <Skeleton key={index} className="h-28 rounded-xl" />
                    ))}
                  </div>
                }
              >
                {(data) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {data.map((aisle, index) => {
                      const health = aisleHealth[aisle.status];
                      const t = tone[health.tone];
                      const isActive = index === selectedAisle;
                      return (
                        <button
                          key={aisle.name}
                          onClick={() => setSelectedAisle(index)}
                          className={cn(
                            'rounded-xl border p-3.5 text-left transition-all duration-150 ease-smooth',
                            'hover:-translate-y-0.5',
                            isActive
                              ? cn(t.bg, t.border, 'ring-1', t.ring)
                              : 'border-line bg-surface-mid/40',
                          )}
                        >
                          <div className="mb-2.5 flex items-start justify-between gap-2">
                            <span className="truncate text-sm font-bold text-content">{aisle.name}</span>
                            <Badge variant={health.tone} dot>
                              {health.label}
                            </Badge>
                          </div>
                          <ProgressBar
                            value={aisle.status === 'optimal' ? 94 : aisle.status === 'low' ? 72 : 48}
                            variant={health.tone}
                          />
                          <div className="mt-2.5 flex items-center justify-between text-2xs text-content-faint">
                            <span>{aisle.sections} bay modules</span>
                            <span className="flex items-center gap-1">
                              <Cctv className="size-3" />
                              CAM-{String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </AsyncBoundary>
            </CardBody>
          </Card>

          {/* Selected aisle detail */}
          <div className="space-y-6">
            <Card>
              <CardHeader
                title={active?.name ?? 'Aisle detail'}
                subtitle="Latest CV pass"
                action={
                  active ? (
                    <Badge variant={aisleHealth[active.status].tone} dot>
                      {aisleHealth[active.status].label}
                    </Badge>
                  ) : null
                }
              />
              <CardBody>
                <AsyncBoundary
                  query={detail}
                  skeleton={<Skeleton className="h-40 rounded-xl" />}
                >
                  {(data) => (
                    <>
                      <div className="flex items-center justify-around gap-3">
                        <RadialGauge value={data.stock_pct} caption="Stock level" />
                        <RadialGauge value={data.compliance_pct} caption="Compliance" />
                      </div>

                      <dl className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-surface-mid/60 p-3">
                          <dt className="text-2xs font-bold uppercase tracking-wider text-content-faint">
                            Violations
                          </dt>
                          <dd className="tnum mt-1 font-display text-xl font-extrabold text-content">
                            {data.violations}
                          </dd>
                        </div>
                        <div className="rounded-xl bg-surface-mid/60 p-3">
                          <dt className="text-2xs font-bold uppercase tracking-wider text-content-faint">
                            Change (1h)
                          </dt>
                          <dd
                            className={cn(
                              'tnum mt-1 flex items-center gap-1 font-display text-xl font-extrabold',
                              data.delta_pct >= 0 ? 'text-success' : 'text-danger',
                            )}
                          >
                            {data.delta_pct >= 0 ? (
                              <TrendingUp className="size-4" />
                            ) : (
                              <TrendingDown className="size-4" />
                            )}
                            {pct(Math.abs(data.delta_pct))}
                          </dd>
                        </div>
                      </dl>
                    </>
                  )}
                </AsyncBoundary>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Detection log" subtitle="Newest first" icon={<Eye className="size-4" />} />
              <CardBody className="p-3">
                <AsyncBoundary
                  query={detail}
                  skeleton={
                    <div className="space-y-2">
                      {Array.from({ length: 4 }, (_, index) => (
                        <Skeleton key={index} className="h-14 rounded-lg" />
                      ))}
                    </div>
                  }
                >
                  {(data) => (
                    <ul className="space-y-1.5">
                      {data.detections.map((entry, index) => {
                        const t = tone[logKind[entry.icon]];
                        const Icon = logIcon[entry.icon];
                        return (
                          <li
                            key={`${entry.sku}-${index}`}
                            className={cn(
                              'flex gap-2.5 rounded-lg border-l-2 bg-surface-mid/50 p-2.5',
                              t.border,
                            )}
                          >
                            <span className={cn('mt-0.5 shrink-0', t.text)}>
                              <Icon className="size-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-content">{entry.sku}</p>
                              <p className="truncate text-2xs text-content-muted">{entry.msg}</p>
                            </div>
                            <span className="shrink-0 font-mono text-[0.6rem] text-content-faint">
                              {entry.time}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </AsyncBoundary>
              </CardBody>
            </Card>
          </div>

          {/* Planogram compliance per aisle */}
          <Card className="xl:col-span-3">
            <CardHeader
              title="Planogram compliance by aisle"
              subtitle="Detected layout matched against the reference planogram"
            />
            <CardBody>
              <AsyncBoundary
                query={planogram}
                skeleton={
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 6 }, (_, index) => (
                      <Skeleton key={index} className="h-8" />
                    ))}
                  </div>
                }
              >
                {(data) => (
                  <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    <ComplianceBars items={data.slice(0, Math.ceil(data.length / 2))} />
                    <ComplianceBars items={data.slice(Math.ceil(data.length / 2))} />
                  </div>
                )}
              </AsyncBoundary>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'scanner' && <ShelfScanner />}

      {tab === 'traffic' && (
        <Card>
          <CardHeader
            title="Customer footfall by zone"
            subtitle="Detected shopper counts per hour"
            action={
              traffic.data ? (
                <Select
                  label="Zone"
                  value={String(zoneIndex)}
                  onChange={(value) => setZoneIndex(Number(value))}
                  options={traffic.data.zones.map((zone, index) => ({
                    value: String(index),
                    label: zone,
                  }))}
                />
              ) : null
            }
          />
          <CardBody>
            <AsyncBoundary query={traffic} skeleton={<ChartSkeleton height={300} />}>
              {(data) => (
                <>
                  <BarSeries
                    height={300}
                    name={data.zones[zoneIndex] ?? 'Zone'}
                    data={data.hours.map((hour, index) => ({
                      label: hour,
                      value: data.data[zoneIndex]?.[index] ?? 0,
                    }))}
                    valueFormatter={(value) => `${num(value)} shoppers`}
                  />
                  <div className="mt-4 grid gap-3 sm:grid-cols-5">
                    {data.zones.map((zone, index) => {
                      const total = (data.data[index] ?? []).reduce((sum, value) => sum + value, 0);
                      return (
                        <button
                          key={zone}
                          onClick={() => setZoneIndex(index)}
                          className={cn(
                            'rounded-xl border p-3 text-left transition-colors',
                            index === zoneIndex
                              ? 'border-primary/40 bg-primary/10'
                              : 'border-line bg-surface-mid/40 hover:bg-surface-high/50',
                          )}
                        >
                          <p className="truncate text-2xs font-semibold uppercase tracking-wider text-content-faint">
                            {zone}
                          </p>
                          <p className="tnum mt-1 font-display text-lg font-extrabold text-content">
                            {num(Math.round(total))}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </AsyncBoundary>
          </CardBody>
          <CardFooter>
            <p className="text-2xs text-content-faint">
              Counts come from the overhead camera array and are aggregated hourly.
            </p>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
