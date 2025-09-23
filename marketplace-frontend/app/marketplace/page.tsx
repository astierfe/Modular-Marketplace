// app/marketplace/page.tsx - Refactorisé + Bundle Optimized + Auto-refetch
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import dynamic from 'next/dynamic'
import { useListings, useUserMarketplaceData } from '@/hooks'
import { MarketplaceHeader } from '../../components/marketplace/MarketplaceHeader'
import '../../styles/globals.css'
import './marketplace.css'

// ✅ Dynamic imports for heavy components (lazy loading)
const NFTGrid = dynamic(
  () => import('../../components/marketplace/NFTGrid').then(mod => ({ default: mod.NFTGrid })),
  {
    loading: () => (
      <div className="responsive-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-card skeleton">
            <div className="skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-line--medium" />
              <div className="skeleton-line skeleton-line--short" />
            </div>
          </div>
        ))}
      </div>
    ),
    ssr: false,
  }
)

const UserStats = dynamic(
  () => import('../../components/marketplace/UserStats').then(mod => ({ default: mod.UserStats })),
  { 
    ssr: false,
    loading: () => <div className="skeleton-card skeleton" style={{ height: '150px' }} />
  }
)

export default function MarketplacePage() {
  const [mounted, setMounted] = useState(false)
  const { isConnected } = useAccount()
  
  const { activeListingIds, stats, isLoading, refetch } = useListings()
  const listingIds = (activeListingIds || []) as readonly bigint[]
  
  const userData = useUserMarketplaceData()

  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ AJOUT : Refetch automatique quand on arrive sur la page
  useEffect(() => {
    if (mounted && isConnected) {
      refetch()
    }
  }, [mounted, isConnected, refetch])

  if (!mounted) return null

  return (
    <div className="page-container">
      <MarketplaceHeader />

      <div className="page-content">
        
        {/* Hero Section */}
        <div className="marketplace-hero">
          <h1 className="gradient-title">ModularNFT Marketplace</h1>
          <p className="marketplace-hero-subtitle">
            Discover, buy and sell unique NFTs from the ModularNFT collection
          </p>
        </div>

        {/* Stats Overview */}
        {isConnected && (
          <div className="card card-shadow-lg">
            <div className="stats-grid stats-grid-4">
              <div className="stat-item">
                <p className="stat-value stat-value--blue">
                  {stats?.totalListings ?? 0}
                </p>
                <p className="stat-label">Total Listings</p>
              </div>
              <div className="stat-item">
                <p className="stat-value stat-value--purple">
                  {userData.nftBalance}
                </p>
                <p className="stat-label">Your NFTs</p>
              </div>
              <div className="stat-item">
                <p className="stat-value stat-value--green">
                  {userData.activeListingsCount}
                </p>
                <p className="stat-label">Your Listings</p>
              </div>
              <div className="stat-item">
                <p className="stat-value stat-value--orange">
                  {userData.proceedsETH}
                </p>
                <p className="stat-label">ETH Available</p>
              </div>
            </div>
          </div>
        )}

        {/* User Stats Card - Lazy loaded */}
        {isConnected && (userData.hasProceeds || userData.activeListingsCount > 0) && (
          <UserStats userData={userData} />
        )}

        {/* Main Content */}
        <div className="section-spacing">
          <div className="page-header">
            <h2 className="page-header-title">
              {isLoading ? 'Loading...' : `${listingIds.length} NFTs Available`}
            </h2>
            <button onClick={refetch} className="btn btn-primary">
              🔄 Refresh
            </button>
          </div>

          {/* NFT Grid - Lazy loaded */}
          <NFTGrid listingIds={listingIds} isLoading={isLoading} />

          {!isLoading && listingIds.length === 0 && (
            <div className="empty-state">
              <p className="empty-state-icon">📦</p>
              <h3 className="empty-state-title">No NFTs Listed Yet</h3>
              <p className="empty-state-message">
                Be the first to list your ModularNFT for sale!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}