/** @type {import('tailwindcss').Config} */
module.exports = {
  // This tells Tailwind where to find the classes it needs to process
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors based on your brand palette (Deep Navy and Metallic Gold)
        'esdras-navy': '#001F3F',
        'esdras-gold': '#B8860B',
      },
    },
  },
  plugins: [],
}
