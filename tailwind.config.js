/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'rgba(99,102,241,0.1)',
          100: 'rgba(99,102,241,0.15)',
          200: 'rgba(99,102,241,0.25)',
          300: '#818cf8',
          400: '#818cf8',
          500: '#6366f1',
          600: '#6366f1',
          700: '#4f46e5',
          800: '#3730a3',
          900: '#312e81',
        },
      },
    },
  },
  plugins: [],
};
