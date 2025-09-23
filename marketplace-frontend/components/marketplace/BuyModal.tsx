// components/marketplace/BuyModal.tsx - Refactorisé
'use client'

import { useMarketplace } from '@/hooks'
import { EnrichedListing } from '@/lib/types/marketplaceTypes'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import './marketplace-components.css'

interface BuyModalProps {
  tokenId: number
  listing: EnrichedListing
  onClose: () => void
}

export function BuyModal({ tokenId, listing, onClose }: BuyModalProps) {
  const queryClient = useQueryClient()
  const { buyItem, isPending, isConfirmed, error } = useMarketplace()

  const handleBuy = async () => {
    try {
      await buyItem({ tokenId, price: listing.priceETH })
    } catch (err) {
      console.error('Error buying NFT:', err)
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        // ✅ FIXED: Invalidate queries instead of reload
        queryClient.invalidateQueries({ queryKey: ['listings'] })
        queryClient.invalidateQueries({ queryKey: ['userListings'] })
        queryClient.invalidateQueries({ queryKey: ['userBalance'] })
        queryClient.invalidateQueries({ queryKey: ['userProceeds'] })
        onClose()
      }, 2000)
    }
  }, [isConfirmed, onClose, queryClient])

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Buy NFT #{tokenId}</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        {/* NFT Preview */}
        <div className="modal-preview">
          <span>🎨</span>
        </div>

        {/* Price Breakdown */}
        <div className="modal-price-section">
          <div className="modal-price-main">
            <span className="text-secondary">Price</span>
            <span className="modal-price-value">{listing.priceETH} ETH</span>
          </div>
          
          <div className="modal-breakdown">
            <div className="modal-breakdown-row">
              <span>Creator Royalty (5%)</span>
              <span>{listing.royaltyAmount} ETH</span>
            </div>
            <div className="modal-breakdown-row">
              <span>Marketplace Fee (2.5%)</span>
              <span>{listing.marketplaceFee} ETH</span>
            </div>
            <div className="modal-breakdown-row modal-breakdown-total">
              <span>Total Price</span>
              <span>{listing.priceETH} ETH</span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {isConfirmed && (
          <div className="alert-success">
            <p className="alert-success-text">✅ Purchase Successful!</p>
            <p className="text-secondary text-center" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              NFT transferred to your wallet
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert-error">
            <p className="alert-error-text">{error.message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-actions">
          <button
            onClick={onClose}
            disabled={isPending}
            className="btn"
            style={{ 
              border: '1px solid #D1D5DB',
              background: 'transparent'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleBuy}
            disabled={isPending || isConfirmed}
            className="btn btn-primary"
          >
            {isPending ? 'Processing...' : isConfirmed ? 'Confirmed!' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  )
}