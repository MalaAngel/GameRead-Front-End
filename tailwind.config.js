/** GameRead design tokens (approximated from the Canva slides in /design). */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pink: { DEFAULT: '#EDB4E8', deep: '#D98BD3', soft: '#F6D8F3' },
        blue: { DEFAULT: '#C5E6FF', deep: '#8EC9F2', soft: '#E3F3FF' },
        cream: { DEFAULT: '#FFFBEA', dark: '#F1EAC9' },
        navy: { DEFAULT: '#0B4470', soft: '#3C6C94', faint: '#0B447014' },
        accent: { DEFAULT: '#5B6CFF', dark: '#3F4FE0' },
        stage: '#E9E4F0',
        ok: '#1F7A4D',
        warn: '#9A5B00',
        danger: '#B3261E',
      },
      fontFamily: {
        sans: ['Jost', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      borderRadius: { card: '28px', pill: '999px' },
      boxShadow: {
        soft: '0 6px 24px -8px rgba(11, 68, 112, 0.25)',
        window: '0 24px 60px -20px rgba(11, 68, 112, 0.45)',
      },
    },
  },
  plugins: [],
};
