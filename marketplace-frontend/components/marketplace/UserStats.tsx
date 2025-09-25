// components/marketplace/UserStats.tsx - Avec overlay sur Withdraw Funds
'use client'

import { useMarketplace } from '@/hooks'
import { useTransaction } from '@/contexts/TransactionContext' // ✅ ÉTAPE 4C
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import './marketplace-components.css'

interface UserStatsProps {
  userData: {
    proceedsETH: string
    hasProceeds: boolean
    activeListingsCount: number
  }
}

export function UserStats({ userData }: UserStatsProps) {
  const queryClient = useQueryClient()
  const { withdrawProceeds, isPending, isConfirming, isConfirmed, error } = useMarketplace()
  
  // ✅ ÉTAPE 4C - Contexte transaction global pour overlay
  const { startTransaction, endTransaction } = useTransaction()

  // ✅ CORRECTION : Gestion des erreurs (Cancel MetaMask)
  useEffect(() => {
    if (error) {
      console.log('❌ Erreur withdraw détectée (Cancel MetaMask ou autre):', error.message)
      endTransaction() // Fermer l'overlay immédiatement
    }
  }, [error, endTransaction])

  // ✅ SYNCHRONISATION avec les vrais états blockchain
  useEffect(() => {
    if (isPending || isConfirming) {
      // Transaction en cours (signature + confirmation) → Garder overlay
      console.log('💰 Withdraw en cours, overlay maintenu:', { isPending, isConfirming })
    } else if (isConfirmed) {
      // Transaction confirmée → Fermer overlay après 2s
      console.log('✅ Withdraw confirmé, fermeture overlay dans 2s')
      setTimeout(() => {
        endTransaction()
        
        // Invalider les queries liées aux revenus
        queryClient.invalidateQueries({ queryKey: ['userProceeds'] })
        queryClient.invalidateQueries({ queryKey: ['userBalance'] })
        queryClient.invalidateQueries({ queryKey: ['userListings'] })
        
        // Force le refetch immédiat
        queryClient.refetchQueries({ queryKey: ['userProceeds'] })
        queryClient.refetchQueries({ queryKey: ['userBalance'] })
        
        console.log('🔄 Withdraw overlay closed')
      }, 2000)
    }
  }, [isPending, isConfirming, isConfirmed, endTransaction, queryClient])

  const handleWithdraw = async () => {
    try {
      console.log('💰 Withdraw Funds clicked - Starting transaction overlay')
      startTransaction()

      // Appeler la fonction withdrawProceeds du hook marketplace
      await withdrawProceeds()
      
      // Note: Ne pas appeler endTransaction() ici !
      // L'overlay sera fermé par l'useEffect approprié
      
    } catch (error) {
      console.error('❌ Withdraw transaction failed in component:', error)
      // L'useEffect ci-dessus gèrera la fermeture via l'état error
    }
  }

  return (
    <div className="user-stats-card">
      <div className="user-stats-content">
        
        <div className="user-stats-info">
          <h3 className="user-stats-title">💰 Your Earnings</h3>
          <div className="user-stats-amount">
            <span className="user-stats-value">{userData.proceedsETH}</span>
            <span className="text-secondary">ETH Available</span>
          </div>
          <p className="user-stats-listings">
            From {userData.activeListingsCount} active listing{userData.activeListingsCount !== 1 ? 's' : ''}
          </p>
        </div>

        {userData.hasProceeds && (
          <button
            onClick={handleWithdraw}
            disabled={isPending || isConfirming || isConfirmed} // ✅ Désactiver pendant TOUT le processus
            className="btn btn-primary"
            style={{ 
              whiteSpace: 'nowrap',
              opacity: (isPending || isConfirming || isConfirmed) ? 0.5 : 1,
              cursor: (isPending || isConfirming || isConfirmed) ? 'not-allowed' : 'pointer'
            }}
          >
            {isPending ? 'Signing...' : isConfirming ? 'Confirming...' : isConfirmed ? '✅ Withdrawn!' : 'Withdraw Funds'}
          </button>
        )}
      </div>

      {isConfirmed && (
        <div className="alert-success">
          <p className="alert-success-text">✅ Funds withdrawn successfully!</p>
        </div>
      )}

      {/* Affichage erreur */}
      {error && (
        <div className="alert-error" style={{ marginTop: '1rem' }}>
          <p className="alert-error-text">
            {error.message.includes('User rejected') 
              ? 'Transaction cancelled' 
              : error.message}
          </p>
        </div>
      )}
    </div>
  )
}