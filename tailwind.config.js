/** @type {import('tailwindcss').Config} */
// Design tokens live in src/styles/tokens.css as CSS variables; Tailwind maps names to them.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: v('paper'),
        surface: v('surface'),
        sunken: v('sunken'),
        line: v('line'),
        'line-strong': v('line-strong'),
        ink: {
          DEFAULT: v('ink'),
          soft: v('ink-soft'),
          muted: v('ink-muted'),
        },
        teal: {
          DEFAULT: v('teal'),
          strong: v('teal-strong'),
          soft: v('teal-soft'),
          tint: v('teal-tint'),
        },
        amber: {
          DEFAULT: v('amber'),
          soft: v('amber-soft'),
        },
        danger: {
          DEFAULT: v('danger'),
          soft: v('danger-soft'),
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Projector-friendly scale (root is 18px, see tokens.css).
        display: ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        title: ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      borderRadius: {
        card: '1.25rem',
        chip: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(19 35 63 / 0.05), 0 8px 24px -12px rgb(19 35 63 / 0.12)',
        lift: '0 2px 4px rgb(19 35 63 / 0.06), 0 16px 40px -16px rgb(19 35 63 / 0.22)',
      },
      maxWidth: {
        column: '46rem',
      },
    },
  },
  plugins: [],
};
