// components/marketplace/NFTGrid.tsx - Refactorisé
'use client'

import { NFTCard } from './NFTCard'
import './marketplace-components.css'

interface NFTGridProps {
  listingIds: readonly bigint[]
  isLoading?: boolean
}

export function NFTGrid({ listingIds, isLoading }: NFTGridProps) {
  if (isLoading) {
    return (
      <div className="responsive-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-card skeleton">
            <div className="skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-line--medium" />
              <div className="skeleton-line skeleton-line--short" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="responsive-grid">
      {listingIds.map((tokenId) => (
        <NFTCard key={tokenId.toString()} tokenId={Number(tokenId)} />
      ))}
    </div>
  )
}