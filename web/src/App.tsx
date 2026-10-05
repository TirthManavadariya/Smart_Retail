import { Suspense, lazy } from 'react';
import { Link, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppShell } from './components/layout/AppShell';
import { EmptyState } from './components/ui/States';
import { useAuth } from './hooks/useAuth';

// Route-level code splitting keeps the initial bundle small; the heavy pages
// (charts, image scanner) only load when visited.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LiveMonitoring = lazy(() => import('./pages/LiveMonitoring'));
const ShelfAnalysis = lazy(() => import('./pages/ShelfAnalysis'));
const Forecasts = lazy(() => import('./pages/Forecasts'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Optimizer = lazy(() => import('./pages/Optimizer'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const Tasks = lazy(() => import('./pages/Tasks'));
const StaffManagement = lazy(() => import('./pages/StaffManagement'));

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <RouteFallback />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
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
      {/* Public route — login page */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes — require authentication */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
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
          path="/tasks"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Tasks />
            </Suspense>
          }
        />
        <Route
          path="/staff"
          element={
            <Suspense fallback={<RouteFallback />}>
              <StaffManagement />
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
