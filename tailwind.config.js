/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Space Grotesk', 'sans-serif'],
        body: ['var(--font-body)', 'Inter Tight', 'sans-serif'],
        sans: ['var(--font-body)', 'Inter Tight', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      colors: {
        page: 'var(--color-page)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        orange: 'var(--color-orange)',
        ember: 'var(--color-ember)',
        gold: '#F5C542',
        muted: 'var(--text-muted)',
        dim: 'var(--text-secondary)',
        subtle: 'var(--text-subtle)',
        'bg-beige': '#eee9e3',
        'brand-orange': '#f43c00',
        'text-dark': '#000000',
        'bg-dark': '#000000',
        'card-dark': '#141414',
        success: '#22C55E',
        purple: '#A855F7',
        cn: {
          background: 'hsl(var(--cn-background) / <alpha-value>)',
          foreground: 'hsl(var(--cn-foreground) / <alpha-value>)',
          card: {
            DEFAULT: 'hsl(var(--cn-card) / <alpha-value>)',
            foreground: 'hsl(var(--cn-card-foreground) / <alpha-value>)',
          },
          popover: {
            DEFAULT: 'hsl(var(--cn-popover) / <alpha-value>)',
            foreground: 'hsl(var(--cn-popover-foreground) / <alpha-value>)',
          },
          primary: {
            DEFAULT: 'hsl(var(--cn-primary) / <alpha-value>)',
            foreground: 'hsl(var(--cn-primary-foreground) / <alpha-value>)',
          },
          secondary: {
            DEFAULT: 'hsl(var(--cn-secondary) / <alpha-value>)',
            foreground: 'hsl(var(--cn-secondary-foreground) / <alpha-value>)',
          },
          muted: {
            DEFAULT: 'hsl(var(--cn-muted) / <alpha-value>)',
            foreground: 'hsl(var(--cn-muted-foreground) / <alpha-value>)',
          },
          accent: {
            DEFAULT: 'hsl(var(--cn-accent) / <alpha-value>)',
            foreground: 'hsl(var(--cn-accent-foreground) / <alpha-value>)',
          },
          destructive: {
            DEFAULT: 'hsl(var(--cn-destructive) / <alpha-value>)',
            foreground: 'hsl(var(--cn-destructive-foreground) / <alpha-value>)',
          },
          border: 'hsl(var(--cn-border) / <alpha-value>)',
          input: 'hsl(var(--cn-input) / <alpha-value>)',
          ring: 'hsl(var(--cn-ring) / <alpha-value>)',
        },
      },
      borderRadius: {
        card: '16px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'elevate-marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'elevate-marquee': 'elevate-marquee 28s linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
