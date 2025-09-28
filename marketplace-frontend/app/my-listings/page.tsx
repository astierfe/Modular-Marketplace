// app/my-listings/page.tsx - RefactorisÃ© + Bundle Optimized + Refresh
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import dynamic from 'next/dynamic'
import { useListings, useUserMarketplaceData } from '@/hooks'
import { MarketplaceHeader } from '../../components/marketplace/MarketplaceHeader'
import '../../styles/globals.css'
import './mylistings.css'

// âœ… Dynamic import for NFTCard (lazy loading)
const NFTCard = dynamic(
  () => import('../../components/marketplace/NFTCard').then(mod => ({ default: mod.NFTCard })),
  {
    loading: () => (
      <div className="skeleton-card skeleton">
        <div className="skeleton-image" />
        <div className="skeleton-content">
          <div className="skeleton-line skeleton-line--medium" />
          <div className="skeleton-line skeleton-line--short" />
        </div>
      </div>
    ),
    ssr: false,
  }
)

export default function MyListingsPage() {
  const [mounted, setMounted] = useState(false)
  const { isConnected} = useAccount()
  const { userListingIds = [], refetch } = useListings()  // ✅ AJOUT refetch
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

  if (!isConnected) {
    return (
      <div className="page-container">
        <MarketplaceHeader />
        <div className="centered-content">
          <p className="not-connected-message">
            Please connect your wallet to view your listings
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <MarketplaceHeader />

      <div className="page-content">
        
        {/* Header */}
        <div className="header-spacing">
          <div className="page-header">
            <div>
              <h1 className="page-title">My Listings</h1>
              <p className="page-subtitle">
                NFTs you have listed for sale
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="card card-shadow-lg">
          <div className="stats-grid stats-grid-2">
            <div className="stat-item">
              <p className="stat-value stat-value--purple">
                {userData.activeListingsCount}
              </p>
              <p className="stat-label">Active Listings</p>
            </div>
            <div className="stat-item">
              <p className="stat-value stat-value--green">
                {userData.proceedsETH}
              </p>
              <p className="stat-label">ETH Available</p>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div>
          <h2 className="section-title">
            {userData.activeListingsCount} Active Listing{userData.activeListingsCount !== 1 ? 's' : ''}
          </h2>
          
          {userData.activeListingsCount === 0 ? (
            <div className="empty-state">
              <p className="empty-state-icon">📋</p>
              <h3 className="empty-state-title">No Active Listings</h3>
              <p className="empty-state-message">
                List your NFTs on the marketplace to start selling!
              </p>
            </div>
          ) : (
            <div className="responsive-grid">
              {Array.isArray(userListingIds) && userListingIds.map((tokenId: bigint) => (
                <NFTCard key={tokenId.toString()} tokenId={Number(tokenId)} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}