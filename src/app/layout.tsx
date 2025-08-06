import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Logistic Intel - Trade Intelligence Platform',
  description: 'Global trade intelligence and CRM platform for logistics professionals',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' }
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-admin-bg text-admin-text antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}