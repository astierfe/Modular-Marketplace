// lib/types/nftTypes.ts - Types NFT de base (réutilisés du projet existant)
import { type Address } from 'viem'

/**
 * Métadonnées NFT standard (ERC721 Metadata)
 */
export interface NFTMetadata {
  name: string
  description: string
  image: string
  external_url?: string
  animation_url?: string
  attributes?: NFTAttribute[]
  background_color?: string
}

/**
 * Attribut NFT
 */
export interface NFTAttribute {
  trait_type: string
  value: string | number
  display_type?: 'string' | 'number' | 'boost_number' | 'boost_percentage' | 'date'
  max_value?: number
}

/**
 * Informations d'un token NFT
 */
export interface NFTTokenInfo {
  tokenId: number
  owner: Address
  tokenURI: string
  metadata?: NFTMetadata
  royaltyRecipient?: Address
  royaltyPercentage?: number
}

/**
 * Informations collection NFT
 */
export interface NFTCollectionInfo {
  name: string
  symbol: string
  totalSupply: number
  maxSupply: number
  mintPrice: string
  mintingActive: boolean
  baseURI: string
  owner: Address
}

/**
 * Statistiques collection
 */
export interface NFTCollectionStats {
  totalSupply: number
  maxSupply: number
  remaining: number
  progress: number
  mintPrice: string
  soldOut: boolean
  mintingActive: boolean
  uniqueOwners?: number
}

/**
 * NFT avec toutes les données enrichies
 */
export interface EnrichedNFT extends NFTTokenInfo {
  // État marketplace
  isListed: boolean
  listingPrice?: string
  seller?: Address
  
  // Flags ownership
  isOwnedByUser?: boolean
  isApproved?: boolean
}

// Utilitaires NFT
export const nftUtils = {
  /**
   * Résoudre URL IPFS vers HTTP gateway
   */
  resolveIPFSUrl: (uri: string): string => {
    if (!uri) return ''
    
    if (uri.startsWith('ipfs://')) {
      const hash = uri.replace('ipfs://', '')
      return `https://ipfs.io/ipfs/${hash}`
    }
    
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return uri
    }
    
    // Fallback
    return `https://ipfs.io/ipfs/${uri}`
  },
  
  /**
   * Fetch métadonnées depuis IPFS
   */
  fetchMetadata: async (tokenURI: string): Promise<NFTMetadata | null> => {
    try {
      if (!tokenURI) return null
      
      const url = nftUtils.resolveIPFSUrl(tokenURI)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`)
      }
      
      const metadata: NFTMetadata = await response.json()
      
      // Résoudre l'URL de l'image
      if (metadata.image) {
        metadata.image = nftUtils.resolveIPFSUrl(metadata.image)
      }
      
      return metadata
    } catch (error) {
      console.error('Error fetching NFT metadata:', error)
      return null
    }
  },
  
  /**
   * Créer métadonnées par défaut
   */
  createDefaultMetadata: (tokenId: number): NFTMetadata => ({
    name: `NFT #${tokenId}`,
    description: `NFT Token #${tokenId}`,
    image: 'https://via.placeholder.com/400x400?text=NFT',
    attributes: []
  }),
  
  /**
   * Extraire la rareté depuis les attributs
   */
  extractRarity: (metadata?: NFTMetadata): string => {
    if (!metadata?.attributes) return 'Unknown'
    
    const rarityAttr = metadata.attributes.find(
      attr => attr.trait_type.toLowerCase() === 'rarity'
    )
    
    return rarityAttr?.value?.toString() || 'Common'
  }
}
