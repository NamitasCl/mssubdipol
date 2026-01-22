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
        }
      }
    },
  },
  plugins: [],
}
