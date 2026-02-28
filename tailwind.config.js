/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Paleta oficial Mauro Monção Advogados ──────────────────
        brand: {
          // Navy (azul-marinho institucional)
          'navy-deeper': '#07182e',   // fundo mais escuro
          'navy-dark':   '#0f2340',   // fundo escuro principal
          'navy':        '#112845',   // cards / sidebar base
          'navy-mid':    '#19385C',   // navy médio (cor primária do site)
          'navy-light':  '#1a3a5c',   // bordas, separadores
          // Gold (dourado institucional)
          'gold':        '#D4A017',   // dourado principal
          'gold-light':  '#F0C040',   // dourado claro / hover
          'gold-dark':   '#C8960E',   // dourado escuro
          'gold-pale':   'rgba(212,160,23,0.15)',
          // Neutros
          'cream':       '#f7f5f0',   // creme (background claro do site)
          'white':       '#ffffff',
        },
        // ── Aliases semânticos ──────────────────────────────────────
        juridico: {
          dark:    '#0f2340',
          navy:    '#112845',
          blue:    '#19385C',
          accent:  '#D4A017',
          gold:    '#D4A017',
          success: '#10b981',
          warning: '#F0C040',
          danger:  '#ef4444',
          muted:   '#6b7280',
        }
      },
      fontFamily: {
        // ── Exatamente as mesmas fontes do site www.mauromoncao.adv.br ──
        sans:  ['Outfit', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'Times New Roman', 'serif'],
        mono:  ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        // rastreamentos usados no site institucional
        'brand-wide':    '0.06em',
        'brand-widest':  '0.18em',
        'brand-widest2': '0.22em',
      },
      lineHeight: {
        'heading': '1.15',
        'tight-brand': '1.05',
      },
    },
  },
  plugins: [],
}
