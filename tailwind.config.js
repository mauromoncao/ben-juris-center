/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Navy primário – idêntico ao Ben Growth Center ──────────
        primary: {
          DEFAULT: '#0f2044',
          50:  '#e8edf7',
          100: '#c5d0e8',
          200: '#9fb0d7',
          300: '#7890c6',
          400: '#5b78ba',
          500: '#3e60ae',
          600: '#3858a6',
          700: '#2f4d9c',
          800: '#1e3470',
          900: '#0f2044',
        },
        // ── Dourado institucional – Mauro Monção Advogados ─────────
        gold: {
          DEFAULT: '#D4A017',
          50:  '#fdf8e8',
          100: '#faefc4',
          200: '#f5e090',
          300: '#f0cc58',
          400: '#e8bc30',
          500: '#D4A017',
          600: '#C8960E',
          700: '#b07f0a',
          800: '#8c6507',
          900: '#6b4c05',
        },
        // ── Paleta oficial Mauro Monção (cores do site) ────────────
        brand: {
          'navy-deeper': '#07182e',
          'navy-dark':   '#0f2340',
          'navy':        '#112845',
          'navy-mid':    '#19385C',
          'gold':        '#D4A017',
          'gold-light':  '#F0C040',
          'gold-dark':   '#C8960E',
          'cream':       '#f7f5f0',
        },
        // ── Aliases semânticos ──────────────────────────────────────
        juridico: {
          dark:    '#0f2044',
          navy:    '#1e3470',
          blue:    '#19385C',
          accent:  '#D4A017',
          gold:    '#D4A017',
          success: '#10b981',
          warning: '#F0C040',
          danger:  '#ef4444',
          muted:   '#64748b',
        },
      },
      fontFamily: {
        // ── Fontes do site www.mauromoncao.adv.br ─────────────────
        sans:  ['Outfit', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'Times New Roman', 'serif'],
        mono:  ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
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
