import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Accessible toggle built on a real checkbox input.
 * The track is the positioning context (relative inline-flex) and the knob is
 * absolutely placed inside it, so the circle can never float outside the pill.
 */
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

      <span
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-smooth',
          checked ? 'bg-primary' : 'bg-surface-highest',
        )}
      >
        {/* The input covers the whole track for a large, accessible hit area. */}
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed"
        />
        {/* Knob: 16px circle, 4px inset, slides 20px when checked. Uses the
            surface colour so it contrasts against the track in both themes. */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-1 top-1 size-4 rounded-full bg-surface shadow-sm ring-1 ring-black/5',
            'transition-transform duration-200 ease-smooth',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/60 peer-focus-visible:ring-offset-2',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
          style={{ ['--tw-ring-offset-color' as string]: 'rgb(var(--c-surface))' }}
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

export interface SelectOption {
  value: string;
  label: string;
  /** Optional trailing element, e.g. a status <Badge/>. */
  badge?: ReactNode;
}

/**
 * Custom select rendered as a floating popover (not a native <select>), so the
 * option list is fully styled and consistent across browsers/OSes. The panel
 * is portalled to <body> and fixed-positioned under the trigger, which means
 * it is never clipped by a card's `overflow-hidden` and floats above modals.
 */
export function Select({
  value,
  onChange,
  options,
  label,
  icon,
  className,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label: string;
  icon?: ReactNode;
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const selected = options.find((option) => option.value === value);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const reposition = () => place();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    // capture scroll on any ancestor so the panel tracks the trigger
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, [open, place]);

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'inline-flex w-full items-center gap-2 rounded-xl border bg-surface px-3 py-2 text-xs font-semibold text-content transition-colors',
          open ? 'border-primary/60' : 'border-line hover:border-line-strong',
        )}
      >
        {icon ? <span className="shrink-0 text-content-muted">{icon}</span> : null}
        <span className="min-w-0 flex-1 truncate text-left">
          {selected ? (
            selected.label
          ) : (
            <span className="text-content-faint">{placeholder ?? 'Select…'}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'size-3.5 shrink-0 text-content-muted transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && pos
        ? createPortal(
            <ul
              ref={panelRef}
              role="listbox"
              aria-label={label}
              style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width }}
              className="z-[130] max-h-64 overflow-auto rounded-xl border border-line bg-surface p-1 shadow-pop animate-fade-up"
            >
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <li key={option.value} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors',
                        active
                          ? 'bg-primary/10 font-semibold text-primary'
                          : 'text-content hover:bg-surface-mid',
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {option.badge ? <span className="shrink-0">{option.badge}</span> : null}
                      {active ? <Check className="size-3.5 shrink-0" aria-hidden="true" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>,
            document.body,
          )
        : null}
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
        className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-content
          outline-none transition-colors placeholder:text-content-faint focus:border-primary/60"
      />
    </label>
  );
}
