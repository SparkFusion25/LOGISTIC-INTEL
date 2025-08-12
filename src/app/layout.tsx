import type { Metadata } from 'next'
import '@/styles/globals.css'
import Providers from '@/components/Providers'
import ClientErrorHooks from '@/components/ClientErrorHooks'

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
          {/* Client error hooks for better runtime diagnostics */}
          <ClientErrorHooks />
          {children}
        </Providers>
      </body>
    </html>
  )
}
