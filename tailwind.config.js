/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['"DM Mono"', 'monospace'],
      },
      colors: {
        page: '#000000',
        card: '#0F0F0F',
        border: '#1A1A1A',
        orange: '#FF4500',
        gold: '#F5C542',
        muted: '#444444',
        success: '#22C55E',
        purple: '#A855F7',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
}
