/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#080808',
          900: '#0D0D0D',
          800: '#131313',
          700: '#1A1A1A',
          600: '#232323',
          500: '#2E2E2E',
        },
      },
    },
  },
  plugins: [],
}
