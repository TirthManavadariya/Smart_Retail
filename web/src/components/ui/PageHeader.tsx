import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Consistent page masthead: eyebrow → title → description on the left,
 * primary actions on the right. Keeping this identical on every page is what
 * makes the app feel like one product rather than eight screens.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <p className="mb-1.5 text-2xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-content sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-content-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** Section divider inside a page. */
export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-content">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-content-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
