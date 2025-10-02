// app/layout.tsx - Layout principal avec overlay global
import '../styles/globals.css'
import { Providers } from './providers'
import { GlobalTransactionOverlay } from '@/components/ui/GlobalTransactionOverlay' // ✅ NOUVEAU
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Footer } from '../components/ui/Footer' // Import du Footer

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ModularNFT Marketplace',
  description: 'Buy and sell ModularNFT collection on Sepolia testnet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
          {/* ✅ OVERLAY GLOBAL - Visible sur toutes les pages */}
          <GlobalTransactionOverlay />

        <Footer />
        </Providers>        
      </body>
    </html>
  )
}