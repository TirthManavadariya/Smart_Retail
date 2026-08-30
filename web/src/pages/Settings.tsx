import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  BarChart3,
  Cpu,
  Monitor,
  MoonStar,
  PieChart,
  RotateCcw,
  Save,
  ShieldAlert,
  Sun,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { BarSeries } from '@/components/charts/BarSeries';
import { DonutBreakdown } from '@/components/charts/DonutBreakdown';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card';
import { Slider, Switch } from '@/components/ui/Controls';
import { KpiCard, KpiGrid } from '@/components/ui/KpiCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { AsyncBoundary, ChartSkeleton, KpiSkeleton } from '@/components/ui/States';
import { useAnalyticsKpis, useCategoryPerformance, useRevenueTrend } from '@/hooks/queries';
import { useActiveStore } from '@/hooks/useActiveStore';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { moneyCompact } from '@/lib/format';

const DEFAULTS = {
  confidence: 85,
  fps: 30,
  ocr: true,
  autoDispatch: true,
  lossCalc: true,
  heatmap: true,
};

export default function SettingsPage() {
  const { storeId, activeStore } = useActiveStore();
  const { theme, setTheme } = useTheme();
  const { push } = useToast();

  const kpis = useAnalyticsKpis(storeId);
  const revenue = useRevenueTrend(storeId);
  const categories = useCategoryPerformance(storeId);

  const [config, setConfig] = useState(DEFAULTS);

  const save = useMutation({
    mutationFn: () => api.settings.save({ store_id: storeId, ...config }),
    onSuccess: () =>
      push({
        kind: 'success',
        title: 'Settings saved',
        message: 'The pipeline configuration was accepted by the API.',
      }),
    onError: (error: Error) => push({ kind: 'error', title: 'Save failed', message: error.message }),
  });

  const patch = (next: Partial<typeof DEFAULTS>) => setConfig((current) => ({ ...current, ...next }));

  return (
    <>
      <PageHeader
        eyebrow="Analytics & configuration"
        title="Analytics & Settings"
        description="Business outcomes from the vision pipeline, plus the knobs that drive it."
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              icon={<RotateCcw className="size-4" />}
              onClick={() => {
                setConfig(DEFAULTS);
                push({ kind: 'info', title: 'Reset', message: 'Configuration restored to defaults.' });
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Save className="size-4" />}
              loading={save.isPending}
              onClick={() => save.mutate()}
            >
              Save settings
            </Button>
          </>
        }
      />

      <AsyncBoundary
        query={kpis}
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
              label="Revenue protected"
              value={data.revenue_protected}
              icon={<Wallet className="size-5" />}
              variant="success"
              tag={data.revenue_delta}
              hint="Year to date, from acting on shelf alerts"
            />
            <KpiCard
              label="Compliance index"
              value={data.compliance_score}
              unit="%"
              icon={<TrendingUp className="size-5" />}
              variant={data.compliance_score >= 90 ? 'primary' : 'warn'}
              hint="Store-wide planogram accuracy"
            />
            <KpiCard
              label="Stockout events"
              value={data.stockout_events}
              icon={<ShieldAlert className="size-5" />}
              variant="danger"
              tag={data.stockout_delta}
              hint="Distinct empty-shelf incidents this period"
            />
          </KpiGrid>
        )}
      </AsyncBoundary>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Protected revenue trend"
            subtitle="Monthly, current year"
            icon={<BarChart3 className="size-4" />}
          />
          <CardBody>
            <AsyncBoundary query={revenue} skeleton={<ChartSkeleton height={240} />}>
              {(data) => (
                <BarSeries
                  data={data.labels.map((label, index) => ({ label, value: data.values[index] ?? 0 }))}
                  name="Protected revenue"
                  valueFormatter={(value) => moneyCompact(value * 1000)}
                />
              )}
            </AsyncBoundary>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Revenue by department"
            subtitle="Share of protected revenue"
            icon={<PieChart className="size-4" />}
          />
          <CardBody>
            <AsyncBoundary query={categories} skeleton={<ChartSkeleton height={220} />}>
              {(data) => (
                <DonutBreakdown
                  data={data.labels.map((label, index) => ({
                    label,
                    value: data.values[index] ?? 0,
                    color: data.colors[index],
                  }))}
                  centerLabel="Total"
                />
              )}
            </AsyncBoundary>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Vision pipeline parameters"
            subtitle="Applied at the edge inference node"
            icon={<Cpu className="size-4" />}
          />
          <CardBody className="space-y-6">
            <Slider
              label="Detection confidence threshold"
              value={config.confidence}
              min={50}
              max={98}
              onChange={(confidence) => patch({ confidence })}
              format={(value) => `${value}%`}
              hint="Higher values cut false positives but may miss partially occluded facings."
            />
            <Slider
              label="Capture frame rate"
              value={config.fps}
              min={10}
              max={60}
              onChange={(fps) => patch({ fps })}
              format={(value) => `${value} fps`}
              hint="Trades detection latency against GPU load."
            />

            <div className="space-y-1 border-t border-line/60 pt-3">
              <Switch
                label="Price tag OCR"
                description="Reads shelf labels to flag price mismatches."
                checked={config.ocr}
                onChange={(ocr) => patch({ ocr })}
              />
              <Switch
                label="Automated associate dispatch"
                description="Pushes corrective tasks straight to handhelds."
                checked={config.autoDispatch}
                onChange={(autoDispatch) => patch({ autoDispatch })}
              />
              <Switch
                label="Revenue loss calculation"
                description="Estimates lost sales per stockout in real time."
                checked={config.lossCalc}
                onChange={(lossCalc) => patch({ lossCalc })}
              />
              <Switch
                label="Footfall heatmapping"
                description="Aggregates shopper density by zone and hour."
                checked={config.heatmap}
                onChange={(heatmap) => patch({ heatmap })}
              />
            </div>
          </CardBody>
          <CardFooter>
            <p className="text-2xs text-content-faint">
              The API currently echoes these values back without persisting them — wire
              <code className="mx-1 font-mono text-primary">/api/settings/save</code>
              to storage to make them stick.
            </p>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Appearance"
              subtitle="Theme preference is stored on this device"
              icon={<Monitor className="size-4" />}
            />
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { id: 'light' as Theme, label: 'Light', icon: Sun, hint: 'Default — clean, bright shop-floor view' },
                    { id: 'dark' as Theme, label: 'Dark', icon: MoonStar, hint: 'For dim store back-office displays' },
                  ]
                ).map((option) => {
                  const Icon = option.icon;
                  const active = theme === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={cn(
                        'rounded-xl border p-4 text-left transition-all duration-150',
                        active
                          ? 'border-primary/50 bg-primary/10 ring-1 ring-primary/30'
                          : 'border-line bg-surface-mid/40 hover:bg-surface-high/60',
                      )}
                    >
                      <Icon className={cn('mb-2 size-5', active ? 'text-primary' : 'text-content-muted')} />
                      <p className="text-sm font-bold text-content">{option.label}</p>
                      <p className="mt-0.5 text-2xs leading-snug text-content-faint">{option.hint}</p>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Deployment" subtitle="Current environment" />
            <CardBody>
              <dl className="space-y-3 text-xs">
                {[
                  ['Active store', activeStore?.name ?? storeId],
                  ['Monitored aisles', activeStore ? String(activeStore.aisles) : '—'],
                  [
                    'Shelf sections',
                    activeStore
                      ? String(
                          activeStore.aisles *
                            activeStore.shelves_per_aisle *
                            activeStore.sections_per_shelf,
                        )
                      : '—',
                  ],
                  ['Detector', 'YOLOv8 (Ultralytics)'],
                  ['Forecaster', 'Prophet'],
                  ['SKU recognition', 'CLIP ViT-B/32'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-4 border-b border-line/40 pb-2 last:border-0">
                    <dt className="text-content-muted">{label}</dt>
                    <dd className="text-right font-semibold text-content">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
