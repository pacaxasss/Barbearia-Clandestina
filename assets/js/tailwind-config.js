/**
 * Barbearia Clandestina - Configuração Tailwind CSS
 * Compartilhada entre o site principal (index.html) e o painel de gestão (dashboard.html)
 */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        noir: {
          950: '#030303',
          900: '#080808',
          850: '#0f0f10',
          800: '#141416',
          700: '#1e1e22',
          600: '#2b2b30',
          400: '#737373',
          300: '#a3a3a3',
          200: '#d4d4d4',
          100: '#f5f5f5',
        },
        brand: {
          black: '#080808',
          card: '#121212',
          border: '#1f1f1f',
          accent: '#ffffff',
        }
      },
      fontFamily: {
        title: ['"Bebas Neue"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        royal: ['"Royal King"', '"Bebas Neue"', 'serif'],
      },
      animation: {
        'glitch': 'glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'vibrate-tool': 'vibrate 0.1s linear infinite',
        'flicker': 'filmFlicker 0.15s infinite',
      },
      keyframes: {
        vibrate: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(1px, -1px)' },
          '50%': { transform: 'translate(-1px, 1px)' },
          '75%': { transform: 'translate(-1px, -1px)' },
        },
        filmFlicker: {
          '0%, 100%': { opacity: '0.04' },
          '50%': { opacity: '0.07' },
        }
      }
    }
  }
};
