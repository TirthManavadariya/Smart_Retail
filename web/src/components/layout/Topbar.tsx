import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Menu,
  MoonStar,
  RefreshCw,
  Store as StoreIcon,
  Sun,
} from 'lucide-react';
import { routeForPath } from '@/app/routes';
import { useAlertInbox } from '@/hooks/queries';
import { useActiveStore } from '@/hooks/useActiveStore';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/cn';
import { severityTone } from '@/lib/status';
import { PulseDot } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/Button';
import { Select } from '@/components/ui/Controls';

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const location = useLocation();
  const route = routeForPath(location.pathname);
  const { theme, toggleTheme } = useTheme();
  const { storeId, setStoreId, stores } = useActiveStore();
  const { push } = useToast();
  const queryClient = useQueryClient();
  const isFetching = useIsFetching();
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: inbox } = useAlertInbox(storeId);
  const alerts = inbox?.alerts ?? [];

  const refreshAll = () => {
    void queryClient.invalidateQueries();
    push({ kind: 'info', title: 'Refreshing', message: 'Pulling the latest telemetry from all sources.' });
  };

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 rounded-none border-x-0 border-t-0 px-4 sm:px-6">
      <button
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="grid size-9 shrink-0 place-items-center rounded-xl border border-line text-content-muted hover:text-content lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      {/* Context: which page, which store */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold text-content">
          {route?.title ?? 'ShelfIQ'}
        </p>
        <p className="hidden truncate text-2xs text-content-faint sm:block">
          Computer-vision shelf intelligence
        </p>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <Select
          label="Active store"
          value={storeId}
          onChange={setStoreId}
          icon={<StoreIcon className="size-3.5" />}
          options={
            stores.length > 0
              ? stores.map((store) => ({ value: store.store_id, label: store.name }))
              : [{ value: storeId, label: 'Loading stores…' }]
          }
          className="max-w-[15rem]"
        />

        <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-2xs font-semibold text-primary">
          <PulseDot />
          CV pipeline active
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <IconButton
          label="Refresh all data"
          onClick={refreshAll}
          className={cn(isFetching > 0 && 'text-primary')}
        >
          <RefreshCw className={cn('size-4', isFetching > 0 && 'animate-spin')} />
        </IconButton>

        <div className="relative">
          <IconButton label="Notifications" onClick={() => setNotifOpen((open) => !open)}>
            <Bell className="size-4" />
            {alerts.length > 0 && (
              <span className="tnum absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[0.6rem] font-bold text-danger-on ring-2 ring-surface">
                {alerts.length}
              </span>
            )}
          </IconButton>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} aria-hidden="true" />
              <div className="glass absolute right-0 top-[calc(100%+0.6rem)] z-20 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl shadow-pop animate-fade-up">
                <div className="flex items-center justify-between border-b border-line/60 px-4 py-3">
                  <p className="font-display text-xs font-bold text-content">Live alerts</p>
                  <span className="text-2xs text-content-faint">{alerts.length} open</span>
                </div>
                <ul className="max-h-72 overflow-y-auto p-2">
                  {alerts.length === 0 ? (
                    <li className="px-3 py-6 text-center text-xs text-content-faint">
                      Nothing needs attention.
                    </li>
                  ) : (
                    alerts.map((alert) => {
                      const t = severityTone(alert.severity);
                      return (
                        <li key={alert.id}>
                          <Link
                            to="/alerts"
                            onClick={() => setNotifOpen(false)}
                            className="flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-high/70"
                          >
                            <span
                              className={cn(
                                'mt-1 size-1.5 shrink-0 rounded-full',
                                t.tone === 'danger' ? 'bg-danger' : t.tone === 'warn' ? 'bg-warn' : 'bg-primary',
                              )}
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-semibold text-content">
                                {alert.title}
                              </span>
                              <span className="block truncate text-2xs text-content-muted">
                                {alert.detail}
                              </span>
                              <span className="mt-0.5 block text-2xs text-content-faint">
                                {alert.time_ago}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })
                  )}
                </ul>
                <Link
                  to="/alerts"
                  onClick={() => setNotifOpen(false)}
                  className="block border-t border-line/60 bg-surface-low/50 py-2.5 text-center text-xs font-semibold text-primary hover:bg-primary/5"
                >
                  Open Alerts &amp; Tasks
                </Link>
              </div>
            </>
          )}
        </div>

        <IconButton
          label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <MoonStar className="size-4" />}
        </IconButton>
      </div>
    </header>
  );
}
