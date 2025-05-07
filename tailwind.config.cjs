/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#646cff',
        secondary: '#ff646c',
      },
      boxShadow: {
        card: '0 2px 6px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}; 