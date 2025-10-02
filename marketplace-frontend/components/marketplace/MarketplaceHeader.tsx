'use client'
import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useChainId } from 'wagmi'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { SupportModal } from '../ui/SupportModal'
import './marketplace-components.css'

export function MarketplaceHeader() {
const pathname = usePathname()
const chainId = useChainId()
const [showSupportModal, setShowSupportModal] = useState(false)

const navLinks = [{ href: '/marketplace', label: 'Marketplace', icon: '🪀' }, { href: '/my-nfts', label: 'My NFTs', icon: '🖼️' }, { href: '/my-listings', label: 'My Listings', icon: '📋' }]

const getNetworkName = () => {
switch (chainId) {
case 11155111: return 'Sepolia'
case 31337: return 'Anvil'
case 1: return 'Mainnet'
default: return 'Unknown'
}
}

const getNetworkColor = () => {
switch (chainId) {
case 11155111: return '#10B981'
case 31337: return '#F59E0B'
case 1: return '#3B82F6'
default: return '#6B7280'
}
}

return (
<>
<header className="marketplace-header">
<div className="marketplace-header-container">
<div className="marketplace-header-content">
<Link href="/marketplace" className="marketplace-logo">
<div className="marketplace-logo-icon">
<Image src="/logo_modularMarketplace.png" alt="Logo" width={40} height={40} />
</div>
<span className="marketplace-logo-text">ModularNFT Marketplace</span>
</Link>
<nav className="marketplace-nav">
{navLinks.map((link) => (
<Link key={link.href} href={link.href} className={pathname === link.href ? 'marketplace-nav-link marketplace-nav-link--active' : 'marketplace-nav-link marketplace-nav-link--inactive'}>
<span>{link.icon}</span>
<span>{link.label}</span>
</Link>
))}
</nav>
<div className="marketplace-wallet">
<button className="header-support-btn" onClick={() => setShowSupportModal(true)}>
<span>🎧</span>
<span>Support</span>
</button>
<div className="network-indicator">
<span className="network-dot" style={{ backgroundColor: getNetworkColor() }}></span>
<span className="network-name">{getNetworkName()}</span>
</div>
<ConnectButton showBalance={false} />
</div>
</div>
<nav className="marketplace-mobile-nav">
{navLinks.map((link) => (
<Link key={link.href} href={link.href} className={pathname === link.href ? 'marketplace-mobile-link marketplace-mobile-link--active' : 'marketplace-mobile-link marketplace-mobile-link--inactive'}>
<span className="marketplace-mobile-link-icon">{link.icon}</span>
<span>{link.label}</span>
</Link>
))}
</nav>
</div>
</header>
<SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
</>
)
}