/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:'#EDF2FB',100:'#D0D9F6',200:'#A1B3EE',300:'#728DE6',400:'#4367DE',
          500:'#1541D6',600:'#1135AD',700:'#0D297F',800:'#091B51',900:'#050C26',
        },
        accent: '#2971FF',
        secondary: '#9333EA',
        surface: '#F3F4F6',
        onSurface: '#374151',
        success: '#10B981',
      },
      fontFamily: { sans: ['Inter','ui-sans-serif','system-ui'] },
      maxWidth: { 'screen-wider': '1600px' },
    },
  },
  plugins: [],
}