import type { Config } from 'tailwindcss';

const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        organization: {
          50: '#f0fdf4',
          500: '#22c55e',
          900: '#166534',
        },
        inspiration: {
          50: '#fdf2f8',
          500: '#ec4899',
          900: '#831843',
        },
        entertainment: {
          50: '#fdf4f5',
          500: '#f43f5e',
          900: '#4c0519',
        },
        wellbeing: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c2d4a',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
