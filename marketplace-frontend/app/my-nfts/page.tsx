// app/my-nfts/page.tsx - Page My NFTs refactorisée
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useUserMarketplaceData, useMarketplaceApproval } from '@/hooks'
import { MarketplaceHeader } from '../../components/marketplace/MarketplaceHeader'
import { ApprovalState } from '@/lib/types/marketplaceTypes'
import '../../styles/globals.css'
import './mynfts.css'

export default function MyNFTsPage() {
  const [mounted, setMounted] = useState(false)
  const { isConnected, address } = useAccount()
  const userData = useUserMarketplaceData()
  const { isApproved, approve, isApproving } = useMarketplaceApproval()

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
          <h1 className="page-title">My NFTs</h1>
          <p className="page-subtitle">
            NFTs owned by {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
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
          
          {userData.nftBalance === 0 ? (
            <div className="empty-state">
              <p className="empty-state-icon">🎨</p>
              <h3 className="empty-state-title">No NFTs Yet</h3>
              <p className="empty-state-message">
                Mint or buy your first ModularNFT to get started!
              </p>
            </div>
          ) : (
            <div className="collection-info">
              <p className="collection-info-text">
                You own {userData.nftBalance} NFT{userData.nftBalance !== 1 ? 's' : ''} from the ModularNFT collection.
              </p>
              <p className="collection-info-note">
                NFT listing interface coming soon in Phase 3C final updates!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}