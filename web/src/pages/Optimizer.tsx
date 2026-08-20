import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Download,
  Eye,
  Grid3x3,
  LayoutList,
  Play,
  Sparkles,
  Trophy,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Controls';
import { DataTable, StackedCell, type Column } from '@/components/ui/DataTable';
import { KpiCard, KpiGrid } from '@/components/ui/KpiCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressBar } from '@/components/ui/Progress';
import { AsyncBoundary, EmptyState, KpiSkeleton, Skeleton } from '@/components/ui/States';
import { keys, useOptimizerResults, usePlanogramGrid, useTopPerformers } from '@/hooks/queries';
import { useActiveStore } from '@/hooks/useActiveStore';
import { useToast } from '@/hooks/useToast';
import { api, downloadUrl } from '@/lib/api';
import { cn } from '@/lib/cn';
import { moneyCompact, num } from '@/lib/format';
import { tierTone, tone } from '@/lib/status';
import type { TopPerformer } from '@/lib/types';

export default function OptimizerPage() {
  const { storeId } = useActiveStore();
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [aisleIdx, setAisleIdx] = useState(0);

  const results = useOptimizerResults(storeId);
  const performers = useTopPerformers(storeId);
  const grid = usePlanogramGrid(storeId, aisleIdx);

  const run = useMutation({
    mutationFn: () => api.optimizer.run(storeId),
    onSuccess: () => {
      push({
        kind: 'success',
        title: 'Optimization complete',
        message: 'A new planogram has been generated and saved.',
      });
      void queryClient.invalidateQueries({ queryKey: keys.optimizerResults(storeId) });
      void queryClient.invalidateQueries({ queryKey: keys.topPerformers(storeId) });
      void queryClient.invalidateQueries({ queryKey: ['optimizer', 'grid'] });
    },
    onError: (error: Error) =>
      push({ kind: 'error', title: 'Optimization failed', message: error.message }),
  });

  const performerColumns: Column<TopPerformer>[] = [
    {
      key: 'product',
      header: 'Product',
      cell: (row) => <StackedCell primary={row.product_name} secondary={row.sku_id} mono />,
    },
    {
      key: 'tier',
      header: 'Tier',
      align: 'center',
      cell: (row) => <Badge variant={tierTone[row.tier]}>{row.tier}</Badge>,
    },
    {
      key: 'score',
      header: 'Composite score',
      align: 'center',
      cell: (row) => (
        <span className="flex items-center justify-center gap-2">
          <ProgressBar value={row.score * 100} variant={tierTone[row.tier]} className="w-14" />
          <span className="tnum text-xs font-bold text-content">{row.score.toFixed(3)}</span>
        </span>
      ),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      align: 'right',
      cell: (row) => (
        <span className="tnum text-sm font-semibold text-content">{moneyCompact(row.revenue)}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Space optimization"
        title="Shelf Optimizer"
        description="Ranks SKUs on sales velocity, profit and shopper engagement, then places the winners at eye level."
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              icon={<Download className="size-4" />}
              onClick={() =>
                window.open(downloadUrl('/api/optimizer/download-planogram', { store_id: storeId }), '_blank')
              }
            >
              Export planogram
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Play className="size-4" />}
              loading={run.isPending}
              onClick={() => run.mutate()}
            >
              Run optimization
            </Button>
          </>
        }
      />

      <AsyncBoundary
        query={results}
        skeleton={
          <KpiGrid>
            {Array.from({ length: 4 }, (_, index) => (
              <KpiSkeleton key={index} />
            ))}
          </KpiGrid>
        }
      >
        {(data) =>
          !data.available ? (
            <Card>
              <CardBody>
                <EmptyState
                  icon={<Sparkles className="size-5" />}
                  title="No optimization results yet"
                  description="This needs a planogram and POS history. Seed the database with `py database/seed_data.py`, then run the optimizer."
                  action={
                    <Button variant="primary" size="md" loading={run.isPending} onClick={() => run.mutate()}>
                      Run optimization now
                    </Button>
                  }
                />
              </CardBody>
            </Card>
          ) : (
            <>
              <KpiGrid>
                <KpiCard
                  label="Projected revenue lift"
                  value={data.kpis.lift_pct.toFixed(1)}
                  unit="%"
                  icon={<ArrowUpRight className="size-5" />}
                  variant="success"
                  hint={`${moneyCompact(data.kpis.lift_value)} over the flat-visibility baseline`}
                />
                <KpiCard
                  label="Slots allocated"
                  value={num(data.kpis.filled)}
                  unit={`of ${num(data.kpis.total_slots)}`}
                  icon={<Grid3x3 className="size-5" />}
                  variant="primary"
                  hint={`${Math.round((data.kpis.filled / Math.max(data.kpis.total_slots, 1)) * 100)}% shelf utilisation`}
                />
                <KpiCard
                  label="Premium SKUs at eye level"
                  value={data.kpis.premium_eye}
                  unit={`of ${data.kpis.premium_count}`}
                  icon={<Eye className="size-5" />}
                  variant={data.kpis.eye_pct >= 70 ? 'success' : 'warn'}
                  hint={`${data.kpis.eye_pct}% of top-tier products in the golden zone`}
                />
                <KpiCard
                  label="Optimized revenue"
                  value={moneyCompact(data.kpis.optimized_rev)}
                  icon={<Wallet className="size-5" />}
                  variant="violet"
                  hint={`Baseline ${moneyCompact(data.kpis.baseline_rev)}`}
                />
              </KpiGrid>

              <div className="grid gap-6 xl:grid-cols-5">
                <Card className="xl:col-span-2">
                  <CardHeader title="SKU tier mix" subtitle="Composite score percentiles" />
                  <CardBody className="space-y-4">
                    {(
                      [
                        { label: 'Premium', hint: 'Top 20% — eye level, 120–150 cm', value: data.tiers.premium, variant: 'primary' as const },
                        { label: 'Standard', hint: 'Mid 30% — reach zone, 90–120 cm', value: data.tiers.standard, variant: 'warn' as const },
                        { label: 'Economy', hint: 'Bottom 50% — bulk and lower shelves', value: data.tiers.economy, variant: 'neutral' as const },
                      ]
                    ).map((tier) => (
                      <div key={tier.label}>
                        <div className="mb-1.5 flex items-baseline justify-between">
                          <span className="text-xs font-semibold text-content">{tier.label}</span>
                          <span className={cn('tnum text-xs font-bold', tone[tier.variant].text)}>
                            {tier.value} SKUs
                          </span>
                        </div>
                        <ProgressBar
                          value={tier.value}
                          max={Math.max(data.tiers.total, 1)}
                          variant={tier.variant}
                          height="md"
                        />
                        <p className="mt-1 text-2xs text-content-faint">{tier.hint}</p>
                      </div>
                    ))}
                  </CardBody>
                  <CardFooter>
                    <p className="tnum text-2xs text-content-faint">
                      {data.tiers.total} SKUs scored on velocity (40%), profit (35%) and engagement (25%).
                    </p>
                  </CardFooter>
                </Card>

                <Card className="xl:col-span-3">
                  <CardHeader
                    title="Optimized planogram"
                    subtitle="Eye-level shelves highlighted"
                    icon={<LayoutList className="size-4" />}
                    action={
                      grid.data && grid.data.aisle_names.length > 0 ? (
                        <Select
                          label="Aisle"
                          value={String(aisleIdx)}
                          onChange={(value) => setAisleIdx(Number(value))}
                          options={grid.data.aisle_names.map((aisle, index) => ({
                            value: String(index),
                            label: aisle.name,
                          }))}
                        />
                      ) : null
                    }
                  />
                  <CardBody>
                    <AsyncBoundary
                      query={grid}
                      skeleton={
                        <div className="space-y-3">
                          {Array.from({ length: 4 }, (_, index) => (
                            <Skeleton key={index} className="h-20 rounded-xl" />
                          ))}
                        </div>
                      }
                      isEmpty={(gridData) => gridData.shelves.length === 0}
                      empty={<EmptyState title="No planogram for this aisle" />}
                    >
                      {(gridData) => (
                        <div className="space-y-2.5">
                          {gridData.shelves.map((shelf) => (
                            <div
                              key={shelf.shelf_number}
                              className={cn(
                                'rounded-xl border p-3',
                                shelf.is_eye_level
                                  ? 'border-primary/40 bg-primary/5'
                                  : 'border-line bg-surface-mid/40',
                              )}
                            >
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <span className="flex items-center gap-2">
                                  <span className="font-mono text-2xs font-bold text-content-muted">
                                    SHELF {shelf.shelf_number}
                                  </span>
                                  {shelf.is_eye_level ? (
                                    <Badge variant="primary" dot>
                                      Golden zone
                                    </Badge>
                                  ) : null}
                                </span>
                                <span className="tnum text-2xs text-content-faint">
                                  {shelf.sections.filter((s) => s.sku_id !== 'EMPTY').length}/
                                  {shelf.sections.length} filled
                                </span>
                              </div>
                              <div
                                className="grid gap-1.5"
                                style={{
                                  gridTemplateColumns: `repeat(${Math.min(shelf.sections.length, 6)}, minmax(0, 1fr))`,
                                }}
                              >
                                {shelf.sections.map((section, index) => {
                                  const empty = section.sku_id === 'EMPTY';
                                  return (
                                    <div
                                      key={index}
                                      title={empty ? 'Empty slot' : `${section.sku_id} — ${section.product_name}`}
                                      className={cn(
                                        'rounded-lg border p-2',
                                        empty
                                          ? 'border-dashed border-line'
                                          : shelf.is_eye_level
                                            ? 'border-primary/30 bg-primary/10'
                                            : 'border-line bg-surface-high/60',
                                      )}
                                    >
                                      {empty ? (
                                        <p className="text-center text-[0.6rem] text-content-faint">—</p>
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
                          ))}
                        </div>
                      )}
                    </AsyncBoundary>
                  </CardBody>
                </Card>
              </div>
            </>
          )
        }
      </AsyncBoundary>

      <Card>
        <CardHeader
          title="Top performing SKUs"
          subtitle="Ranked by composite score"
          icon={<Trophy className="size-4" />}
        />
        <AsyncBoundary
          query={performers}
          skeleton={
            <div className="space-y-2 p-5">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-12" />
              ))}
            </div>
          }
          isEmpty={(data) => data.length === 0}
          empty={
            <EmptyState
              title="No SKU metrics available"
              description="POS transaction history is required. Run `py database/seed_data.py` to populate it."
            />
          }
        >
          {(data) => (
            <DataTable columns={performerColumns} rows={data} rowKey={(row) => row.sku_id} />
          )}
        </AsyncBoundary>
      </Card>
    </>
  );
}
