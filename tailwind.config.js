/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        craft: {
          50: '#fdf8f4',
          100: '#f9eee4',
          200: '#f3dbcb',
          300: '#e9c1a5',
          400: '#dc9f77',
          500: '#cf7e51',
          600: '#be633b',
          700: '#9e4e31',
          800: '#7e402d',
          900: '#673628',
          950: '#381a13',
        },
        terracotta: {
          DEFAULT: '#C85A32',
          light: '#E07A5F',
          dark: '#9E3D1B'
        },
        indigoHeritage: {
          DEFAULT: '#1D3557',
          light: '#457B9D',
          dark: '#0E1D33'
        },
        turmeric: {
          DEFAULT: '#E9C46A',
          light: '#F4A261',
          dark: '#D49B22'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Rozha One"', 'serif'],
        traditional: ['"Yatra One"', 'cursive', 'sans-serif']
      }
    },
  },
  plugins: [],
}
