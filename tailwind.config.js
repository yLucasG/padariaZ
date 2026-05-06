/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wheat: {
          50: '#FFFDF0',
          100: '#FFF8D6',
          200: '#FFEEA3',
          300: '#FFE070',
          400: '#FFD03D',
          500: '#E8B931',
          600: '#C99A1D',
          700: '#A07614',
          800: '#7A5A10',
          900: '#5C430D',
        },
        coffee: {
          50: '#F5EFEB',
          100: '#E8D5C4',
          200: '#D4B896',
          300: '#B8916A',
          400: '#9C7049',
          500: '#7B5B3A',
          600: '#5D4037',
          700: '#4A2C2A',
          800: '#3E2723',
          900: '#2C1A17',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
