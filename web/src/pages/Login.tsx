import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanBarcode, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-mid px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary text-primary-on">
            <ScanBarcode className="size-8" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-content">
            Shelf<span className="text-primary">IQ</span>
          </h1>
          <p className="mt-1 text-sm text-content-muted">Smart Retail Shelf Intelligence</p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-6 text-center text-lg font-bold text-content">Sign In</h2>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-content-faint">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-content placeholder:text-content-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-content-faint">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 pr-12 text-sm text-content placeholder:text-content-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-faint hover:text-content"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-on transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-primary-on/30 border-t-primary-on" />
              ) : (
                <LogIn className="size-4" />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-6 rounded-xl bg-surface-mid p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-content-faint">
              Test Credentials
            </p>
            <div className="space-y-1.5 text-xs text-content-muted">
              <div className="flex justify-between">
                <span className="font-semibold text-content">Manager:</span>
                <span className="font-mono">manager / manager123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-content">Staff 1:</span>
                <span className="font-mono">priya / staff123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-content">Staff 2:</span>
                <span className="font-mono">rajesh / staff123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-content">Staff 3:</span>
                <span className="font-mono">amit / staff123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
