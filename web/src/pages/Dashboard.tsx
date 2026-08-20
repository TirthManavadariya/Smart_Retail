import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Download,
  Flame,
  PackageX,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { Heatmap } from '@/components/charts/Heatmap';
import { TrendArea } from '@/components/charts/TrendArea';
import { AlertItem } from '@/components/domain/AlertItem';
import { FloorPlan, FloorPlanLegend } from '@/components/domain/FloorPlan';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card';
import { KpiCard, KpiGrid } from '@/components/ui/KpiCard';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { ComplianceBars } from '@/components/ui/Progress';
import { AsyncBoundary, ChartSkeleton, EmptyState, KpiSkeleton, Skeleton } from '@/components/ui/States';
import {
  useCompliance,
  useFloorPlan,
  useOosTrends,
  useOverviewAlerts,
  useOverviewKpis,
  useStockoutHeatmap,
} from '@/hooks/queries';
import { useActiveStore } from '@/hooks/useActiveStore';
import { downloadUrl } from '@/lib/api';
import { num } from '@/lib/format';
import { shelfStatus } from '@/lib/status';
import type { FloorSection } from '@/lib/types';

export default function DashboardPage() {
  const { storeId, activeStore } = useActiveStore();
  const navigate = useNavigate();

  const kpis = useOverviewKpis(storeId);
  const floorPlan = useFloorPlan(storeId);
  const alerts = useOverviewAlerts(storeId);
  const trends = useOosTrends();
  const compliance = useCompliance();
  const heatmap = useStockoutHeatmap(storeId);

  const [selected, setSelected] = useState<FloorSection | null>(null);

  return (
    <>
      <PageHeader
        eyebrow="Operations intelligence"
        title="Store Health Dashboard"
        description={
          activeStore
            ? `${activeStore.name} — ${activeStore.aisles} aisles, ${activeStore.aisles * activeStore.shelves_per_aisle * activeStore.sections_per_shelf} monitored shelf sections.`
            : 'Live shelf health, stockout exposure and planogram compliance.'
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              icon={<Download className="size-4" />}
              onClick={() => window.open(downloadUrl('/api/reports/pdf', { store_id: storeId }), '_blank')}
            >
              Export report
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Activity className="size-4" />}
              onClick={() => navigate('/monitoring')}
            >
              Open live monitor
            </Button>
          </>
        }
      />

      {/* ── Headline KPIs ────────────────────────────────────────────── */}
      <AsyncBoundary
        query={kpis}
        skeleton={
          <KpiGrid>
            {Array.from({ length: 4 }, (_, index) => (
              <KpiSkeleton key={index} />
            ))}
          </KpiGrid>
        }
      >
        {(data) => (
          <KpiGrid>
              <KpiCard
                label="Shelf health score"
                value={data.shelf_health.toFixed(1)}
                unit="%"
                icon={<ShieldCheck className="size-5" />}
                variant="primary"
                delta={{ value: data.shelf_delta }}
                hint="Weighted fill rate across all monitored sections"
              />
              <KpiCard
                label="Out of stock now"
                value={data.oos_units}
                unit="units"
                icon={<PackageX className="size-5" />}
                variant={data.oos_units > 15 ? 'danger' : 'warn'}
                tag={data.oos_units > 15 ? 'High alert' : 'Monitoring'}
                hint="Sections detected empty in the latest CV pass"
              />
              <KpiCard
                label="Revenue recovered"
                value={`₹${data.revenue_recovered}`}
                icon={<Wallet className="size-5" />}
                variant="success"
                tag="Estimated"
                hint="Sales protected by acting on alerts this period"
              />
            <KpiCard
              label="Forecast accuracy"
              value={data.forecast_accuracy.toFixed(1)}
              unit="%"
              icon={<BadgeCheck className="size-5" />}
              variant="violet"
              tag="Prophet"
              hint="100 − WMAPE on the trailing validation window"
            />
          </KpiGrid>
        )}
      </AsyncBoundary>

      {/* ── Floor plan + critical alerts ─────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Store floor plan"
            subtitle="Live shelf status by aisle and section — select a bay for detail"
            action={
              floorPlan.data ? (
                <Badge variant="primary" dot>
                  {floorPlan.data.sections.length} bays
                </Badge>
              ) : null
            }
          />
          <CardBody>
            <AsyncBoundary
              query={floorPlan}
              skeleton={
                <div className="space-y-2.5">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="h-16 rounded-lg" />
                  ))}
                </div>
              }
              isEmpty={(data) => data.sections.length === 0}
              empty={<EmptyState title="No shelf data" description="Seed the database and run a CV pass." />}
            >
              {(data) => (
                <FloorPlan
                  sections={data.sections}
                  onSelect={setSelected}
                  selectedLabel={selected?.label}
                />
              )}
            </AsyncBoundary>
          </CardBody>
          {floorPlan.data ? (
            <CardFooter>
              <FloorPlanLegend summary={floorPlan.data.summary} />
            </CardFooter>
          ) : null}
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="Critical alerts"
            subtitle="Ranked by revenue impact"
            icon={<Flame className="size-4" />}
          />
          <CardBody className="flex-1 space-y-3 overflow-y-auto p-4" >
            <AsyncBoundary
              query={alerts}
              skeleton={
                <div className="space-y-3">
                  {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-28 rounded-xl" />
                  ))}
                </div>
              }
              isEmpty={(data) => data.length === 0}
              empty={
                <EmptyState
                  icon={<BadgeCheck className="size-5" />}
                  title="All clear"
                  description="No critical shelf incidents in this store right now."
                />
              }
            >
              {(data) =>
                data.map((alert, index) => (
                  <AlertItem
                    key={`${alert.message}-${index}`}
                    severity={alert.severity}
                    title={alert.message}
                    // The live path sends sku/aisle/shelf; the fallback sends `detail`.
                    detail={
                      alert.detail ??
                      [alert.sku_id, alert.aisle_id, alert.shelf_id].filter(Boolean).join(' • ')
                    }
                    timeAgo={alert.time_ago}
                    impact={alert.revenue_impact}
                    badgeLabel={alert.badge}
                    metricLabel={alert.metric_label}
                  />
                ))
              }
            </AsyncBoundary>
          </CardBody>
          <CardFooter className="p-0">
            <Link
              to="/alerts"
              className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-primary transition-colors hover:bg-primary/5"
            >
              View all alerts &amp; tasks
              <ArrowUpRight className="size-3.5" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* ── Trend + compliance ───────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Out-of-stock trend"
            subtitle="Empty shelf sections per hour, last 24 hours"
          />
          <CardBody>
            <AsyncBoundary query={trends} skeleton={<ChartSkeleton height={240} />}>
              {(data) => (
                <TrendArea
                  data={data.labels.map((label, index) => ({ label, value: data.values[index] ?? 0 }))}
                  name="OOS sections"
                  valueFormatter={(value) => `${num(value)} sections`}
                />
              )}
            </AsyncBoundary>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Planogram compliance"
            subtitle="Shelf accuracy by aisle"
            action={
              compliance.data ? (
                <Badge variant="primary">Avg {compliance.data.average}%</Badge>
              ) : null
            }
          />
          <CardBody>
            <AsyncBoundary
              query={compliance}
              skeleton={
                <div className="space-y-4">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="h-8" />
                  ))}
                </div>
              }
            >
              {(data) => <ComplianceBars items={data.aisles} />}
            </AsyncBoundary>
          </CardBody>
        </Card>
      </div>

      {/* ── Stockout heatmap ─────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Stockout density"
          subtitle="Where and when shelves run empty — aisle against hour of day"
        />
        <CardBody>
          <AsyncBoundary query={heatmap} skeleton={<ChartSkeleton height={220} />}>
            {(data) => (
              <Heatmap
                rows={data.aisles}
                columns={data.hours}
                matrix={data.matrix}
                valueLabel="stockouts"
                accent="danger"
              />
            )}
          </AsyncBoundary>
        </CardBody>
      </Card>

      {/* ── Bay detail ───────────────────────────────────────────────── */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Bay ${selected.label}` : ''}
        subtitle={selected ? shelfStatus[selected.status].label : undefined}
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button variant="primary" size="md" onClick={() => navigate('/monitoring')}>
              Inspect in live monitor
            </Button>
          </>
        }
      >
        {selected ? (
          <dl className="grid grid-cols-2 gap-4">
            <Detail label="Assigned product" value={selected.name} span />
            <Detail label="SKU" value={selected.sku || '—'} mono />
            <Detail label="Fill level" value={selected.fill} />
            <Detail label="Aisle" value={`A${String(selected.aisle_idx + 1).padStart(2, '0')}`} />
            <Detail label="Section" value={String(selected.section + 1)} />
            <div className="col-span-2">
              <Badge variant={shelfStatus[selected.status].tone} dot size="md">
                {shelfStatus[selected.status].label}
              </Badge>
            </div>
          </dl>
        ) : null}
      </Modal>
    </>
  );
}

function Detail({
  label,
  value,
  mono = false,
  span = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  span?: boolean;
}) {
  return (
    <div className={span ? 'col-span-2' : undefined}>
      <dt className="text-2xs font-bold uppercase tracking-wider text-content-faint">{label}</dt>
      <dd className={`mt-0.5 text-sm font-semibold text-content ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
