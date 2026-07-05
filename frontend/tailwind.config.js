/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx}",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#7C3AED',
        background: '#0F0F1A',
        surface: '#1A1A2E',
        border: '#2D2D5E',
      }
    },
  },
  plugins: [],
}