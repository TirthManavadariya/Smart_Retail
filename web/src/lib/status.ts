import type { AisleHealth, DetectionLogKind, ShelfStatusCode } from './types';

/**
 * One place where a domain status becomes a visual treatment.
 * The vanilla build repeated this mapping in six files, which is why the
 * floor plan, compliance bars and alert cards had drifted apart visually.
 */
export type Tone = 'primary' | 'warn' | 'danger' | 'success' | 'violet' | 'neutral';

export interface ToneClasses {
  text: string;
  bg: string;
  border: string;
  /** Solid fill for bars, dots and heatmap cells. */
  fill: string;
  ring: string;
}

export const tone: Record<Tone, ToneClasses> = {
  primary: {
    text: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    fill: 'bg-primary',
    ring: 'ring-primary/30',
  },
  warn: {
    text: 'text-warn',
    bg: 'bg-warn/10',
    border: 'border-warn/30',
    fill: 'bg-warn',
    ring: 'ring-warn/30',
  },
  danger: {
    text: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/30',
    fill: 'bg-danger',
    ring: 'ring-danger/30',
  },
  success: {
    text: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    fill: 'bg-success',
    ring: 'ring-success/30',
  },
  violet: {
    text: 'text-violet',
    bg: 'bg-violet/10',
    border: 'border-violet/30',
    fill: 'bg-violet',
    ring: 'ring-violet/30',
  },
  neutral: {
    text: 'text-content-muted',
    bg: 'bg-surface-high',
    border: 'border-line',
    fill: 'bg-content-faint',
    ring: 'ring-line',
  },
};

/** Shelf fill status (FULL/LOW/EMPTY/VIOLATION) → tone + label. */
export const shelfStatus: Record<ShelfStatusCode, { tone: Tone; label: string }> = {
  FULL: { tone: 'primary', label: 'Optimal' },
  LOW: { tone: 'warn', label: 'Low stock' },
  EMPTY: { tone: 'danger', label: 'Stockout' },
  VIOLATION: { tone: 'violet', label: 'Violation' },
};

/** Aisle health from /api/monitoring/shelf-status. */
export const aisleHealth: Record<AisleHealth, { tone: Tone; label: string }> = {
  optimal: { tone: 'primary', label: 'Optimal' },
  low: { tone: 'warn', label: 'Attention' },
  critical: { tone: 'danger', label: 'Critical' },
};

/** Detection log line kind. */
export const logKind: Record<DetectionLogKind, Tone> = {
  critical: 'danger',
  warning: 'warn',
  success: 'primary',
  info: 'neutral',
};

/** Alert severity 1–5 → tone + human label. */
export function severityTone(severity: number): { tone: Tone; label: string } {
  if (severity >= 4) return { tone: 'danger', label: 'Critical' };
  if (severity === 3) return { tone: 'warn', label: 'Compliance' };
  return { tone: 'primary', label: 'Notice' };
}

/** Compliance percentage → tone + grade wording. */
export function complianceTone(percent: number): { tone: Tone; label: string } {
  if (percent >= 90) return { tone: 'primary', label: 'Optimal' };
  if (percent >= 80) return { tone: 'warn', label: 'Attention' };
  return { tone: 'danger', label: 'Deficit' };
}

/** Optimizer SKU tier → tone. */
export const tierTone: Record<TopPerformerTier, Tone> = {
  Premium: 'primary',
  Standard: 'warn',
  Economy: 'neutral',
};

type TopPerformerTier = 'Premium' | 'Standard' | 'Economy';
