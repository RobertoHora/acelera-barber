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
          amber: '#F59E0B',
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
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        google: ['Roboto', 'Inter', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      animation: {
        shimmer: 'shimmer 4s ease-in-out infinite',
        pulseSlow: 'pulseSlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
