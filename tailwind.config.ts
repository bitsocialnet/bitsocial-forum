import type { Config } from 'tailwindcss';
import { fileURLToPath } from 'node:url';
import tailwindcssAnimate from 'tailwindcss-animate';

// Same tokens as bitsocial-web's about and chain sites, so the forum reads as part of bitsocial.net.
export default {
  darkMode: ['class'],
  content: [fileURLToPath(new URL('./index.html', import.meta.url)), fileURLToPath(new URL('./src/**/*.{js,ts,jsx,tsx}', import.meta.url))],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#121218',
        'bg-secondary': '#0c0c10',
        'blue-core': '#1a4fd0',
        'blue-glow': '#2563eb',
        'silver-dark': '#2f3336',
        'silver-mid': '#9ca3af',
        'silver-bright': '#e5e7eb',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        display: ['Exo', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '3xl': '1.5rem',
        '2xl': '1.25rem',
        xl: '1rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
