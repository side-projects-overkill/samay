/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Red Hat Brand Colors - Official palette
        'rh-red': {
          50: '#fef3f2',
          100: '#fee4e2',
          200: '#fececa',
          300: '#fcaaa5',
          400: '#f87872',
          500: '#ee4b2b',
          600: '#cc1f0c',
          700: '#a31b09',
          800: '#861b0d',
          900: '#6f1c11',
          DEFAULT: '#ee0000', // Red Hat Red
        },
        'rh-blue': {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7daff',
          300: '#a3c1ff',
          400: '#759dff',
          500: '#4f75ff',
          600: '#2b4ff5',
          700: '#1f3de1',
          800: '#1f35b6',
          900: '#1f338f',
          DEFAULT: '#0066cc', // Red Hat Blue
        },
        'rh-black': {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          DEFAULT: '#151515', // Red Hat Black
        },
        // PatternFly semantic colors
        'pf-blue': {
          50: '#e7f1fa',
          100: '#bee1f4',
          200: '#73bcf7',
          300: '#2b9af3',
          400: '#06c',
          500: '#004080',
          600: '#002952',
          DEFAULT: '#06c',
        },
        'pf-green': {
          50: '#f3faf2',
          100: '#bde5b8',
          200: '#95d58e',
          300: '#6ec664',
          400: '#5ba352',
          500: '#3e8635',
          600: '#1e4f18',
          DEFAULT: '#3e8635',
        },
        'pf-cyan': {
          50: '#f2f9f9',
          100: '#a2d9d9',
          200: '#73c5c5',
          300: '#009596',
          400: '#005f60',
          500: '#003737',
          DEFAULT: '#009596',
        },
        'pf-purple': {
          50: '#f9f0ff',
          100: '#cbc1ff',
          200: '#b2a3ff',
          300: '#a18fff',
          400: '#8476d1',
          500: '#6753ac',
          600: '#40199a',
          DEFAULT: '#6753ac',
        },
        'pf-gold': {
          50: '#fdf7e7',
          100: '#f9e0a2',
          200: '#f6d173',
          300: '#f0ab00',
          400: '#c58c00',
          500: '#795600',
          600: '#3d2c00',
          DEFAULT: '#f0ab00',
        },
        'pf-orange': {
          50: '#fff5ec',
          100: '#f4b678',
          200: '#ef9234',
          300: '#ec7a08',
          400: '#c46100',
          500: '#8f4700',
          600: '#773d00',
          DEFAULT: '#ec7a08',
        },
        'pf-red': {
          50: '#faeae8',
          100: '#c9190b',
          200: '#a30000',
          300: '#7d1007',
          400: '#470000',
          DEFAULT: '#c9190b',
        },
        // Shift status colors
        shift: {
          open: '#f0ab00',
          assigned: '#06c',
          confirmed: '#3e8635',
          inProgress: '#009596',
          completed: '#6d6d6d',
          cancelled: '#c9190b',
        },
        // Dark theme backgrounds
        'dark': {
          100: '#292929',
          200: '#212121',
          300: '#1b1b1b',
          400: '#151515',
          500: '#0f0f0f',
        }
      },
      fontFamily: {
        // Red Hat official fonts
        sans: ['Red Hat Display', 'Red Hat Text', 'system-ui', 'sans-serif'],
        display: ['Red Hat Display', 'system-ui', 'sans-serif'],
        text: ['Red Hat Text', 'system-ui', 'sans-serif'],
        mono: ['Red Hat Mono', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'rh': '0 1px 2px 0 rgba(21, 21, 21, 0.08), 0 1px 6px -1px rgba(21, 21, 21, 0.25)',
        'rh-lg': '0 4px 6px -1px rgba(21, 21, 21, 0.1), 0 2px 4px -2px rgba(21, 21, 21, 0.1)',
        'rh-xl': '0 20px 25px -5px rgba(21, 21, 21, 0.1), 0 8px 10px -6px rgba(21, 21, 21, 0.1)',
      },
      borderRadius: {
        'rh': '3px',
      },
    },
  },
  plugins: [],
}
