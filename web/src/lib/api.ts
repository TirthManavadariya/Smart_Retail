import type {
  AisleDetail,
  AlertInbox,
  AnalyticsKpis,
  AssociatesPayload,
  CategoryPerformance,
  CompliancePayload,
  DetectionResult,
  FloorPlan,
  ForecastAccuracy,
  ForecastChart,
  ForecastQuery,
  OptimizerResults,
  OverviewAlert,
  OverviewKpis,
  PlanogramGrid,
  ReplenishmentRow,
  SeriesXY,
  ShelfStatusRow,
  StockoutHeatmap,
  Store,
  TaskBoard,
  TopPerformer,
  TrafficPayload,
} from './types';

/**
 * Same-origin by default: in production Flask serves this bundle, and in dev
 * Vite proxies /api to :5000 (see vite.config.ts). Override with VITE_API_BASE
 * only if you host the API elsewhere.
 */
const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Params = Record<string, string | number | boolean | undefined>;

function buildUrl(path: string, params?: Params): string {
  const url = new URL(BASE + path, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';

  // Flask's SPA catch-all returns index.html (HTML, status 200) for any
  // unmatched path — including a mistyped /api route. Detect that explicitly
  // so it surfaces as a clear error rather than a JSON parse failure.
  if (!contentType.includes('application/json')) {
    if (res.ok) {
      throw new ApiError(
        'Endpoint not found on the API server',
        404,
        'The server returned HTML instead of JSON, which means this route fell through to the SPA catch-all.',
      );
    }
    throw new ApiError(`Request failed (${res.status})`, res.status);
  }

  const body: unknown = await res.json();

  if (!res.ok) {
    const record = (body ?? {}) as Record<string, unknown>;
    const message =
      typeof record.error === 'string'
        ? record.error
        : typeof record.message === 'string'
          ? record.message
          : `Request failed (${res.status})`;
    throw new ApiError(
      message,
      res.status,
      typeof record.traceback === 'string' ? record.traceback : undefined,
    );
  }

  return body as T;
}

async function get<T>(path: string, params?: Params, timeoutMs = 20_000): Promise<T> {
  try {
    const res = await fetch(buildUrl(path, params), {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: 'application/json' },
    });
    return await parse<T>(res);
  } catch (err) {
    throw normalize(err);
  }
}

async function post<T>(path: string, body?: unknown, params?: Params, timeoutMs = 120_000): Promise<T> {
  try {
    const res = await fetch(buildUrl(path, params), {
      method: 'POST',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      // The API's POST handlers call request.get_json(), which 415s without a body.
      body: JSON.stringify(body ?? {}),
    });
    return await parse<T>(res);
  } catch (err) {
    throw normalize(err);
  }
}

function normalize(err: unknown): Error {
  if (err instanceof ApiError) return err;
  if (err instanceof DOMException && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
    return new ApiError('The API server took too long to respond', 504);
  }
  if (err instanceof TypeError) {
    return new ApiError(
      'Cannot reach the API server',
      0,
      'Start the backend with `py backend/app.py` — it should be listening on port 5000.',
    );
  }
  return err instanceof Error ? err : new Error(String(err));
}

/** Absolute URL for links the browser downloads directly (PDF, CSV, JSON). */
export function downloadUrl(path: string, params?: Params): string {
  return buildUrl(path, params);
}

export const api = {
  stores: () => get<Store[]>('/api/stores'),

  overview: {
    kpis: (storeId: string) => get<OverviewKpis>('/api/overview/kpis', { store_id: storeId }),
    floorPlan: (storeId: string) => get<FloorPlan>('/api/overview/floor-plan', { store_id: storeId }),
    alerts: (storeId: string) => get<OverviewAlert[]>('/api/overview/alerts', { store_id: storeId }),
    oosTrends: () => get<SeriesXY>('/api/overview/oos-trends'),
    compliance: () => get<CompliancePayload>('/api/overview/compliance'),
  },

  monitoring: {
    shelfStatus: (storeId: string) =>
      get<ShelfStatusRow[]>('/api/monitoring/shelf-status', { store_id: storeId }),
    aisleDetail: () => get<AisleDetail>('/api/monitoring/aisle-detail'),
    planogram: (storeId: string) =>
      get<{ name: string; pct: number }[]>('/api/monitoring/planogram', { store_id: storeId }),
    traffic: (storeId: string) => get<TrafficPayload>('/api/monitoring/traffic', { store_id: storeId }),
  },

  /** YOLO inference. Slow on the first call (model load), so the timeout is generous. */
  detect: async (file: File): Promise<DetectionResult> => {
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch(buildUrl('/api/detect'), {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(180_000),
      });
      return await parse<DetectionResult>(res);
    } catch (err) {
      throw normalize(err);
    }
  },

  forecast: {
    accuracy: (storeId: string) =>
      get<ForecastAccuracy>('/api/forecast/accuracy', { store_id: storeId }),
    chart: (storeId: string, q: ForecastQuery) =>
      get<ForecastChart>('/api/forecast/chart', {
        store_id: storeId,
        safety: q.safety,
        horizon: q.horizon,
        freq: q.freq,
        // The backend compares these against the literal string "true".
        weather: q.weather ? 'true' : 'false',
        holiday: q.holiday ? 'true' : 'false',
        competitor: q.competitor ? 'true' : 'false',
      }),
    replenishment: () => get<ReplenishmentRow[]>('/api/forecast/replenishment'),
  },

  alerts: {
    inbox: (storeId: string) => get<AlertInbox>('/api/alerts/inbox', { store_id: storeId }),
    tasks: () => get<TaskBoard>('/api/alerts/tasks'),
    associates: () => get<AssociatesPayload>('/api/alerts/associates'),
    assign: (alertId: number) =>
      post<{ status: string; assignee: string }>('/api/alerts/assign', { alert_id: alertId }),
    createTask: (task: {
      title: string;
      desc?: string;
      assignee?: string;
      urgency?: string;
      location?: string;
    }) => post<{ status: string; task: ManualTaskResponse }>('/api/alerts/tasks', task),
  },

  optimizer: {
    results: (storeId: string) =>
      get<OptimizerResults>('/api/optimizer/results', { store_id: storeId }, 60_000),
    topPerformers: (storeId: string) =>
      get<TopPerformer[]>('/api/optimizer/top-performers', { store_id: storeId }, 60_000),
    grid: (storeId: string, aisleIdx: number) =>
      get<PlanogramGrid>('/api/optimizer/planogram-grid', {
        store_id: storeId,
        aisle_idx: aisleIdx,
      }),
    // store_id goes in the query string here, not the body — that's what the route reads.
    run: (storeId: string) =>
      post<{ status: string; message?: string }>('/api/optimizer/run', {}, { store_id: storeId }, 300_000),
  },

  analytics: {
    kpis: (storeId: string) => get<AnalyticsKpis>('/api/analytics/kpis', { store_id: storeId }),
    revenueTrend: (storeId: string) =>
      get<SeriesXY>('/api/analytics/revenue-trend', { store_id: storeId }),
    categoryPerformance: (storeId: string) =>
      get<CategoryPerformance>('/api/analytics/category-performance', { store_id: storeId }),
    stockoutHeatmap: (storeId: string) =>
      get<StockoutHeatmap>('/api/analytics/stockout-heatmap', { store_id: storeId }),
  },

  settings: {
    save: (settings: Record<string, unknown>) =>
      post<{ status: string; settings: Record<string, unknown> }>('/api/settings/save', settings),
  },
};

interface ManualTaskResponse {
  title: string;
  desc: string;
  assignee: string;
  urgency: string;
  location: string;
  created: string;
}
