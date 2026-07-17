/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#faf7f2',
          100: '#f4ecdf',
          200: '#e8d8c0',
          300: '#d9bd9a',
          400: '#c79d72',
          500: '#b58152',
          600: '#a06a42',
          700: '#835436',
          800: '#6b4430',
          900: '#573828',
          950: '#321f17',
        },
        blush: {
          50: '#fdf5f6',
          100: '#fce9ec',
          200: '#fad3d9',
          300: '#f6b0bc',
          400: '#ef8395',
          500: '#e35d74',
          600: '#c93d57',
          700: '#a82d46',
          800: '#8a273c',
          900: '#722436',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        ink: {
          50: '#faf9f7',
          100: '#f3f1ec',
          200: '#e7e3da',
          300: '#d3ccc0',
          400: '#a8a094',
          500: '#7a7268',
          600: '#5d564d',
          700: '#47413a',
          800: '#2f2b26',
          900: '#1c1916',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.35s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.6s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
