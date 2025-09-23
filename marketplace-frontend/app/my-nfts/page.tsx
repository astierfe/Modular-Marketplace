// app/my-nfts/page.tsx - Version propre après étape 2
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useUserMarketplaceData, useMarketplaceApproval, useOwnedTokens, useListings } from '@/hooks'
import { MarketplaceHeader } from '../../components/marketplace/MarketplaceHeader'
import { NFTOwnerCard } from '../../components/marketplace/NFTOwnerCard'
import '../../styles/globals.css'
import './mynfts.css'

export default function MyNFTsPage() {
  const [mounted, setMounted] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)  // ✅ AJOUT pour forcer re-render
  const { isConnected, address } = useAccount()
  const userData = useUserMarketplaceData()
  const { isApproved, approve, isApproving } = useMarketplaceApproval()
  const { tokenIds, isLoading: isLoadingTokens, refetch: refetchTokens } = useOwnedTokens()
  const { refetch: refetchListings } = useListings()  // ✅ AJOUT pour refetch les listings

  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ Refetch automatique quand on arrive sur la page
  useEffect(() => {
    if (mounted && isConnected) {
      refetchTokens()
      refetchListings()
      setRefreshKey(prev => prev + 1)  // ✅ Force re-render des NFTOwnerCard
    }
  }, [mounted, isConnected, refetchTokens, refetchListings])

  if (!mounted) return null

  if (!isConnected) {
    return (
      <div className="page-container">
        <MarketplaceHeader />
        <div className="centered-content">
          <p className="not-connected-message">
            Please connect your wallet to view your NFTs
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
              <h1 className="page-title">My NFTs</h1>
              <p className="page-subtitle">
                NFTs owned by {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <button 
              onClick={() => {
                // Refresh les NFTs possédés ET les listings
                refetchTokens()
                refetchListings()
                setRefreshKey(prev => prev + 1)  // ✅ Force re-render
              }} 
              className="btn btn-primary"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="card card-shadow-lg">
          <div className="stats-grid stats-grid-3">
            <div className="stat-item">
              <p className="stat-value stat-value--blue">{userData.nftBalance}</p>
              <p className="stat-label">Total NFTs</p>
            </div>
            <div className="stat-item">
              <p className="stat-value stat-value--purple">
                {userData.activeListingsCount}
              </p>
              <p className="stat-label">Currently Listed</p>
            </div>
            <div className="stat-item">
              <p className="stat-value stat-value--green">
                {userData.nftBalance - userData.activeListingsCount}
              </p>
              <p className="stat-label">Available to List</p>
            </div>
          </div>
        </div>

        {/* Approval Section */}
        {!isApproved && (
          <div className="approval-card">
            <h3 className="approval-title">
              ⚠️ Marketplace Approval Required
            </h3>
            <p className="approval-message">
              To list your NFTs for sale, you need to approve the marketplace contract first.
            </p>
            <button
              onClick={approve}
              disabled={isApproving}
              className="btn btn-warning"
            >
              {isApproving ? 'Approving...' : 'Approve Marketplace'}
            </button>
          </div>
        )}

        {/* NFT Collection */}
        <div>
          <h2 className="section-title">Your Collection</h2>
          
          {isLoadingTokens ? (
            <div className="empty-state">
              <p className="empty-state-icon">⏳</p>
              <h3 className="empty-state-title">Loading NFTs...</h3>
              <p className="empty-state-message">
                Fetching your NFTs from the blockchain
              </p>
            </div>
          ) : tokenIds.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-icon">🎨</p>
              <h3 className="empty-state-title">No NFTs Yet</h3>
              <p className="empty-state-message">
                Mint or buy your first ModularNFT to get started!
              </p>
            </div>
          ) : (
            <div className="responsive-grid">
              {tokenIds.map((tokenId) => (
                <NFTOwnerCard 
                  key={`${tokenId}-${refreshKey}`} 
                  tokenId={tokenId}
                  onActionSuccess={() => setRefreshKey(prev => prev + 1)}  // ✅ Callback pour forcer refresh
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}