/** @type {import('tailwindcss').Config} */

// Every colour is driven by a CSS custom property holding space-separated RGB
// channels (e.g. `--c-primary: 110 230 238`). Declaring them through
// `rgb(var(--x) / <alpha-value>)` keeps Tailwind's alpha modifiers working
// (`bg-primary/10`, `border-danger/30`) in BOTH themes with zero duplication.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // ── Canvas & elevation ladder (Material 3 surface containers) ──
        canvas: token('canvas'),
        surface: {
          DEFAULT: token('surface'),
          lowest: token('surface-lowest'),
          low: token('surface-low'),
          mid: token('surface-mid'),
          high: token('surface-high'),
          highest: token('surface-highest'),
          bright: token('surface-bright'),
        },
        // ── Content ──
        content: {
          DEFAULT: token('on-surface'),
          muted: token('on-surface-variant'),
          faint: token('on-surface-faint'),
        },
        line: {
          DEFAULT: token('outline-variant'),
          strong: token('outline'),
        },
        // ── Semantic accents ──
        primary: {
          DEFAULT: token('primary'),
          container: token('primary-container'),
          hover: token('primary-hover'),
          on: token('on-primary'),
        },
        warn: { DEFAULT: token('warn'), on: token('on-warn') },
        danger: { DEFAULT: token('danger'), on: token('on-danger') },
        success: { DEFAULT: token('success'), on: token('on-success') },
        violet: { DEFAULT: token('violet'), on: token('on-violet') },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
        'glow-primary': '0 0 28px -6px rgb(var(--c-primary) / 0.45)',
        'glow-danger': '0 0 28px -6px rgb(var(--c-danger) / 0.45)',
      },
      backdropBlur: {
        glass: '18px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0.75)', opacity: '0.8' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.32s cubic-bezier(0.4, 0, 0.2, 1) both',
        'fade-in': 'fade-in 0.24s ease-out both',
        ripple: 'ripple 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        shimmer: 'shimmer 1.6s infinite',
        'slide-in-right': 'slide-in-right 0.26s cubic-bezier(0.4, 0, 0.2, 1) both',
      },
    },
  },
  plugins: [],
};
