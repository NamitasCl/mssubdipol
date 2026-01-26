/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors if needed, e.g. PDI blue
        pdi: {
          base: '#2a4d7c',
          medio: '#4f7eb9',
          claro: '#b1cfff',
          sidebar: '#eaf4fb',
          gris: '#f8fbfd',
          texto: '#22334a',
          dorado: '#ffe8a3',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#4f7eb9', // pdi.medio
          500: '#0ea5e9',
          600: '#2a4d7c', // pdi.base (Used for main buttons)
          700: '#0369a1',
          800: '#075985',
          900: '#1e3a8a', // Darker blue
        },
        secondary: {
          400: '#ffe8a3', // pdi.dorado
          500: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
