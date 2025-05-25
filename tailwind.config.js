/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff4500',
        secondary: '#00bfff',
        accent: '#ff1493',
        highlight: '#32cd32',
        background: '#ffffff',
        text: '#000000',
        faqBg: '#f8f9fa',
        faqBorder: '#d8dee4',
        faqHover: '#eceff1',
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

