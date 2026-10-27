import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        orc: {
          ink: 'rgb(var(--orc-ink-rgb) / <alpha-value>)',
          navy: 'rgb(var(--orc-navy-rgb) / <alpha-value>)',
          sky: 'rgb(var(--orc-sky-rgb) / <alpha-value>)',
          amber: 'rgb(var(--orc-amber-rgb) / <alpha-value>)',
          text: 'rgb(var(--orc-text-primary-rgb) / calc(var(--orc-text-primary-opacity) * <alpha-value>))',
          muted: 'rgb(var(--orc-text-secondary-rgb) / calc(var(--orc-text-secondary-opacity) * <alpha-value>))',
          border: 'rgb(var(--orc-border-rgb) / calc(var(--orc-border-opacity) * <alpha-value>))',
          elevated: 'rgb(var(--orc-surface-elevated-rgb) / <alpha-value>)',
        },
        brand: {
          bg: '#19181D',
          card: '#2B2B29',
          cardInner: '#242422',
          border: '#3D3C3A',
          borderLight: '#454441',
          accent: '#EFECE5',
          accentHover: '#E2DED6',
          textMuted: '#A1A1AA',
          textSub: '#D4D4D8',
          amber: '#F59A2F',
        },
        google: {
          blue: '#1A73E8',
          hoverBlue: '#1557B0',
          white: '#FFFFFF',
          grayBg: '#F8F9FA',
          grayBorder: '#DADCE0',
          textDark: '#202124',
          textMuted: '#5F6368',
          buttonBg: '#F1F3F4',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-studio-sans)',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        display: [
          'var(--font-studio-display)',
          'serif',
        ],
        google: ['Roboto', 'Inter', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'text-shimmer': {
          '0%, 100%': { backgroundPosition: '100% 50%' },
          '50%': { backgroundPosition: '0% 50%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'shine-sweep': {
          '0%': { transform: 'translateX(-150%) skewX(-20deg)' },
          '41.1765%, 100%': { transform: 'translateX(250%) skewX(-20deg)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'text-shimmer': 'text-shimmer 4s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
        'shine-sweep': 'shine-sweep 4.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        pulseSlow: 'pulseSlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
