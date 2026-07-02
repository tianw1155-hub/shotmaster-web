/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B6B',
          light: '#FF8E8E',
          dark: '#E05555',
        },
        mint: {
          DEFAULT: '#4ECDC4',
          light: '#7DDDD5',
          dark: '#3BB5AC',
        },
        sun: {
          DEFAULT: '#FFE66D',
          light: '#FFF099',
          dark: '#E5CE56',
        },
        sky: {
          DEFAULT: '#6C9ECA',
          light: '#8FB5D9',
          dark: '#5A87B0',
        },
        grape: {
          DEFAULT: '#A78BFA',
          light: '#BDA5FB',
          dark: '#8F72E0',
        },
        surface: {
          DEFAULT: '#F8F9FA',
          card: '#FFFFFF',
          muted: '#F0F1F3',
          dark: '#2D3142',
        },
        ink: {
          DEFAULT: '#2D3142',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        'flame': 'flame 1.5s ease-in-out infinite',
        'star-pop': 'starPop 0.4s ease-out',
        'confetti': 'confetti 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '70%': { transform: 'scale(1.3)', opacity: '0' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        flame: {
          '0%, 100%': { transform: 'scale(1) rotate(-2deg)' },
          '50%': { transform: 'scale(1.1) rotate(2deg)' },
        },
        starPop: {
          '0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0' },
          '60%': { transform: 'scale(1.3) rotate(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateY(200px) rotate(360deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
