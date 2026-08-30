import { Suspense, lazy } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppShell } from './components/layout/AppShell';
import { EmptyState } from './components/ui/States';

// Route-level code splitting keeps the initial bundle small; the heavy pages
// (charts, image scanner) only load when visited.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LiveMonitoring = lazy(() => import('./pages/LiveMonitoring'));
const ShelfAnalysis = lazy(() => import('./pages/ShelfAnalysis'));
const Forecasts = lazy(() => import('./pages/Forecasts'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Optimizer = lazy(() => import('./pages/Optimizer'));
const Settings = lazy(() => import('./pages/Settings'));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 className="size-7 animate-spin text-primary" />
      <p className="text-xs font-semibold uppercase tracking-widest text-content-faint">
        Loading view
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="That route doesn't exist in ShelfIQ."
      action={
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-on transition-colors hover:bg-primary-hover"
        >
          Back to dashboard
        </Link>
      }
      className="min-h-[50vh]"
    />
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/monitoring"
          element={
            <Suspense fallback={<RouteFallback />}>
              <LiveMonitoring />
            </Suspense>
          }
        />
        <Route
          path="/shelf-analysis"
          element={
            <Suspense fallback={<RouteFallback />}>
              <ShelfAnalysis />
            </Suspense>
          }
        />
        <Route
          path="/forecasts"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Forecasts />
            </Suspense>
          }
        />
        <Route
          path="/alerts"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Alerts />
            </Suspense>
          }
        />
        <Route
          path="/optimizer"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Optimizer />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Settings />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
