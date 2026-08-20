import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ForecastQuery } from '@/lib/types';

/**
 * Query keys are namespaced by store so switching stores swaps cached data
 * instantly instead of re-rendering the whole page from scratch (the vanilla
 * app re-navigated the router to propagate a store change).
 */
export const keys = {
  overviewKpis: (s: string) => ['overview', 'kpis', s] as const,
  floorPlan: (s: string) => ['overview', 'floor-plan', s] as const,
  overviewAlerts: (s: string) => ['overview', 'alerts', s] as const,
  oosTrends: () => ['overview', 'oos-trends'] as const,
  compliance: () => ['overview', 'compliance'] as const,
  shelfStatus: (s: string) => ['monitoring', 'shelf-status', s] as const,
  aisleDetail: () => ['monitoring', 'aisle-detail'] as const,
  planogram: (s: string) => ['monitoring', 'planogram', s] as const,
  traffic: (s: string) => ['monitoring', 'traffic', s] as const,
  forecastAccuracy: (s: string) => ['forecast', 'accuracy', s] as const,
  forecastChart: (s: string, q: ForecastQuery) => ['forecast', 'chart', s, q] as const,
  replenishment: () => ['forecast', 'replenishment'] as const,
  alertInbox: (s: string) => ['alerts', 'inbox', s] as const,
  tasks: () => ['alerts', 'tasks'] as const,
  associates: () => ['alerts', 'associates'] as const,
  optimizerResults: (s: string) => ['optimizer', 'results', s] as const,
  topPerformers: (s: string) => ['optimizer', 'top-performers', s] as const,
  planogramGrid: (s: string, a: number) => ['optimizer', 'grid', s, a] as const,
  analyticsKpis: (s: string) => ['analytics', 'kpis', s] as const,
  revenueTrend: (s: string) => ['analytics', 'revenue-trend', s] as const,
  categoryPerformance: (s: string) => ['analytics', 'category', s] as const,
  stockoutHeatmap: (s: string) => ['analytics', 'heatmap', s] as const,
};

/** Live operational data refreshes on an interval; reference data does not. */
const LIVE_REFETCH_MS = 30_000;

// ── Overview ──────────────────────────────────────────────────────────
export const useOverviewKpis = (storeId: string) =>
  useQuery({
    queryKey: keys.overviewKpis(storeId),
    queryFn: () => api.overview.kpis(storeId),
    refetchInterval: LIVE_REFETCH_MS,
  });

export const useFloorPlan = (storeId: string) =>
  useQuery({
    queryKey: keys.floorPlan(storeId),
    queryFn: () => api.overview.floorPlan(storeId),
    refetchInterval: LIVE_REFETCH_MS,
  });

export const useOverviewAlerts = (storeId: string) =>
  useQuery({
    queryKey: keys.overviewAlerts(storeId),
    queryFn: () => api.overview.alerts(storeId),
    refetchInterval: LIVE_REFETCH_MS,
  });

export const useOosTrends = () =>
  useQuery({ queryKey: keys.oosTrends(), queryFn: api.overview.oosTrends });

export const useCompliance = () =>
  useQuery({ queryKey: keys.compliance(), queryFn: api.overview.compliance });

// ── Monitoring ────────────────────────────────────────────────────────
export const useShelfStatus = (storeId: string) =>
  useQuery({
    queryKey: keys.shelfStatus(storeId),
    queryFn: () => api.monitoring.shelfStatus(storeId),
    refetchInterval: LIVE_REFETCH_MS,
  });

export const useAisleDetail = () =>
  useQuery({
    queryKey: keys.aisleDetail(),
    queryFn: api.monitoring.aisleDetail,
    refetchInterval: LIVE_REFETCH_MS,
  });

export const usePlanogramCompliance = (storeId: string) =>
  useQuery({ queryKey: keys.planogram(storeId), queryFn: () => api.monitoring.planogram(storeId) });

export const useTraffic = (storeId: string) =>
  useQuery({ queryKey: keys.traffic(storeId), queryFn: () => api.monitoring.traffic(storeId) });

// ── Forecast ──────────────────────────────────────────────────────────
export const useForecastAccuracy = (storeId: string) =>
  useQuery({ queryKey: keys.forecastAccuracy(storeId), queryFn: () => api.forecast.accuracy(storeId) });

export const useForecastChart = (storeId: string, query: ForecastQuery) =>
  useQuery({
    queryKey: keys.forecastChart(storeId, query),
    queryFn: () => api.forecast.chart(storeId, query),
    placeholderData: (previous) => previous, // keep the old curve while re-simulating
  });

export const useReplenishment = () =>
  useQuery({ queryKey: keys.replenishment(), queryFn: api.forecast.replenishment });

// ── Alerts ────────────────────────────────────────────────────────────
export const useAlertInbox = (storeId: string) =>
  useQuery({
    queryKey: keys.alertInbox(storeId),
    queryFn: () => api.alerts.inbox(storeId),
    refetchInterval: LIVE_REFETCH_MS,
  });

export const useTaskBoard = () =>
  useQuery({ queryKey: keys.tasks(), queryFn: api.alerts.tasks, refetchInterval: LIVE_REFETCH_MS });

export const useAssociates = () =>
  useQuery({ queryKey: keys.associates(), queryFn: api.alerts.associates });

// ── Optimizer ─────────────────────────────────────────────────────────
export const useOptimizerResults = (storeId: string) =>
  useQuery({ queryKey: keys.optimizerResults(storeId), queryFn: () => api.optimizer.results(storeId) });

export const useTopPerformers = (storeId: string) =>
  useQuery({ queryKey: keys.topPerformers(storeId), queryFn: () => api.optimizer.topPerformers(storeId) });

export const usePlanogramGrid = (storeId: string, aisleIdx: number) =>
  useQuery({
    queryKey: keys.planogramGrid(storeId, aisleIdx),
    queryFn: () => api.optimizer.grid(storeId, aisleIdx),
    retry: false, // 404 when the optimizer hasn't produced a planogram yet
  });

// ── Analytics ─────────────────────────────────────────────────────────
export const useAnalyticsKpis = (storeId: string) =>
  useQuery({ queryKey: keys.analyticsKpis(storeId), queryFn: () => api.analytics.kpis(storeId) });

export const useRevenueTrend = (storeId: string) =>
  useQuery({ queryKey: keys.revenueTrend(storeId), queryFn: () => api.analytics.revenueTrend(storeId) });

export const useCategoryPerformance = (storeId: string) =>
  useQuery({
    queryKey: keys.categoryPerformance(storeId),
    queryFn: () => api.analytics.categoryPerformance(storeId),
  });

export const useStockoutHeatmap = (storeId: string) =>
  useQuery({
    queryKey: keys.stockoutHeatmap(storeId),
    queryFn: () => api.analytics.stockoutHeatmap(storeId),
  });
