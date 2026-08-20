import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from './Button';

/**
 * Accessible dialog: focus is moved in on open, Escape closes, background
 * scroll is locked, and the backdrop click target is separate from the panel.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'glass glass-seam relative w-full overflow-hidden rounded-2xl shadow-pop animate-fade-up',
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-lg',
          size === 'lg' && 'max-w-3xl',
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line/60 px-5 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-content">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-xs text-content-muted">{subtitle}</p> : null}
          </div>
          <IconButton label="Close dialog" onClick={onClose} className="size-8">
            <X className="size-4" />
          </IconButton>
        </header>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4 text-sm text-content-muted">{children}</div>

        {footer ? (
          <footer className="flex justify-end gap-2 border-t border-line/60 bg-surface-low/50 px-5 py-3">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
