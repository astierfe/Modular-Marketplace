// components/ui/IPFSImage.tsx - Composant d'image IPFS avec fallbacks
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { metadataUtils } from '@/lib/utils/metadataUtils'

interface IPFSImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
}

export function IPFSImage({ 
  src, 
  alt, 
  className = "",
  width,
  height,
  fill = false,
  sizes = "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
}: IPFSImageProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [currentGateway, setCurrentGateway] = useState(0)

  const gateways = metadataUtils.getAvailableGateways()

  // Obtenir l'URL avec le gateway actuel
  const getImageUrl = () => {
    if (!src) return ''
    
    // Utiliser metadataUtils pour convertir correctement IPFS vers HTTP
    return metadataUtils.ipfsToHttp(src, currentGateway)
  }

  const handleImageError = () => {
    console.warn(`Image error with gateway ${currentGateway + 1}:`, getImageUrl())
    
    // Essayer le gateway suivant
    if (currentGateway < gateways.length - 1) {
      setCurrentGateway(prev => prev + 1)
      setImageLoading(true)
    } else {
      setImageError(true)
      setImageLoading(false)
    }
  }

  const handleImageLoad = () => {
    console.log('✅ Image loaded from gateway:', gateways[currentGateway])
    setImageLoading(false)
  }

  const handleImageClick = () => {
    const fullImageUrl = getImageUrl()
    if (fullImageUrl) {
      window.open(fullImageUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // État d'erreur finale
  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🎨</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Image unavailable</p>
        </div>
      </div>
    )
  }

  const imageUrl = getImageUrl()

  return (
    <div className={`relative cursor-pointer ${className}`} onClick={handleImageClick}>
      {/* Skeleton de chargement */}
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      )}
      
      {/* Overlay au hover pour indiquer que c'est cliquable */}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
        <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/50 text-white px-2 py-1 rounded text-sm">
          Click to view full size
        </div>
      </div>
      
      {/* Image Next.js optimisée */}
      {fill ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover transition-opacity duration-300"
          onLoad={handleImageLoad}
          onError={handleImageError}
          sizes={sizes}
        />
      ) : (
        <Image
          src={imageUrl}
          alt={alt}
          width={width || 400}
          height={height || 400}
          className="object-cover transition-opacity duration-300"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  )
}