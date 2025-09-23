// components/marketplace/UserStats.tsx - Refactorisé
'use client'

import { useMarketplace } from '@/hooks'
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
  const { withdrawProceeds, isPending, isConfirmed } = useMarketplace()

  const handleWithdraw = async () => {
    try {
      await withdrawProceeds()
    } catch (error) {
      console.error('Error withdrawing proceeds:', error)
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        // ✅ FIXED: Invalidate queries instead of reload
        queryClient.invalidateQueries({ queryKey: ['userProceeds'] })
        queryClient.invalidateQueries({ queryKey: ['userBalance'] })
        queryClient.invalidateQueries({ queryKey: ['userListings'] })
      }, 2000)
    }
  }, [isConfirmed, queryClient])

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
            disabled={isPending || isConfirmed}
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap' }}
          >
            {isPending ? 'Processing...' : isConfirmed ? '✅ Withdrawn!' : 'Withdraw Funds'}
          </button>
        )}
      </div>

      {isConfirmed && (
        <div className="alert-success">
          <p className="alert-success-text">✅ Funds withdrawn successfully!</p>
        </div>
      )}
    </div>
  )
}