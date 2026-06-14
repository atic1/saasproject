/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        gray: {
          850: '#1a2234',
          925: '#0d1117',
          950: '#0a0f1a',
        }
      },
      animation: {
        'spin-slow':   'spin 2s linear infinite',
        'slide-up':    'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':     'fadeIn 0.25s ease both',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
