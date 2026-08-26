import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF5E9',
        ink: '#171512',
        coral: '#FF6F5E',
        sky: '#C9E8FF',
        yolk: '#FFD23F',
        saffron: '#FF9933',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '18px',
        btn: '12px',
      },
    },
  },
  plugins: [],
} satisfies Config;
