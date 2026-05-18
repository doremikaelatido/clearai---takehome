/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  spacing: {
    fluid: 'clamp(1rem, 2vw, 2.5rem)',
  },
  plugins: [],
};
