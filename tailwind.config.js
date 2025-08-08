/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED', // A nice purple for primary actions
        secondary: '#1D4ED8', // A deep blue for secondary elements
        accent: '#FBBF24',   // Yellow for highlights like keywords
        success: '#10B981', // Green for success states
        danger: '#EF4444',  // Red for delete/error states
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // A clean, modern UI font
      },
    },
  },
  plugins: [],
};