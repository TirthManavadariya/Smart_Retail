import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { routeForPath } from '@/app/routes';
import { cn } from '@/lib/cn';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const COLLAPSE_KEY = 'shelfiq.sidebarCollapsed';

export function AppShell() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  // Keep the document title in sync and reset scroll on navigation.
  useEffect(() => {
    const route = routeForPath(location.pathname);
    document.title = route ? `${route.title} · ShelfIQ` : 'ShelfIQ';
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      {/* Keyboard users can jump past the nav */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]
          focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-on"
      >
        Skip to main content
      </a>

      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-300 ease-smooth',
          collapsed ? 'lg:pl-[4.75rem]' : 'lg:pl-64',
        )}
      >
        <Topbar onOpenMobileNav={() => setMobileOpen(true)} />

        <main
          id="main"
          className="mx-auto w-full max-w-[100rem] flex-1 space-y-6 px-4 py-6 sm:px-6 lg:py-8"
        >
          {/* key remounts page content so entry animations replay per route */}
          <div key={location.pathname} className="animate-fade-up space-y-6">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-line/50 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-[100rem] flex-wrap items-center justify-between gap-2 text-2xs text-content-faint">
            <span>ShelfIQ · Computer-vision shelf intelligence</span>
            <span className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" />
                Models online
              </span>
              <span>YOLOv8 · Prophet · CLIP</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
