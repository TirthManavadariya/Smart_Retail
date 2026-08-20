import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { useToast, type ToastKind } from '@/hooks/useToast';
import { cn } from '@/lib/cn';
import { tone, type Tone } from '@/lib/status';

const kindTone: Record<ToastKind, Tone> = {
  success: 'success',
  error: 'danger',
  warning: 'warn',
  info: 'primary',
};

const kindIcon: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return createPortal(
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[120] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const t = tone[kindTone[toast.kind]];
        const Icon = kindIcon[toast.kind];
        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={cn(
              'glass pointer-events-auto flex items-start gap-3 rounded-xl border-l-2 p-3.5 shadow-pop animate-slide-in-right',
              t.border,
            )}
          >
            <span className={cn('mt-0.5 shrink-0', t.text)}>
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-content">{toast.title}</p>
              {toast.message ? (
                <p className="mt-0.5 text-xs leading-snug text-content-muted">{toast.message}</p>
              ) : null}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded p-0.5 text-content-faint transition-colors hover:text-content"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
