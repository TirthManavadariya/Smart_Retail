import {
  BellRing,
  LayoutDashboard,
  ScanSearch,
  Settings2,
  Sparkles,
  TrendingUp,
  Video,
  ClipboardList,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type NavSection = 'Operations' | 'Intelligence' | 'Response' | 'System';

export interface RouteMeta {
  path: string;
  label: string;
  /** Shown in the topbar breadcrumb + document title. */
  title: string;
  icon: LucideIcon;
  section: NavSection;
  /** Marks views that poll live telemetry — drives the "live" dot in the nav. */
  live?: boolean;
  /** Only visible to managers. */
  managerOnly?: boolean;
}

/**
 * Single source of truth for navigation and routing. Adding a page means
 * adding one entry here plus one <Route> in App.tsx.
 */
export const NAV_ROUTES: RouteMeta[] = [
  {
    path: '/',
    label: 'Dashboard',
    title: 'Store Health Dashboard',
    icon: LayoutDashboard,
    section: 'Operations',
    live: true,
  },
  {
    path: '/monitoring',
    label: 'Live Monitoring',
    title: 'Live Monitoring',
    icon: Video,
    section: 'Operations',
    live: true,
  },
  {
    path: '/shelf-analysis',
    label: 'Shelf Analysis',
    title: 'Shelf Analysis',
    icon: ScanSearch,
    section: 'Intelligence',
  },
  {
    path: '/forecasts',
    label: 'Forecasts',
    title: 'Demand Forecast',
    icon: TrendingUp,
    section: 'Intelligence',
  },
  {
    path: '/optimizer',
    label: 'Shelf Optimizer',
    title: 'Shelf Optimizer',
    icon: Sparkles,
    section: 'Intelligence',
  },
  {
    path: '/alerts',
    label: 'Alerts',
    title: 'Alerts & Tasks',
    icon: BellRing,
    section: 'Response',
    live: true,
  },
  {
    path: '/tasks',
    label: 'Tasks',
    title: 'Task Management',
    icon: ClipboardList,
    section: 'Response',
  },
  {
    path: '/staff',
    label: 'Staff',
    title: 'Staff Management',
    icon: Users,
    section: 'System',
    managerOnly: true,
  },
  {
    path: '/settings',
    label: 'Settings',
    title: 'Analytics & Settings',
    icon: Settings2,
    section: 'System',
  },
];

export const NAV_SECTIONS: NavSection[] = ['Operations', 'Intelligence', 'Response', 'System'];

export function routeForPath(pathname: string): RouteMeta | undefined {
  return NAV_ROUTES.find((route) => route.path === pathname);
}
