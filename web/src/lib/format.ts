/** Shared formatters. The old codebase inlined these ad hoc in every page. */

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const compactInr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const money = (value: number): string => inr.format(value);
export const moneyCompact = (value: number): string => compactInr.format(value);

export const num = (value: number, decimals = 0): string =>
  value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const pct = (value: number, decimals = 1): string => `${value.toFixed(decimals)}%`;

/** Parse the percent strings the API sends for floor sections ("85%", "—"). */
export const parsePct = (value: string): number | null => {
  const parsed = Number.parseFloat(value.replace('%', ''));
  return Number.isFinite(parsed) ? parsed : null;
};

/** "2026-08-20" → "20 Aug" for compact chart axes. */
export const shortDate = (iso: string): string => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const initials = (name: string): string =>
  name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
