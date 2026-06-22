/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // NOTE: do NOT name these "cyan"/"amber" — those are built-in Tailwind
        // palettes and overriding them breaks every numbered shade (bg-cyan-500…).
        midnight: '#0B0E14',
        card: '#161C24',
        glow: '#00E5FF',
        urgent: '#FFB800',
        ink: '#F1F5F9',
        muted: '#8896AB',
        edge: 'rgba(0, 229, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(0, 229, 255, 0.35)',
        glowSoft: '0 0 12px rgba(0, 229, 255, 0.18)',
        urgent: '0 0 18px rgba(255, 184, 0, 0.30)',
      },
      transitionTimingFunction: {
        // the "satisfying" overshoot — settles past target then back
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        snap: 'cubic-bezier(0.2, 0.9, 0.3, 1.2)',
      },
      keyframes: {
        likePop: {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(1.45) rotate(-8deg)' },
          '70%': { transform: 'scale(0.9) rotate(4deg)' },
          '100%': { transform: 'scale(1) rotate(0)' },
        },
        burst: {
          '0%': { transform: 'translate(0,0) scale(0.4)', opacity: '1' },
          '100%': { transform: 'translate(var(--bx), var(--by)) scale(0)', opacity: '0' },
        },
        ringSpin: { to: { transform: 'rotate(360deg)' } },
        checkPop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.25)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        toastIn: {
          '0%': { transform: 'translateY(24px) scale(0.95)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.12)', filter: 'brightness(1.3)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        countRoll: {
          '0%': { transform: 'translateY(60%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        likePop: 'likePop 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        ringSpin: 'ringSpin 0.7s linear infinite',
        checkPop: 'checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        toastIn: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        breathe: 'breathe 3s ease-in-out infinite',
        slideUp: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        shimmer: 'shimmer 1.6s infinite',
        countRoll: 'countRoll 0.28s ease-out',
      },
    },
  },
  plugins: [],
};
