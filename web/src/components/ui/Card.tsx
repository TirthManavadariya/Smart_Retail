import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds hover lift + accent border. Use only when the whole card is clickable. */
  interactive?: boolean;
  as?: 'div' | 'section' | 'article';
}

export function Card({ children, className, interactive = false, as: Tag = 'section' }: CardProps) {
  return (
    <Tag
      className={cn(
        'glass-seam relative overflow-hidden rounded-2xl',
        interactive ? 'glass-interactive' : 'glass',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned slot for filters, legends or actions. */
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className }: CardHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 border-b border-line/60 px-5 py-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="truncate font-display text-base font-bold tracking-tight text-content">
            {title}
          </h2>
          {subtitle ? <p className="mt-0.5 text-xs text-content-muted">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </header>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <footer className={cn('border-t border-line/60 bg-surface-low/40 px-5 py-3', className)}>
      {children}
    </footer>
  );
}
