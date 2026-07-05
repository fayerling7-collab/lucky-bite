import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 马卡龙色板
        sky: {
          soft: '#A8D8F0',
          deep: '#7BC4E8',
        },
        cream: '#FFF8EC',
        blush: '#FFD6E0',
        butter: '#FFE9A8',
        mint: '#BDEBD0',
        lavender: '#D9C8F0',
        coral: '#FFB5A7',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(168, 216, 240, 0.25)',
        'soft-lg': '0 12px 40px rgba(168, 216, 240, 0.35)',
        'inner-soft': 'inset 0 2px 8px rgba(255, 255, 255, 0.6)',
        pop: '0 6px 0 0 rgba(168, 216, 240, 0.5)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.03)', opacity: '1' },
        },
        scrollDown: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        scrollUp: {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        breathe: 'breathe 4s ease-in-out infinite',
        'scroll-down': 'scrollDown 40s linear infinite',
        'scroll-up': 'scrollUp 40s linear infinite',
        sparkle: 'sparkle 3s ease-in-out infinite',
        wiggle: 'wiggle 0.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
