// components/marketplace/ListingModal.tsx - Modal pour créer un listing
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useMarketplace } from '@/hooks'
import { marketplaceHelpers } from '@/lib/contracts'
import { useQueryClient } from '@tanstack/react-query'
import './marketplace-components.css'

interface ListingModalProps {
  tokenId: number
  onClose: () => void
}

export function ListingModal({ tokenId, onClose }: ListingModalProps) {
  const queryClient = useQueryClient()
  const { listItem, isPending, isConfirmed, error } = useMarketplace()
  const [price, setPrice] = useState('')

  // Validation du prix
  const priceValidation = useMemo(() => {
    if (!price) return { valid: false, error: '' }
    return marketplaceHelpers.validateListingPrice(price)
  }, [price])

  // Calcul des fees
  const fees = useMemo(() => {
    if (!price || !priceValidation.valid) {
      return {
        royalty: '0',
        marketplaceFee: '0',
        sellerReceives: '0'
      }
    }

    try {
      const priceWei = marketplaceHelpers.parseETH(price)
      const royaltyWei = marketplaceHelpers.calculateRoyalty(priceWei)
      const feeWei = marketplaceHelpers.calculateMarketplaceFee(priceWei)
      const sellerWei = marketplaceHelpers.calculateSellerReceives(priceWei)

      return {
        royalty: marketplaceHelpers.formatETH(royaltyWei),
        marketplaceFee: marketplaceHelpers.formatETH(feeWei),
        sellerReceives: marketplaceHelpers.formatETH(sellerWei)
      }
    } catch {
      return {
        royalty: '0',
        marketplaceFee: '0',
        sellerReceives: '0'
      }
    }
  }, [price, priceValidation.valid])

  // Gérer la soumission
  const handleList = async () => {
    if (!priceValidation.valid) return

    try {
      await listItem({ tokenId, price })
    } catch (err) {
      console.error('Error listing NFT:', err)
    }
  }

  // Fermer automatiquement après succès
  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        // Invalider TOUTES les queries liées au marketplace
        queryClient.invalidateQueries({ queryKey: ['listings'] })
        queryClient.invalidateQueries({ queryKey: ['userListings'] })
        queryClient.invalidateQueries({ queryKey: ['userBalance'] })
        queryClient.invalidateQueries({ queryKey: ['userProceeds'] })
        
        // Force le refetch immédiat
        queryClient.refetchQueries({ queryKey: ['listings'] })
        queryClient.refetchQueries({ queryKey: ['userListings'] })
        
        onClose()
      }, 2000)
    }
  }, [isConfirmed, onClose, queryClient])

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">List NFT #{tokenId}</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        {/* NFT Preview */}
        <div className="modal-preview">
          <span>🎨</span>
        </div>

        {/* Price Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label 
            htmlFor="price-input" 
            style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}
            className="dark:text-gray-300"
          >
            Listing Price (ETH)
          </label>
          <input
            id="price-input"
            type="number"
            step="0.001"
            min="0.001"
            placeholder="0.5"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isPending || isConfirmed}
            style={{
              padding: '0.75rem',
              border: '1px solid #D1D5DB',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              outline: 'none'
            }}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {!priceValidation.valid && price && (
            <p style={{ fontSize: '0.75rem', color: '#DC2626' }}>
              {priceValidation.error}
            </p>
          )}
        </div>

        {/* Fee Breakdown */}
        {priceValidation.valid && (
          <div className="modal-breakdown">
            <div className="modal-breakdown-row">
              <span>Creator Royalty (5%)</span>
              <span>{fees.royalty} ETH</span>
            </div>
            <div className="modal-breakdown-row">
              <span>Marketplace Fee (2.5%)</span>
              <span>{fees.marketplaceFee} ETH</span>
            </div>
            <div className="modal-breakdown-row modal-breakdown-total">
              <span>You will receive (92.5%)</span>
              <span>{fees.sellerReceives} ETH</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isConfirmed && (
          <div className="alert-success">
            <p className="alert-success-text">✅ NFT Listed Successfully!</p>
            <p className="text-secondary text-center" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Your NFT is now available on the marketplace
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
            onClick={handleList}
            disabled={isPending || isConfirmed || !priceValidation.valid}
            className="btn btn-primary"
          >
            {isPending ? 'Listing...' : isConfirmed ? 'Listed!' : 'Confirm Listing'}
          </button>
        </div>
      </div>
    </div>
  )
}