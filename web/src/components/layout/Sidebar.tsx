import { NavLink } from 'react-router-dom';
import { ChevronLeft, PanelLeftClose, ScanBarcode, UserRound } from 'lucide-react';
import { NAV_ROUTES, NAV_SECTIONS } from '@/app/routes';
import { useAlertInbox } from '@/hooks/queries';
import { useActiveStore } from '@/hooks/useActiveStore';
import { cn } from '@/lib/cn';

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { storeId } = useActiveStore();
  const { data: inbox } = useAlertInbox(storeId);
  const alertCount = inbox?.alerts.length ?? 0;

  return (
    <>
      {/* Mobile scrim */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'glass fixed inset-y-0 left-0 z-50 flex flex-col rounded-none border-y-0 border-l-0',
          'transition-[width,transform] duration-300 ease-smooth',
          collapsed ? 'w-[4.75rem]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line/60 px-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary-container to-primary text-primary-on shadow-glow-primary">
            <ScanBarcode className="size-[1.15rem]" />
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-extrabold leading-tight tracking-tight text-content">
                Shelf<span className="text-primary">IQ</span>
              </p>
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-content-faint">
                Vision Core
              </p>
            </div>
          )}
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="ml-auto rounded-lg p-1.5 text-content-muted hover:bg-surface-high hover:text-content lg:hidden"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4">
          {NAV_SECTIONS.map((section) => {
            const items = NAV_ROUTES.filter((route) => route.section === section);
            if (items.length === 0) return null;

            return (
              <div key={section} className="mb-4 last:mb-0">
                {collapsed ? (
                  <div className="mx-3 mb-2 h-px bg-line/60" />
                ) : (
                  <p className="px-3 pb-1.5 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-content-faint">
                    {section}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {items.map((route) => {
                    const Icon = route.icon;
                    const badge = route.path === '/alerts' && alertCount > 0 ? alertCount : undefined;

                    return (
                      <li key={route.path}>
                        <NavLink
                          to={route.path}
                          onClick={onCloseMobile}
                          title={collapsed ? route.label : undefined}
                          className={({ isActive }) =>
                            cn(
                              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-smooth',
                              collapsed && 'justify-center px-0',
                              isActive
                                ? 'bg-primary/12 text-primary'
                                : 'text-content-muted hover:bg-surface-high/70 hover:text-content',
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {/* Active rail */}
                              <span
                                className={cn(
                                  'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-opacity',
                                  isActive ? 'opacity-100' : 'opacity-0',
                                )}
                                aria-hidden="true"
                              />
                              <Icon className="size-[1.05rem] shrink-0" />
                              {!collapsed && <span className="truncate">{route.label}</span>}

                              {badge !== undefined &&
                                (collapsed ? (
                                  <span className="absolute right-2.5 top-2 size-1.5 rounded-full bg-danger" />
                                ) : (
                                  <span className="tnum ml-auto rounded-full bg-danger/15 px-1.5 py-0.5 text-2xs font-bold text-danger">
                                    {badge}
                                  </span>
                                ))}

                              {route.live && badge === undefined && !collapsed && (
                                <span
                                  className="ml-auto size-1.5 rounded-full bg-primary/70"
                                  title="Live data"
                                />
                              )}
                            </>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* User + collapse control */}
        <div className="shrink-0 border-t border-line/60 p-2.5">
          <div
            className={cn(
              'flex items-center gap-2.5 rounded-xl bg-surface-mid/60 p-2.5',
              collapsed && 'justify-center',
            )}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-container to-primary text-primary-on">
              <UserRound className="size-4" />
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-content">Arjun Sharma</p>
                <p className="truncate text-2xs text-content-faint">Store Operations Lead</p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapsed}
            className={cn(
              'mt-2 hidden w-full items-center gap-2 rounded-xl px-3 py-2 text-2xs font-semibold uppercase tracking-wider',
              'text-content-faint transition-colors hover:bg-surface-high hover:text-content lg:flex',
              collapsed && 'justify-center px-0',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={cn('size-4 transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
