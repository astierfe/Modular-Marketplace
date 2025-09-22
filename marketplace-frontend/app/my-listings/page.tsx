// app/my-listings/page.tsx - Page My Listings refactorisée
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useListings, useUserMarketplaceData } from '@/hooks'
import { MarketplaceHeader } from '../../components/marketplace/MarketplaceHeader'
import { NFTCard } from '../../components/marketplace/NFTCard'
import '../../styles/globals.css'
import './mylistings.css'

export default function MyListingsPage() {
  const [mounted, setMounted] = useState(false)
  const { isConnected, address } = useAccount()
  const { userListingIds = [] } = useListings()
  const userData = useUserMarketplaceData()

  useEffect(() => {
    setMounted(true)
  }, [])

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
          <h1 className="page-title">My Listings</h1>
          <p className="page-subtitle">
            NFTs you have listed for sale
          </p>
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