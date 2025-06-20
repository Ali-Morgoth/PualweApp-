/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Ajusta la ruta según tu estructura
  ],
  theme: {
    extend: {
      animation: {
        'loader-spin': 'loader-spin 2s linear infinite',
        'loader-spin-reverse': 'loader-spin 2s linear infinite reverse',
      },
      keyframes: {
        'loader-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotateY(180deg)' },
          '100%': { transform: 'rotateX(180deg)' },
        },
      },
    },
  },
  plugins: [],
};
