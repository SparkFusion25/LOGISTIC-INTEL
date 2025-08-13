import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4F46E5',
          primaryHover: '#4338CA',
          secondary: '#10B981',
          secondaryHover: '#059669',
          danger: '#E11D48',
          dangerHover: '#BE123C',
          ink: '#0B1220',
          muted: '#475569'
        },
        chart: {
          blue:   '#3B82F6',
          teal:   '#14B8A6',
          amber:  '#F59E0B',
          purple: '#8B5CF6',
          rose:   '#F43F5E',
          slate:  '#64748B'
        }
      },
      borderRadius: { xl: '14px', '2xl': '20px' },
      boxShadow: {
        card: '0 2px 12px rgba(2,6,23,0.06)',
        cardHover: '0 6px 18px rgba(2,6,23,0.10)'
      }
    }
  },
  plugins: []
}

export default config