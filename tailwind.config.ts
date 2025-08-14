import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // flat custom tokens so classes like ring-brand-primary/30 work
        'brand-primary': {
          DEFAULT: '#4F46E5',
          50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC',
          400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA',
          800: '#3730A3', 900: '#312E81',
        },
        'brand-secondary': {
          DEFAULT: '#059669',
          50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7',
          400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857',
          800: '#065F46', 900: '#064E3B',
        },
        'brand-danger': {
          DEFAULT: '#E11D48',
          50: '#FFF1F2', 100: '#FFE4E6', 200: '#FECDD3', 300: '#FDA4AF',
          400: '#FB7185', 500: '#F43F5E', 600: '#E11D48', 700: '#BE123C',
          800: '#9F1239', 900: '#881337',
        },
        // legacy tokens from JS config
        primary: {
          50:'#EDF2FB',100:'#D0D9F6',200:'#A1B3EE',300:'#728DE6',400:'#4367DE',
          500:'#1541D6',600:'#1135AD',700:'#0D297F',800:'#091B51',900:'#050C26',
        },
        accent: '#2971FF',
        secondary: '#9333EA',
        surface: '#F3F4F6',
        onSurface: '#374151',
        success: '#10B981',
        // surface tokens used in globals.css
        page: '#F8FAFC',
        border: '#E2E8F0',
        ink: '#0B1220',
        muted: '#475569',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 8px rgba(15, 23, 42, 0.06)',
        cardHover: '0 6px 20px rgba(15, 23, 42, 0.10)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      fontFamily: { sans: ['Inter','ui-sans-serif','system-ui'] },
      maxWidth: { 'screen-wider': '1600px' },
    },
  },
  plugins: [],
};

export default config;