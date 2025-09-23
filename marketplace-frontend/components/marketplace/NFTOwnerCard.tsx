// components/marketplace/NFTOwnerCard.tsx - Version finale avec auto-refresh
'use client'

import { useState } from 'react'
import { useListingById } from '@/hooks'
import { ListingModal } from './ListingModal'
import { DelistButton } from './DelistButton'
import './marketplace-components.css'

interface NFTOwnerCardProps {
  tokenId: number
  onActionSuccess?: () => void  // ✅ AJOUT callback pour refresh
}

export function NFTOwnerCard({ tokenId, onActionSuccess }: NFTOwnerCardProps) {
  const { listing, isLoading, refetch } = useListingById(tokenId)
  const [showListingModal, setShowListingModal] = useState(false)

  // Fonction pour fermer le modal et forcer le refresh
  const handleCloseModal = () => {
    setShowListingModal(false)
    // Force le refresh immédiat des données du NFT
    setTimeout(() => {
      refetch()
      onActionSuccess?.()  // ✅ Notifier la page parente
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="skeleton-card skeleton">
        <div className="skeleton-image" />
        <div className="skeleton-content">
          <div className="skeleton-line skeleton-line--medium" />
          <div className="skeleton-line skeleton-line--short" />
        </div>
      </div>
    )
  }

  const isListed = listing?.active || false
  const price = listing?.priceETH || '0'

  return (
    <>
      <div className="nft-card">
        {/* Image */}
        <div className="nft-card-image">
          <span className="nft-card-image-emoji">🎨</span>
          <div className="nft-card-badge">#{tokenId}</div>
          
          {/* Badge statut */}
          {isListed && (
            <div 
              className="nft-card-badge" 
              style={{ 
                top: '0.5rem', 
                right: '0.5rem', 
                left: 'auto',
                background: 'rgba(34, 197, 94, 0.8)' // Vert pour "Listed"
              }}
            >
              Listed
            </div>
          )}
        </div>

        {/* Info */}
        <div className="nft-card-content">
          {/* Title */}
          <h3 className="nft-card-title">ModularNFT #{tokenId}</h3>

          {/* Statut */}
          <div className="nft-card-info-row">
            <span className="text-secondary">Status</span>
            <span 
              className="font-semibold"
              style={{ 
                color: isListed ? '#16A34A' : '#6B7280' 
              }}
            >
              {isListed ? '🟢 Listed' : '⚪ Available'}
            </span>
          </div>

          {/* Prix si listé */}
          {isListed && (
            <>
              <div className="nft-card-price-row">
                <span className="text-secondary">Price</span>
                <span className="nft-card-price">{price} ETH</span>
              </div>

              {/* Breakdown si listé */}
              <div className="nft-card-breakdown">
                <div className="nft-card-breakdown-row">
                  <span>Royalty (5%)</span>
                  <span>{listing?.royaltyAmount} ETH</span>
                </div>
                <div className="nft-card-breakdown-row">
                  <span>Marketplace Fee (2.5%)</span>
                  <span>{listing?.marketplaceFee} ETH</span>
                </div>
                <div className="nft-card-breakdown-row nft-card-breakdown-total">
                  <span>You receive</span>
                  <span>{listing?.sellerReceives} ETH</span>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          {isListed ? (
            // NFT déjà listé : Update Price + Delist
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button
                onClick={() => setShowListingModal(true)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                📝 Update Price
              </button>
              <DelistButton 
                tokenId={tokenId}
                onSuccess={() => {
                  refetch()
                  onActionSuccess?.()  // ✅ Notifier après delist
                }}
              />
            </div>
          ) : (
            // NFT non listé : List for Sale
            <button
              onClick={() => setShowListingModal(true)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              🏷️ List for Sale
            </button>
          )}
        </div>
      </div>

      {/* Modal de listing/update */}
      {showListingModal && (
        <ListingModal
          tokenId={tokenId}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}