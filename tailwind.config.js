/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#09090f',
          900: '#0F0F17',
          800: '#17172A',
          700: '#1F1F35',
          600: '#2A2A45',
          500: '#363655',
        },
      },
    },
  },
  plugins: [],
}
