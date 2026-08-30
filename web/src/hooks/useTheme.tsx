import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'shelfiq.theme';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitialTheme(): Theme {
  // index.html already resolved and applied this before paint; read it back so
  // React's state matches the DOM exactly and we never double-flash. Light is
  // the default experience.
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0b1323' : '#ffffff');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* private mode — theme simply won't persist */
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
    [],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, isDark: theme === 'dark', setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

/**
 * Resolved token values for libraries that need real colour strings rather
 * than CSS classes (Recharts strokes/fills, canvas drawing).
 */
export function useChartTheme() {
  const { theme } = useTheme();

  return useMemo(() => {
    const read = (name: string, fallback: string) => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return raw ? `rgb(${raw})` : fallback;
    };
    const rgba = (name: string, alpha: number, fallback: string) => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return raw ? `rgb(${raw} / ${alpha})` : fallback;
    };

    return {
      theme,
      primary: read('--c-primary', '#4f46e5'),
      warn: read('--c-warn', '#b45309'),
      danger: read('--c-danger', '#dc2626'),
      success: read('--c-success', '#16a34a'),
      violet: read('--c-violet', '#7c3aed'),
      axis: read('--c-on-surface-faint', '#94a3b8'),
      grid: rgba('--c-outline-variant', 0.6, '#f1f5f9'),
      surface: read('--c-surface-mid', '#f8fafc'),
      text: read('--c-on-surface', '#0f172a'),
      muted: read('--c-on-surface-variant', '#475569'),
      primarySoft: rgba('--c-primary', 0.12, 'rgba(79,70,229,0.12)'),
    };
  }, [theme]);
}
