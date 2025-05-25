/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF4500',    // Bright orange-red
        secondary: '#00BFFF',  // Deep sky blue
        accent: '#FF1493',     // Deep pink
        highlight: '#32CD32',  // Lime green
        background: '#FFFFFF', // White
        text: '#000000',       // Black
        faqBg: '#F8F9FA',      // Light gray
        faqBorder: '#D8DEE4',  // Light blue-gray
        faqHover: '#ECEFF1',   // Dark-light blue-gray
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

