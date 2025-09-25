// components/marketplace/NFTCard.tsx - Version corrigée (Buy Now original)
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import dynamic from 'next/dynamic'
import { useListingById } from '@/hooks'
import { useNFTMetadata } from '@/hooks/useNFTMetadata'
import { formatAddress } from '@/lib/contracts'
import { DelistButton } from './DelistButton'
import { IPFSImage } from '@/components/ui/IPFSImage'
import './marketplace-components.css'

// Dynamic import for BuyModal (only loaded when needed)
const BuyModal = dynamic(
  () => import('./BuyModal').then(mod => ({ default: mod.BuyModal })),
  { ssr: false }
)

interface NFTCardProps {
  tokenId: number
}

export function NFTCard({ tokenId }: NFTCardProps) {
  const { address } = useAccount()
  const { listing, isLoading } = useListingById(tokenId)
  const { nftData, loadingMetadata } = useNFTMetadata(tokenId)
  const [showBuyModal, setShowBuyModal] = useState(false)

  if (isLoading || loadingMetadata) {
    return (
      <div className="skeleton-card skeleton">
        <div className="skeleton-image" />
        <div className="skeleton-content">
          <div className="skeleton-line skeleton-line--medium" />
          <div className="skeleton-line skeleton-line--short" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return null
  }

  const isOwner = address?.toLowerCase() === listing.seller.toLowerCase()
  
  // Utiliser les vraies métadonnées ou fallback
  const nftName = nftData?.metadata?.name || `ModularNFT #${tokenId}`
  const nftImage = nftData?.metadata?.image

  return (
    <>
      <div className="nft-card">
        {/* Image */}
        <div className="nft-card-image">
          {nftImage ? (
            <IPFSImage 
              src={nftImage}
              alt={nftName}
              fill
            />
          ) : (
            <span className="nft-card-image-emoji">🎨</span>
          )}
          <div className="nft-card-badge">#{tokenId}</div>
        </div>

        {/* Info */}
        <div className="nft-card-content">
          {/* Title */}
          <h3 className="nft-card-title">{nftName}</h3>

          {/* Price */}
          <div className="nft-card-price-row">
            <span className="text-secondary">Price</span>
            <span className="nft-card-price">{listing.priceETH} ETH</span>
          </div>

          {/* Seller */}
          <div className="nft-card-info-row">
            <span className="text-secondary">Seller</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {isOwner ? 'You' : formatAddress(listing.seller)}
            </span>
          </div>

          {/* Breakdown */}
          <div className="nft-card-breakdown">
            <div className="nft-card-breakdown-row">
              <span>Royalty (5%)</span>
              <span>{listing.royaltyAmount} ETH</span>
            </div>
            <div className="nft-card-breakdown-row">
              <span>Marketplace Fee (2.5%)</span>
              <span>{listing.marketplaceFee} ETH</span>
            </div>
            <div className="nft-card-breakdown-row nft-card-breakdown-total">
              <span>Seller Receives</span>
              <span>{listing.sellerReceives} ETH</span>
            </div>
          </div>

          {/* Action Button - ✅ RÉTABLI COMPORTEMENT ORIGINAL */}
          {isOwner ? (
            <DelistButton tokenId={tokenId} />
          ) : (
            <button
              onClick={() => setShowBuyModal(true)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Buy Now
            </button>
          )}
        </div>
      </div>

      {/* Buy Modal - Comportement original */}
      {showBuyModal && (
        <BuyModal
          tokenId={tokenId}
          listing={listing}
          onClose={() => setShowBuyModal(false)}
        />
      )}
    </>
  )
}