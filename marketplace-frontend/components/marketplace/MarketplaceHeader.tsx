// components/marketplace/MarketplaceHeader.tsx - Refactorisé avec classes sémantiques
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './marketplace-components.css'
import Image from 'next/image' 

export function MarketplaceHeader() {
  const pathname = usePathname()

  const navLinks = [
    { href: '/marketplace', label: 'Marketplace', icon: '🏪' },
    { href: '/my-nfts', label: 'My NFTs', icon: '🖼️' },
    { href: '/my-listings', label: 'My Listings', icon: '📋' },
  ]

  return (
    <header className="marketplace-header">
      <div className="marketplace-header-container">
        <div className="marketplace-header-content">
          
          {/* Logo */}
          <Link href="/marketplace" className="marketplace-logo">
<div className="marketplace-logo-icon">
  <Image 
    src="/logo_modularMarketplace.png"  // ou "/logo.png"
    alt="Logo"
    width={40}
    height={40}
  />
</div>
            <span className="marketplace-logo-text">ModularNFT Maketplace</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="marketplace-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname === link.href
                    ? 'marketplace-nav-link marketplace-nav-link--active'
                    : 'marketplace-nav-link marketplace-nav-link--inactive'
                }
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Wallet Connect */}
          <div className="marketplace-wallet">
            <ConnectButton showBalance={false} />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="marketplace-mobile-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? 'marketplace-mobile-link marketplace-mobile-link--active'
                  : 'marketplace-mobile-link marketplace-mobile-link--inactive'
              }
            >
              <span className="marketplace-mobile-link-icon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}