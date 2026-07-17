/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D1B69', // Bleu marine (inspiré Voyey)
        secondary: '#FF9500', // Orange
        accent: '#4A90E2',
      },
    },
  },
  plugins: [],
}
