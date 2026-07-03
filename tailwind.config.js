/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: { center: true },
    extend: {
      colors: {
        surface: { DEFAULT: '#F7F6F2', card: '#FBFAF7', muted: '#EFEDE6' },
        ink: { DEFAULT: '#1A1A1A', secondary: '#3D3D3A', muted: '#8A8A86' },
        accent: { DEFAULT: '#B14A3A', soft: '#C76A5C' },
        gold: '#9A7B3A',
        line: '#E6E4DE',
        success: '#4A7A5C',
        warning: '#B0894A',
        danger: '#A8412E',
        chapter: { composition: '#6B8E7F', light: '#B0894A', color: '#8E7AA0', narrative: '#5E7AA0', master: '#A56B5A' },
        // 兼容旧令牌 → 重映射（去 AI 味，非切片页不失色）
        primary: { DEFAULT: '#B14A3A', light: '#C76A5C', dark: '#8A3528' },
        mint: { DEFAULT: '#8A8A86', light: '#A6A6A2', dark: '#5E5E5A' },
        sun: { DEFAULT: '#9A7B3A', light: '#B89A55', dark: '#765C2A' },
        sky: { DEFAULT: '#5E7AA0', light: '#7E94B4', dark: '#465E80' },
        grape: { DEFAULT: '#8A8A86', light: '#A6A6A2', dark: '#5E5E5A' },
      },
      fontFamily: {
        display: ['Geist', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        body: ['Geist', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px', DEFAULT: '6px', md: '8px', lg: '12px', xl: '16px', '2xl': '20px',
      },
      boxShadow: {
        hairline: 'inset 0 0 0 1px #E2E2DE',
        elevated: '0 1px 2px rgba(20,22,26,.04), 0 8px 24px rgba(20,22,26,.06)',
        focus: '0 0 0 3px rgba(177,74,58,.24)',
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