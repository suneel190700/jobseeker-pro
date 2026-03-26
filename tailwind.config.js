module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {0:'#09090b',1:'#111113',2:'#18181b',3:'#27272a'},
        accent: {50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',400:'#34d399',500:'#10b981',600:'#059669'},
      },
      boxShadow: {
        'glow':'0 0 20px -4px rgba(99,102,241,0.25)',
        'glow-sm':'0 0 10px -2px rgba(99,102,241,0.2)',
        'card':'0 1px 2px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};
