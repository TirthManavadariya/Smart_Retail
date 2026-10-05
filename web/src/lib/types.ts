/**
 * Response shapes for the ShelfIQ Flask API (backend/api/*.py).
 *
 * These mirror the server exactly, including its quirks:
 *  - several "numeric" fields arrive as pre-formatted strings
 *    (`revenue_recovered: "12,480"`, `revenue_protected: "₹142K"`)
 *  - /api/overview/alerts returns two different key sets depending on
 *    whether the AlertManager path or the except-branch fallback ran
 *  - /api/optimizer/results returns `{available:false}` and nothing else
 *    when no planogram or POS data exists
 */

// ── Stores ────────────────────────────────────────────────────────────
export interface Store {
  store_id: string;
  name: string;
  aisles: number;
  shelves_per_aisle: number;
  sections_per_shelf: number;
}

// ── Overview ──────────────────────────────────────────────────────────
export interface OverviewKpis {
  shelf_health: number;
  shelf_delta: number;
  oos_units: number;
  /** Pre-formatted thousands string, e.g. "12,480" — not a number. */
  revenue_recovered: string;
  forecast_accuracy: number;
}

export type ShelfStatusCode = 'FULL' | 'LOW' | 'EMPTY' | 'VIOLATION';

export interface FloorSection {
  aisle_idx: number;
  section: number;
  status: ShelfStatusCode;
  label: string;
  sku: string;
  name: string;
  /** Percent string like "85%", or "—" for VIOLATION. */
  fill: string;
}

export interface FloorPlan {
  sections: FloorSection[];
  summary: { full: number; low: number; empty: number; violation: number };
}

/** Union of the live-path and fallback-path shapes. */
export interface OverviewAlert {
  message: string;
  severity: number;
  time_ago: string;
  revenue_impact: number;
  // live path only
  sku_id?: string;
  aisle_id?: string;
  shelf_id?: string;
  // fallback path only
  detail?: string;
  badge?: string;
  metric_label?: string;
}

export interface SeriesXY {
  labels: string[];
  values: number[];
}

export interface CompliancePayload {
  average: number;
  aisles: { name: string; pct: number }[];
}

// ── Monitoring ────────────────────────────────────────────────────────
export type AisleHealth = 'optimal' | 'low' | 'critical';

export interface ShelfStatusRow {
  name: string;
  status: AisleHealth;
  sections: number;
}

export type DetectionLogKind = 'critical' | 'warning' | 'success' | 'info';

export interface AisleDetail {
  stock_pct: number;
  compliance_pct: number;
  violations: number;
  delta_pct: number;
  detections: {
    icon: DetectionLogKind;
    emoji: string;
    sku: string;
    msg: string;
    time: string;
  }[];
}

export interface TrafficPayload {
  zones: string[];
  hours: string[];
  /** data[zoneIndex][hourIndex] */
  data: number[][];
}

// ── Detection (POST /api/detect) ──────────────────────────────────────
export interface DetectedItem {
  id: number;
  class_name: string;
  label: string;
  confidence: number;
  /** [x, y, width, height] — width/height, not x2/y2. */
  bbox: [number, number, number, number];
  shelf_region: number;
}

export interface DetectionResult {
  num_products: number;
  avg_confidence: number;
  processing_time_ms: number;
  detections: DetectedItem[];
  class_counts: Record<string, number>;
  stockout_gaps: number;
  compliance_score: number;
  /** data:image/jpeg;base64,… */
  annotated_image: string;
  original_image: string;
  image_width: number;
  image_height: number;
}

// ── Forecast ──────────────────────────────────────────────────────────
export interface ForecastAccuracy {
  wmape: number;
  mae: number;
  rmse: number;
}

export interface ForecastChart {
  hist_dates: string[];
  hist_values: number[];
  fore_dates: string[];
  fore_base: number[];
  fore_upper: number[];
  fore_lower: number[];
  today: string;
  horizon_days: number;
  freq: string;
}

export interface ForecastQuery {
  safety: number;
  horizon: '7D' | '30D' | '90D';
  freq: 'Daily' | 'Weekly' | 'Monthly';
  weather: boolean;
  holiday: boolean;
  competitor: boolean;
}

export interface ReplenishmentRow {
  sku: string;
  name: string;
  stock: number;
  stock_status: string;
  /** Hex colour chosen by the backend. */
  stock_color: string;
  demand: number;
  min_max: string;
  order: number;
  has_action: boolean;
}

// ── Alerts ────────────────────────────────────────────────────────────
export interface InboxAlert {
  id: number;
  /** Pre-formatted, e.g. "HIGH IMPACT — $1,200". */
  impact: string;
  severity: number;
  time_ago: string;
  title: string;
  detail: string;
  corrective: string;
  assigned_to: string | null;
}

export interface ManualTask {
  title: string;
  desc: string;
  assignee: string;
  urgency: string;
  location: string;
  created: string;
}

export interface AlertInbox {
  alerts: InboxAlert[];
  manual_tasks: ManualTask[];
}

export interface TaskBoard {
  todo: { title: string; location: string; assignee: string | null; due: string }[];
  in_progress: { title: string; assignee: string; progress: number; started: string }[];
  completed: { title: string; assignee: string; verified: boolean }[];
  manual_tasks: ManualTask[];
}

export interface AssociatesPayload {
  associates: {
    name: string;
    status: 'Active' | 'Break';
    tasks_done: number;
    /** e.g. "3.4m" */
    avg_resp: string;
  }[];
  avg_response_time: number;
  tasks_resolved: number;
}

// ── Optimizer ─────────────────────────────────────────────────────────
export interface OptimizerKpis {
  lift_pct: number;
  lift_value: number;
  filled: number;
  total_slots: number;
  premium_eye: number;
  premium_count: number;
  eye_pct: number;
  optimized_rev: number;
  baseline_rev: number;
}

export type OptimizerResults =
  | { available: false }
  | {
      available: true;
      kpis: OptimizerKpis;
      tiers: { premium: number; standard: number; economy: number; total: number };
    };

export interface TopPerformer {
  sku_id: string;
  product_name: string;
  tier: 'Premium' | 'Standard' | 'Economy';
  score: number;
  revenue: number;
}

export interface PlanogramGrid {
  aisle_names: { id: string; name: string }[];
  shelves: {
    shelf_number: number;
    is_eye_level: boolean;
    sections: { sku_id: string; product_name: string }[];
  }[];
}

// ── Auth ──────────────────────────────────────────────────────────────
export interface AuthUser {
  user_id: number;
  username: string;
  role: 'manager' | 'staff';
  full_name: string;
  email?: string;
}

// ── Staff ─────────────────────────────────────────────────────────────
export interface StaffMember {
  user_id: number;
  username: string;
  role: string;
  full_name: string;
  email: string;
  phone: string;
  is_active: number;
  created_at: string;
}

// ── Tasks ─────────────────────────────────────────────────────────────
export interface Task {
  task_id: number;
  title: string;
  description: string;
  assigned_to: number;
  assigned_by: number;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: string;
  due_date: string;
  created_at: string;
  completed_at: string | null;
  assignee_name: string;
  assigner_name: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
}

// ── Analytics ─────────────────────────────────────────────────────────
export interface AnalyticsKpis {
  revenue_protected: string;
  revenue_delta: string;
  compliance_score: number;
  stockout_events: number;
  stockout_delta: string;
}

export interface CategoryPerformance {
  labels: string[];
  values: number[];
  colors: string[];
}

export interface StockoutHeatmap {
  aisles: string[];
  hours: string[];
  /** matrix[aisleIndex][hourIndex] */
  matrix: number[][];
}
