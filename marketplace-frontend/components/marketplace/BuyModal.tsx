// components/marketplace/BuyModal.tsx - Avec overlay sur Confirm Purchase
'use client'

import { useMarketplace } from '@/hooks'
import { useTransaction } from '@/contexts/TransactionContext' // ✅ ÉTAPE 4D
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
  const { buyItem, isPending, isConfirming, isConfirmed, error } = useMarketplace()
  
  // ✅ ÉTAPE 4D - Contexte transaction global pour overlay
  const { startTransaction, endTransaction } = useTransaction()

  // ✅ CORRECTION : Gestion des erreurs (Cancel MetaMask)
  useEffect(() => {
    if (error) {
      console.log('❌ Erreur purchase détectée (Cancel MetaMask ou autre):', error.message)
      endTransaction() // Fermer l'overlay immédiatement
    }
  }, [error, endTransaction])

  // ✅ SYNCHRONISATION avec les vrais états blockchain
  useEffect(() => {
    if (isPending || isConfirming) {
      // Transaction en cours (signature + confirmation) → Garder overlay
      console.log('🛒 Purchase en cours, overlay maintenu:', { isPending, isConfirming })
    } else if (isConfirmed) {
      // Transaction confirmée → Fermer overlay après 2s puis fermer modal
      console.log('✅ Purchase confirmé, fermeture overlay + modal dans 2s')
      setTimeout(() => {
        endTransaction()
        
        // Invalider TOUTES les queries liées au marketplace
        queryClient.invalidateQueries({ queryKey: ['listings'] })
        queryClient.invalidateQueries({ queryKey: ['userListings'] })
        queryClient.invalidateQueries({ queryKey: ['userBalance'] })
        queryClient.invalidateQueries({ queryKey: ['userProceeds'] })
        
        // Force le refetch immédiat
        queryClient.refetchQueries({ queryKey: ['listings'] })
        queryClient.refetchQueries({ queryKey: ['userListings'] })
        
        onClose() // Fermer le modal
        console.log('🔄 Purchase overlay closed + modal closed')
      }, 2000)
    }
  }, [isPending, isConfirming, isConfirmed, endTransaction, queryClient, onClose])

  const handleBuy = async () => {
    try {
      console.log('🛒 Confirm Purchase clicked - Starting transaction overlay')
      startTransaction()

      // Appeler la fonction buyItem du hook marketplace
      await buyItem({ tokenId, price: listing.priceETH })
      
      // Note: Ne pas appeler endTransaction() ici !
      // L'overlay sera fermé par l'useEffect approprié
      
    } catch (error) {
      console.error('❌ Buy transaction failed in component:', error)
      // L'useEffect ci-dessus gèrera la fermeture via l'état error
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Buy NFT #{tokenId}</h2>
          <button 
            onClick={onClose} 
            className="modal-close"
            disabled={isPending || isConfirming} // ✅ Désactiver pendant transaction
            style={{
              opacity: (isPending || isConfirming) ? 0.5 : 1,
              cursor: (isPending || isConfirming) ? 'not-allowed' : 'pointer'
            }}
          >
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
            <p className="alert-error-text">
              {error.message.includes('User rejected') 
                ? 'Transaction cancelled' 
                : error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-actions">
          <button
            onClick={onClose}
            disabled={isPending || isConfirming} // ✅ Désactiver pendant transaction
            className="btn"
            style={{ 
              border: '1px solid #D1D5DB',
              background: 'transparent',
              opacity: (isPending || isConfirming) ? 0.5 : 1,
              cursor: (isPending || isConfirming) ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleBuy}
            disabled={isPending || isConfirming || isConfirmed} // ✅ États complets
            className="btn btn-primary"
            style={{
              opacity: (isPending || isConfirming || isConfirmed) ? 0.5 : 1,
              cursor: (isPending || isConfirming || isConfirmed) ? 'not-allowed' : 'pointer'
            }}
          >
            {isPending ? 'Signing...' : isConfirming ? 'Confirming...' : isConfirmed ? 'Purchased!' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  )
}