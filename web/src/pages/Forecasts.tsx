import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock,
  CloudSun,
  Download,
  Gauge,
  LineChart,
  RefreshCw,
  Ruler,
  Sigma,
  SlidersHorizontal,
  Target,
  TrendingUp,
} from 'lucide-react';
import { ForecastChart } from '@/components/charts/ForecastChart';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card';
import { Select, Slider, Switch } from '@/components/ui/Controls';
import { DataTable, StackedCell, type Column } from '@/components/ui/DataTable';
import { KpiCard, KpiGrid } from '@/components/ui/KpiCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { AsyncBoundary, ChartSkeleton, KpiSkeleton, Skeleton } from '@/components/ui/States';
import { keys, useForecastAccuracy, useForecastChart, useReplenishment } from '@/hooks/queries';
import { useActiveStore } from '@/hooks/useActiveStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/hooks/useToast';
import { downloadUrl } from '@/lib/api';
import { cn } from '@/lib/cn';
import { num } from '@/lib/format';
import type { ForecastQuery, ReplenishmentRow } from '@/lib/types';

/** WMAPE at or below this is considered a passing forecast. */
const WMAPE_TARGET = 15;

export default function ForecastsPage() {
  const { storeId } = useActiveStore();
  const { push } = useToast();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState<ForecastQuery>({
    safety: 15,
    horizon: '30D',
    freq: 'Daily',
    weather: true,
    holiday: true,
    competitor: false,
  });

  // Debounce the parameter set so dragging the safety slider doesn't fire a
  // request on every step — the chart catches up once the controls settle.
  const debouncedQuery = useDebouncedValue(query, 300);

  const accuracy = useForecastAccuracy(storeId);
  const chart = useForecastChart(storeId, debouncedQuery);
  const replenishment = useReplenishment();

  const [approved, setApproved] = useState<Set<string>>(new Set());

  const patch = (next: Partial<ForecastQuery>) => setQuery((current) => ({ ...current, ...next }));

  const approve = (row: ReplenishmentRow) => {
    setApproved((current) => new Set(current).add(row.sku));
    push({
      kind: 'success',
      title: 'Purchase order queued',
      message: `${row.order} units of ${row.name} sent to the supplier queue.`,
    });
  };

  const approveAll = () => {
    const pending = (replenishment.data ?? []).filter((row) => row.has_action && row.order > 0);
    if (pending.length === 0) {
      push({ kind: 'info', title: 'Nothing to approve', message: 'No SKUs currently need reordering.' });
      return;
    }
    setApproved(new Set(pending.map((row) => row.sku)));
    push({
      kind: 'success',
      title: `${pending.length} orders queued`,
      message: `${num(pending.reduce((sum, row) => sum + row.order, 0))} units across ${pending.length} SKUs.`,
    });
  };

  const columns: Column<ReplenishmentRow>[] = [
    {
      key: 'sku',
      header: 'SKU & product',
      cell: (row) => <StackedCell primary={row.name} secondary={row.sku} mono />,
    },
    {
      key: 'stock',
      header: 'Current stock',
      align: 'center',
      cell: (row) => (
        <div>
          <span className="tnum text-sm font-bold" style={{ color: row.stock_color }}>
            {num(row.stock)}
          </span>
          <p className="mt-0.5 text-2xs text-content-faint">{row.stock_status}</p>
        </div>
      ),
    },
    {
      key: 'demand',
      header: '7-day demand',
      align: 'center',
      cell: (row) => <span className="tnum text-sm text-content">{num(row.demand)}</span>,
    },
    {
      key: 'minmax',
      header: 'Min / max target',
      align: 'center',
      hideOnMobile: true,
      cell: (row) => <span className="tnum font-mono text-xs text-content-muted">{row.min_max}</span>,
    },
    {
      key: 'order',
      header: 'Suggested order',
      align: 'center',
      cell: (row) => (
        <span className={cn('tnum text-sm font-extrabold', row.order > 0 ? 'text-primary' : 'text-content-faint')}>
          {row.order > 0 ? num(row.order) : '0'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      width: 'w-40',
      cell: (row) => {
        if (!row.has_action || row.order === 0) {
          return <span className="text-2xs italic text-content-faint">No action needed</span>;
        }
        if (approved.has(row.sku)) {
          return <Badge variant="success" dot>PO queued</Badge>;
        }
        return (
          <Button variant="primary" onClick={() => approve(row)}>
            Confirm order
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Demand planning"
        title="Demand Forecast"
        description="Projected demand with a 95% confidence band, plus the replenishment orders it implies."
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              icon={<Download className="size-4" />}
              onClick={() => window.open(downloadUrl('/api/forecast/export-csv'), '_blank')}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<RefreshCw className="size-4" />}
              loading={chart.isFetching}
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: keys.forecastChart(storeId, debouncedQuery) });
                push({ kind: 'info', title: 'Re-simulating', message: 'Recomputing the demand curve.' });
              }}
            >
              Re-simulate
            </Button>
          </>
        }
      />

      {/* ── Accuracy ─────────────────────────────────────────────────── */}
      <AsyncBoundary
        query={accuracy}
        skeleton={
          <KpiGrid>
            {Array.from({ length: 3 }, (_, index) => (
              <KpiSkeleton key={index} />
            ))}
          </KpiGrid>
        }
      >
        {(data) => (
          <KpiGrid>
            <KpiCard
              label="WMAPE"
              value={data.wmape.toFixed(1)}
              unit="%"
              icon={<Target className="size-5" />}
              variant={data.wmape <= WMAPE_TARGET ? 'success' : 'warn'}
              tag={data.wmape <= WMAPE_TARGET ? 'Within target' : 'Above target'}
              hint={`Weighted absolute percentage error · target ≤ ${WMAPE_TARGET}%`}
            />
            <KpiCard
              label="MAE"
              value={data.mae.toFixed(1)}
              unit="units"
              icon={<Ruler className="size-5" />}
              variant="primary"
              hint="Mean absolute error per SKU-day"
            />
            <KpiCard
              label="RMSE"
              value={data.rmse.toFixed(1)}
              unit="units"
              icon={<Sigma className="size-5" />}
              variant="violet"
              hint="Root mean squared error — penalises large misses"
            />
          </KpiGrid>
        )}
      </AsyncBoundary>

      {/* ── Chart + parameters ──────────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader
            title="Demand projection"
            subtitle={`${query.horizon.replace('D', '-day')} look-forward horizon`}
            icon={<LineChart className="size-4" />}
            action={
              <div className="flex items-center gap-4">
                <Legend color="bg-content-muted" label="Historical" />
                <Legend color="bg-primary" label="Forecast" />
                <Legend color="bg-primary/25" label="95% band" />
              </div>
            }
          />
          <CardBody>
            <AsyncBoundary query={chart} skeleton={<ChartSkeleton height={320} />}>
              {(data) => (
                <div className={cn('transition-opacity', chart.isFetching && 'opacity-60')}>
                  <ForecastChart data={data} />
                </div>
              )}
            </AsyncBoundary>
          </CardBody>
          <CardFooter>
            <div className="flex flex-wrap items-center justify-between gap-3 text-2xs text-content-faint">
              <span>
                {chart.data
                  ? `${chart.data.hist_dates.length} days history · ${chart.data.horizon_days} days projected`
                  : '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" />
                Model online
              </span>
            </div>
          </CardFooter>
        </Card>

        {/* Parameters — every control is wired to a real query parameter */}
        <Card>
          <CardHeader
            title="Model parameters"
            subtitle="Changes re-run the projection"
            icon={<SlidersHorizontal className="size-4" />}
          />
          <CardBody className="space-y-6">
            <Slider
              label="Safety stock level"
              value={query.safety}
              min={5}
              max={40}
              step={1}
              onChange={(value) => patch({ safety: value })}
              format={(value) => `${value}%`}
              hint="Widens the confidence band to absorb demand variability."
            />

            <div>
              <p className="mb-2 text-2xs font-bold uppercase tracking-wider text-content-muted">
                Forecast horizon
              </p>
              <Tabs
                value={query.horizon}
                onChange={(horizon) => patch({ horizon })}
                items={[
                  { id: '7D' as const, label: '7 days' },
                  { id: '30D' as const, label: '30 days' },
                  { id: '90D' as const, label: '90 days' },
                ]}
                className="w-full"
              />
            </div>

            <div>
              <p className="mb-2 text-2xs font-bold uppercase tracking-wider text-content-muted">
                Aggregation
              </p>
              <Select
                label="Aggregation frequency"
                value={query.freq}
                onChange={(freq) => patch({ freq: freq as ForecastQuery['freq'] })}
                icon={<CalendarClock className="size-3.5" />}
                options={[
                  { value: 'Daily', label: 'Daily' },
                  { value: 'Weekly', label: 'Weekly' },
                  { value: 'Monthly', label: 'Monthly' },
                ]}
                className="w-full"
              />
            </div>

            <div className="border-t border-line/60 pt-2">
              <p className="mb-1 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-content-muted">
                <CloudSun className="size-3.5" />
                External regressors
              </p>
              <Switch
                label="Local weather"
                description="Sent with the request; treated as neutral by the current model."
                checked={query.weather}
                onChange={(weather) => patch({ weather })}
              />
              <Switch
                label="Holiday & event calendar"
                description="Navratri, Diwali, Uttarayan and IPL fixtures."
                checked={query.holiday}
                onChange={(holiday) => patch({ holiday })}
              />
              <Switch
                label="Competitor pricing"
                description="Adds market-driven variance to the projection."
                checked={query.competitor}
                onChange={(competitor) => patch({ competitor })}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ── Replenishment ───────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Replenishment recommendations"
          subtitle="Derived from projected demand against current shelf stock"
          icon={<TrendingUp className="size-4" />}
          action={
            <>
              {replenishment.data ? (
                <Badge variant="warn">
                  {replenishment.data.filter((row) => row.has_action && row.order > 0).length} need action
                </Badge>
              ) : null}
              <Button variant="primary" icon={<Gauge className="size-3.5" />} onClick={approveAll}>
                Approve all
              </Button>
            </>
          }
        />
        <AsyncBoundary
          query={replenishment}
          skeleton={
            <div className="space-y-2 p-5">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-12" />
              ))}
            </div>
          }
        >
          {(data) => <DataTable columns={columns} rows={data} rowKey={(row) => row.sku} />}
        </AsyncBoundary>
        <CardFooter>
          <p className="text-2xs text-content-faint">
            Confirming an order queues it locally for review. Wire this to your purchasing system to
            dispatch real EDI orders.
          </p>
        </CardFooter>
      </Card>
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-2xs text-content-muted">
      <span className={cn('size-2 rounded-full', color)} />
      {label}
    </span>
  );
}
