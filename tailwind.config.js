/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fretly dark mode palette — brand brief confirmed
        bg: '#12111C',
        primary: '#6B5CE7',
        secondary: '#2A2545',
        accent: '#EF9F27',
        'accent-muted': '#2E2510',
        surface: '#1E1B30',
        'text-primary': '#F0EEF8',
        'text-secondary': '#8B84B0',
        'text-tertiary': '#3D3860',
        border: 'rgba(255, 255, 255, 0.07)',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        // Display scale — Syne
        'display-xl': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-sm': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '500' }],
        // UI scale — DM Sans
        'ui-lg': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'ui-md': ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        'ui-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'ui-xs': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        // 4-pt grid base
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '100': '25rem',
        '120': '30rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(107, 92, 231, 0.25)',
        'glow-primary': '0 0 32px rgba(107, 92, 231, 0.35)',
        'glow-accent': '0 0 24px rgba(239, 159, 39, 0.4)',
        'inner-top': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        // Gradient used behind the daily song card
        'radial-primary': 'radial-gradient(ellipse at 50% 0%, rgba(107,92,231,0.25) 0%, transparent 70%)',
        'radial-accent': 'radial-gradient(ellipse at 50% 100%, rgba(239,159,39,0.15) 0%, transparent 60%)',
        'surface-gradient': 'linear-gradient(180deg, #1E1B30 0%, #12111C 100%)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '250': '250ms',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
