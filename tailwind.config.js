/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: '#0A0C12',
        surface: '#11151D',
        card: '#161C24',
        glow: '#00E5FF',     // primary — cyan
        accent: '#A78BFA',   // violet — highlights/brand gradient
        rose: '#FF4D8D',     // hot pink — accents
        urgent: '#FFB800',   // amber — saved/urgency
        ink: '#F1F5F9',
        muted: '#8896AB',
        edge: 'rgba(120, 180, 255, 0.10)',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        glow: '0 0 24px rgba(0, 229, 255, 0.35)',
        glowSoft: '0 0 14px rgba(0, 229, 255, 0.22)',
        violet: '0 0 22px rgba(167, 139, 250, 0.40)',
        urgent: '0 0 18px rgba(255, 184, 0, 0.32)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        likePop: { '0%': { transform: 'scale(1)' }, '35%': { transform: 'scale(1.45) rotate(-8deg)' }, '70%': { transform: 'scale(0.9) rotate(4deg)' }, '100%': { transform: 'scale(1) rotate(0)' } },
        ringSpin: { to: { transform: 'rotate(360deg)' } },
        checkPop: { '0%': { transform: 'scale(0)', opacity: '0' }, '60%': { transform: 'scale(1.25)', opacity: '1' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        toastIn: { '0%': { transform: 'translateY(24px) scale(0.95)', opacity: '0' }, '100%': { transform: 'translateY(0) scale(1)', opacity: '1' } },
        breathe: { '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' }, '50%': { transform: 'scale(1.12)', filter: 'brightness(1.3)' } },
        slideUp: { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        glowPulse: { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
      },
      animation: {
        likePop: 'likePop 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        ringSpin: 'ringSpin 0.7s linear infinite',
        checkPop: 'checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        toastIn: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        breathe: 'breathe 3s ease-in-out infinite',
        slideUp: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        glowPulse: 'glowPulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
