module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 40px -12px rgba(44, 224, 196, 0.35), 0 0 0 1px rgba(255,255,255,0.06)',
        'glow-sm': '0 0 24px -8px rgba(44, 224, 196, 0.22)',
      },
    },
  },
  plugins: [],
};
