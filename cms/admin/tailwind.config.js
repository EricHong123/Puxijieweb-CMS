/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'warm-charcoal': {
          DEFAULT: 'hsl(30 6% 18%)',
          muted: 'hsl(28 5% 38%)',
        },
        ivory: {
          DEFAULT: 'hsl(40 30% 98%)',
          cream: 'hsl(38 25% 96%)',
        },
        pastel: {
          blue: 'hsl(205 40% 48%)',
          rose: 'hsl(4 55% 58%)',
          green: 'hsl(140 25% 48%)',
          amber: 'hsl(35 60% 55%)',
          lavender: 'hsl(250 30% 65%)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'paper-xs': 'var(--shadow-xs)',
        'paper-sm': 'var(--shadow-sm)',
        'paper': 'var(--shadow-sm)',
        'paper-md': 'var(--shadow-md)',
        'paper-lg': 'var(--shadow-lg)',
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', '"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        handwriting: ['"Caveat"', '"Comic Sans MS"', 'cursive'],
      },
      transitionDuration: {
        paper: '200ms',
      },
      keyframes: {
        'paper-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'paper-in': 'paper-in 0.25s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
