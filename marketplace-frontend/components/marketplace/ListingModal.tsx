// components/marketplace/ListingModal.tsx - Modal pour créer un listing avec overlay (propre)
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useMarketplace } from '@/hooks'
import { useTransaction } from '@/contexts/TransactionContext'
import { marketplaceHelpers } from '@/lib/contracts'
import { useQueryClient } from '@tanstack/react-query'
import './marketplace-components.css'

interface ListingModalProps {
  tokenId: number
  onClose: () => void
}

export function ListingModal({ tokenId, onClose }: ListingModalProps) {
  const queryClient = useQueryClient()
  const { listItem, isPending, isConfirming, isConfirmed, error } = useMarketplace()
  const [price, setPrice] = useState('')
  const { startTransaction, endTransaction } = useTransaction()

  // Gestion des erreurs (Cancel MetaMask)
  useEffect(() => {
    if (error) {
      endTransaction()
    }
  }, [error, endTransaction])

  // Synchronisation avec les états blockchain
  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        endTransaction()
        queryClient.invalidateQueries({ queryKey: ['listings'] })
        queryClient.invalidateQueries({ queryKey: ['userListings'] })
        queryClient.invalidateQueries({ queryKey: ['userBalance'] })
        queryClient.invalidateQueries({ queryKey: ['userProceeds'] })
        queryClient.refetchQueries({ queryKey: ['listings'] })
        queryClient.refetchQueries({ queryKey: ['userListings'] })
        onClose()
      }, 2000)
    }
  }, [isConfirmed, endTransaction, queryClient, onClose])

  // Validation du prix
  const priceValidation = useMemo(() => {
    if (!price) return { valid: false, error: '' }
    return marketplaceHelpers.validateListingPrice(price)
  }, [price])

  // Calcul des fees
  const fees = useMemo(() => {
    if (!price || !priceValidation.valid) {
      return { royalty: '0', marketplaceFee: '0', sellerReceives: '0' }
    }
    try {
      const priceWei = marketplaceHelpers.parseETH(price)
      const royaltyWei = marketplaceHelpers.calculateRoyalty(priceWei)
      const feeWei = marketplaceHelpers.calculateMarketplaceFee(priceWei)
      const sellerWei = marketplaceHelpers.calculateSellerReceives(priceWei)
      return {
        royalty: marketplaceHelpers.formatETH(royaltyWei),
        marketplaceFee: marketplaceHelpers.formatETH(feeWei),
        sellerReceives: marketplaceHelpers.formatETH(sellerWei),
      }
    } catch {
      return { royalty: '0', marketplaceFee: '0', sellerReceives: '0' }
    }
  }, [price, priceValidation.valid])

  // Gérer la soumission
  const handleList = async () => {
    if (!priceValidation.valid) return
    try {
      startTransaction()
      await listItem({ tokenId, price })
    } catch (error) {
      console.error('List transaction failed:', error)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">List NFT #{tokenId}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="modal-preview">
          <span>🎨</span>
        </div>

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
            disabled={isPending || isConfirming || isConfirmed}
            style={{
              padding: '0.75rem',
              border: '1px solid #D1D5DB',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              outline: 'none',
              opacity: (isPending || isConfirming || isConfirmed) ? 0.5 : 1,
            }}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {!priceValidation.valid && price && (
            <p style={{ fontSize: '0.75rem', color: '#DC2626' }}>
              {priceValidation.error}
            </p>
          )}
        </div>

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

        {isConfirmed && (
          <div className="alert-success">
            <p className="alert-success-text">✅ NFT Listed Successfully!</p>
            <p
              className="text-secondary text-center"
              style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}
            >
              Your NFT is now available on the marketplace
            </p>
          </div>
        )}

        {error && (
          <div className="alert-error">
            <p className="alert-error-text">
              {error.message.includes('User rejected')
                ? 'Transaction cancelled'
                : error.message}
            </p>
          </div>
        )}

        <div className="modal-actions">
          <button
            onClick={onClose}
            disabled={isPending || isConfirming}
            className="btn"
            style={{
              border: '1px solid #D1D5DB',
              background: 'transparent',
              opacity: (isPending || isConfirming) ? 0.5 : 1,
              cursor: (isPending || isConfirming) ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleList}
            disabled={!price || price === '0'}
            className="btn btn-primary"
            style={{
              opacity: (!price || price === '0') ? 0.5 : 1,
              cursor: (!price || price === '0') ? 'not-allowed' : 'pointer',
            }}
          >
            {isPending
              ? 'Signing...'
              : isConfirming
              ? 'Confirming...'
              : isConfirmed
              ? 'Listed!'
              : 'Confirm Listing'}
          </button>
        </div>
      </div>
    </div>
  )
}
