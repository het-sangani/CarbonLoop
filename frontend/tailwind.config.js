/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        carbon: {
          50: '#f6f7f9',
          100: '#edeef2',
          200: '#d7dbe2',
          300: '#b4bccb',
          400: '#8c97b0',
          500: '#6f7b97',
          600: '#58627e',
          700: '#474f66',
          800: '#3c4255',
          900: '#1e222e',
          950: '#0d1017',
        },
        emerald: {
          450: '#10b981',
          550: '#059669',
        },
        teal: {
          450: '#14b8a6',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': "radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-pattern': '24px 24px',
      }
    },
  },
  plugins: [],
}
