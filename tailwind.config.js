/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EDF2FB', 100: '#D0D9F6', 200: '#A1B3EE',
          300: '#728DE6', 400: '#4367DE', 500: '#1541D6',
          600: '#1135AD', 700: '#0D297F', 800: '#091B51', 900: '#050C26',
        },
        accent:    '#2971FF',
        secondary: '#9333EA',
        surface:   '#F3F4F6',
        onSurface: '#374151',
        success:   '#10B981',
        admin: {
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          text: '#334155',
          accent: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'screen-wider': '1600px',
      },
    },
  },
  plugins: [],
}