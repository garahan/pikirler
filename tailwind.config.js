/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: '#0B0E14',
        card: '#161C24',
        cyan: '#00E5FF',
        amber: '#FFB800',
        textMain: '#F1F5F9',
        textSecondary: '#8896AB',
        borderGlow: 'rgba(0, 229, 255, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 229, 255, 0.3)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        particle: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '100%': { transform: 'scale(2)', opacity: 0 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        breathe: 'breathe 2s ease-in-out infinite',
        particle: 'particle 0.4s ease-out forwards',
        slideDown: 'slideDown 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
