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
  // React's state matches the DOM exactly and we never double-flash.
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0b1323' : '#f2f6fb');
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
      primary: read('--c-primary', '#6ee6ee'),
      warn: read('--c-warn', '#cecb5b'),
      danger: read('--c-danger', '#ffb4ab'),
      success: read('--c-success', '#5ed8a5'),
      violet: read('--c-violet', '#c4b5fd'),
      axis: read('--c-on-surface-faint', '#748498'),
      grid: rgba('--c-outline-variant', 0.45, 'rgba(120,130,140,0.35)'),
      surface: read('--c-surface-mid', '#182030'),
      text: read('--c-on-surface', '#dbe2f9'),
      muted: read('--c-on-surface-variant', '#9cabbe'),
      primarySoft: rgba('--c-primary', 0.18, 'rgba(110,230,238,0.18)'),
    };
  }, [theme]);
}
