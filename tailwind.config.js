/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: { center: true },
    extend: {
      colors: {
        surface: { DEFAULT: '#F2F2EF', card: '#FFFFFF', muted: '#EDEDEA' },
        ink: { DEFAULT: '#14161A', secondary: '#3A3D44', muted: '#6B6E76' },
        accent: { DEFAULT: '#6E2233', soft: '#9A4A55' },
        line: '#E2E2DE',
        success: '#2D784B',
        warning: '#A05014',
        danger: '#9A2A2A',
        gold: '#B8954A',
        chapter: {
          composition: '#6B8E7F',
          light: '#C9A24A',
          color: '#9B6B8A',
          narrative: '#6B7B95',
          master: '#A56B5A',
        },
        // 兼容旧令牌名 → 重映射到新色值，避免未迁移页面失色（阶段 2 替换为新令牌后删除）
        primary: { DEFAULT: '#6E2233', light: '#9A4A55', dark: '#4A1622' },
        mint: { DEFAULT: '#6B8E7F', light: '#9DB5A8', dark: '#4F6E61' },
        sun: { DEFAULT: '#C9A24A', light: '#DDB968', dark: '#9A7A36' },
        sky: { DEFAULT: '#6B7B95', light: '#949FB2', dark: '#525F73' },
        grape: { DEFAULT: '#9B6B8A', light: '#B893A8', dark: '#735066' },
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '4px', DEFAULT: '6px', md: '8px', lg: '12px', xl: '16px', '2xl': '20px',
      },
      boxShadow: {
        hairline: 'inset 0 0 0 1px #E2E2DE',
        elevated: '0 1px 2px rgba(20,22,26,.04), 0 8px 24px rgba(20,22,26,.06)',
        focus: '0 0 0 3px rgba(110,34,51,.28)',
      },
      transitionDuration: { fast: '140ms', base: '220ms', slow: '380ms', scenic: '600ms' },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(.22,1,.36,1)',
        soft: 'cubic-bezier(.65,0,.35,1)',
      },
      keyframes: {
        pulseRing: { '0%': { transform: 'scale(.95)', opacity: '.8' }, '70%': { transform: 'scale(1.3)', opacity: '0' }, '100%': { transform: 'scale(.95)', opacity: '0' } },
        starPop: { '0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0' }, '60%': { transform: 'scale(1.3) rotate(5deg)', opacity: '1' }, '100%': { transform: 'scale(1) rotate(0)', opacity: '1' } },
      },
      animation: {
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        'star-pop': 'starPop .4s ease-out',
      },
    },
  },
  plugins: [],
};