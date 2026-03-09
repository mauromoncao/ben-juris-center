/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Paleta Institucional BEN ───────────────────────────────────
        primary: {
          DEFAULT: '#19385C',
          50:  '#e8edf7',
          100: '#c5d0e8',
          200: '#9fb0d7',
          300: '#7890c6',
          400: '#5b78ba',
          500: '#3e60ae',
          600: '#2d4f8a',
          700: '#1e3870',
          800: '#19385C',
          900: '#0f2044',
        },
        // ── Dourado institucional BEN ──────────────────────────────────
        gold: {
          DEFAULT: '#DEC078',
          50:  '#fdf8e8',
          100: '#faefc4',
          200: '#f5e090',
          300: '#EDD090',
          400: '#e8bc30',
          500: '#DEC078',
          600: '#C8A052',
          700: '#b07f0a',
          800: '#8c6507',
          900: '#6b4c05',
        },
        // ── Paleta oficial BEN ─────────────────────────────────────────
        brand: {
          'navy-deeper': '#0f2044',
          'navy-dark':   '#19385C',
          'navy':        '#19385C',
          'navy-mid':    '#19385C',
          'gold':        '#DEC078',
          'gold-light':  '#F0D090',
          'gold-dark':   '#C8A052',
          'cream':       '#f7f5f0',
        },
        // ── Aliases semânticos ──────────────────────────────────────────
        juridico: {
          dark:    '#0f2044',
          navy:    '#19385C',
          blue:    '#19385C',
          accent:  '#DEC078',
          gold:    '#DEC078',
          success: '#10b981',
          warning: '#F0D090',
          danger:  '#ef4444',
          muted:   '#64748b',
        },
        // ── Design token shortcuts ──────────────────────────────────────
        navy:    '#19385C',
        'navy-mid': '#1e3470',
        'navy-light': '#2d4a8a',
        emerald: '#00b37e',
        amber:   '#f59e0b',
        crimson: '#e11d48',
        violet:  '#7c3aed',
        cyan:    '#0891b2',
      },
      fontFamily: {
        // ── Tipografia institucional padrão Inter ─────────────────────
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Inter', 'Georgia', 'Times New Roman', 'serif'],
        mono:  ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        'base': ['18px', { lineHeight: '1.6' }],
        'sm':   ['0.875rem', { lineHeight: '1.5' }],
        'xs':   ['0.75rem',  { lineHeight: '1.4' }],
      },
      letterSpacing: {
        'brand-wide':   '0.06em',
        'brand-wider':  '0.12em',
        'brand-widest': '0.18em',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
