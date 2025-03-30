/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pokemon-red': '#ff1c1c',
        'pokemon-blue': '#3c5aa6',
        'pokemon-yellow': '#ffcb05',
        'pokemon-gold': '#d5a100',
        'pokemon-dark': '#1e1e1e',
        'pokemon-light': '#f2f2f2',
        'pokemon-grass': '#78c850',
        'pokemon-fire': '#f08030',
        'pokemon-water': '#6890f0',
        'pokemon-electric': '#f8d030',
      },
      backgroundColor: {
        'card': 'rgba(255, 255, 255, 0.1)',
      },
      borderColor: {
        'card': 'rgba(255, 255, 255, 0.2)',
      },
      boxShadow: {
        'pokemon': '0 4px 12px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
} 