/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bitcoin: '#f7931a',
      },
      fontFamily: {
        sans: ['Instrument Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}