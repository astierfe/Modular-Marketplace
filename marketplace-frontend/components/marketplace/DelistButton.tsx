// components/marketplace/DelistButton.tsx - Refactorisé avec callback
'use client'

import { useMarketplace } from '@/hooks'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface DelistButtonProps {
  tokenId: number
  onSuccess?: () => void  // ✅ AJOUT callback
}

export function DelistButton({ tokenId, onSuccess }: DelistButtonProps) {
  const queryClient = useQueryClient()
  const { delistItem, isPending, isConfirmed } = useMarketplace()

  const handleDelist = async () => {
    try {
      await delistItem(tokenId)
    } catch (error) {
      console.error('Error delisting NFT:', error)
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['listings'] })
        queryClient.invalidateQueries({ queryKey: ['userListings'] })
        queryClient.invalidateQueries({ queryKey: ['userBalance'] })
        
        onSuccess?.()  // ✅ Appeler le callback
      }, 2000)
    }
  }, [isConfirmed, queryClient, onSuccess])

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
      onClick={handleDelist}
      disabled={isPending}
      className="btn"
      style={{
        width: '100%',
        backgroundColor: '#DC2626',
        color: 'white'
      }}
    >
      {isPending ? 'Delisting...' : 'Delist NFT'}
    </button>
  )
}