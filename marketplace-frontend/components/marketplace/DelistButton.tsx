// components/marketplace/DelistButton.tsx - Refactorisé
'use client'

import { useMarketplace } from '@/hooks'
import { useEffect } from 'react'

interface DelistButtonProps {
  tokenId: number
}

export function DelistButton({ tokenId }: DelistButtonProps) {
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
        window.location.reload()
      }, 2000)
    }
  }, [isConfirmed])

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