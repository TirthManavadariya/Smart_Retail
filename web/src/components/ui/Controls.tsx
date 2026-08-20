import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Accessible toggle built on a real checkbox input. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        'flex items-center justify-between gap-4 py-2',
        disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer',
      )}
    >
      <span className="min-w-0">
        <span className="block text-xs font-medium text-content">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-2xs text-content-faint">{description}</span>
        ) : null}
      </span>
      <span className="relative shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer size-0 opacity-0"
        />
        <span
          className={cn(
            'block h-5 w-9 rounded-full transition-colors duration-200',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/70 peer-focus-visible:ring-offset-2',
            checked ? 'bg-primary' : 'bg-surface-highest',
          )}
          style={{ ['--tw-ring-offset-color' as string]: 'rgb(var(--c-surface-mid))' }}
        />
        <span
          className={cn(
            'pointer-events-none absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform duration-200 ease-smooth',
            checked ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
          )}
        />
      </span>
    </label>
  );
}

/** Range input with a live value read-out. */
export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  format = (v) => String(v),
  hint,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  format?: (value: number) => string;
  hint?: string;
}) {
  const filled = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-2xs font-bold uppercase tracking-wider text-content-muted">{label}</label>
        <span className="tnum text-xs font-bold text-primary">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-high outline-none
          [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgb(var(--c-primary)/0.2)]
          [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:bg-primary"
        style={{
          background: `linear-gradient(90deg, rgb(var(--c-primary)) ${filled}%, rgb(var(--c-surface-high)) ${filled}%)`,
        }}
      />
      {hint ? <p className="mt-1.5 text-2xs italic text-content-faint">{hint}</p> : null}
    </div>
  );
}

/** Styled native select — keeps mobile pickers and keyboard behaviour intact. */
export function Select({
  value,
  onChange,
  options,
  label,
  icon,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border border-line bg-surface-mid/70 px-3 transition-colors',
        'focus-within:border-primary/60 hover:border-line-strong',
        className,
      )}
    >
      {icon ? <span className="shrink-0 text-content-muted">{icon}</span> : null}
      <select
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 cursor-pointer appearance-none truncate bg-transparent py-2 pr-1 text-xs font-semibold text-content outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TextField({
  value,
  onChange,
  label,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-2xs font-bold uppercase tracking-wider text-content-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-line bg-surface-mid/70 px-3 py-2 text-sm text-content
          outline-none transition-colors placeholder:text-content-faint focus:border-primary/60"
      />
    </label>
  );
}
