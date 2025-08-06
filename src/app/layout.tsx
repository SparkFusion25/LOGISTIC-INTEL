import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Logistic Intel - Admin Portal',
  description: 'Admin portal for managing Logistic Intel platform users, campaigns, and analytics',
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