// components/marketplace/DelistButton.tsx - Avec gestion Cancel MetaMask
'use client'

import { useMarketplace } from '@/hooks'
import { useTransaction } from '@/contexts/TransactionContext'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface DelistButtonProps {
  tokenId: number
  onSuccess?: () => void
}

export function DelistButton({ tokenId, onSuccess }: DelistButtonProps) {
  const queryClient = useQueryClient()
  const { delistItem, isPending, isConfirming, isConfirmed, error } = useMarketplace()
  
  // ✅ Contexte transaction global pour overlay
  const { startTransaction, endTransaction } = useTransaction()

  // ✅ CORRECTION : Gestion des erreurs (Cancel MetaMask)
  useEffect(() => {
    if (error) {
      console.log('❌ Erreur détectée (Cancel MetaMask ou autre):', error.message)
      endTransaction() // Fermer l'overlay immédiatement
    }
  }, [error, endTransaction])

  // ✅ SYNCHRONISATION avec les vrais états blockchain
  useEffect(() => {
    if (isPending || isConfirming) {
      // Transaction en cours (signature + confirmation) → Garder overlay
      console.log('🔄 Transaction en cours, overlay maintenu:', { isPending, isConfirming })
    } else if (isConfirmed) {
      // Transaction confirmée → Fermer overlay après 2s
      console.log('✅ Transaction confirmée, fermeture overlay dans 2s')
      setTimeout(() => {
        endTransaction()
        console.log('🔄 Transaction overlay closed after confirmation')
      }, 2000)
    }
  }, [isPending, isConfirming, isConfirmed, endTransaction])

  // ✅ FONCTION DELIST simplifiée
  const handleDelistWithOverlay = async () => {
    try {
      console.log('🗑️ Delist clicked - Starting transaction overlay')
      startTransaction()

      // Appeler la fonction delistItem - elle gère déjà les états
      await delistItem(tokenId)
      
      // Note: Ne pas appeler endTransaction() ici !
      // L'overlay sera fermé par l'useEffect approprié
      
    } catch (error) {
      console.error('❌ Delist transaction failed in component:', error)
      // L'useEffect ci-dessus gèrera la fermeture via l'état error
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['listings'] })
        queryClient.invalidateQueries({ queryKey: ['userListings'] })
        queryClient.invalidateQueries({ queryKey: ['userBalance'] })
        
        onSuccess?.()
      }, 2000)
    }
  }, [isConfirmed, queryClient, onSuccess])

  // ✅ GESTION ÉTAT ERROR
  if (error) {
    return (
      <button
        onClick={handleDelistWithOverlay}
        className="btn"
        style={{
          width: '100%',
          backgroundColor: '#DC2626',
          color: 'white'
        }}
      >
        Delist NFT
      </button>
    )
  }

  if (isConfirmed) {
    return (
      <button
        disabled
        className="btn btn-success"
        style={{ width: '100%' }}
      >
        ✅ Delisted!
      </button>
    )
  }

  return (
    <button
      onClick={handleDelistWithOverlay}
      disabled={isPending || isConfirming}
      className="btn"
      style={{
        width: '100%',
        backgroundColor: '#DC2626',
        color: 'white',
        opacity: (isPending || isConfirming) ? 0.5 : 1,
        cursor: (isPending || isConfirming) ? 'not-allowed' : 'pointer'
      }}
    >
      {isPending ? 'Signing...' : isConfirming ? 'Confirming...' : 'Delist NFT'}
    </button>
  )
}