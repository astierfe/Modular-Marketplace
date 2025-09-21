// lib/types/marketplaceTypes.ts - Types centralisés pour le Marketplace
import { type Address } from 'viem'
import { type NFTMetadata } from './nftTypes'

// ===== TYPES SMART CONTRACT =====

/**
 * Structure Listing du contrat Marketplace
 */
export interface MarketplaceListing {
  tokenId: bigint
  seller: Address
  price: bigint
  active: boolean
  timestamp: bigint
}

/**
 * Listing avec métadonnées NFT enrichies
 */
export interface EnrichedListing extends MarketplaceListing {
  // Données NFT
  owner: Address
  tokenURI: string
  metadata?: NFTMetadata
  
  // Calculs dérivés
  priceETH: string
  royaltyAmount: string
  marketplaceFee: string
  sellerReceives: string
}

/**
 * État d'approbation pour le marketplace
 */
export enum ApprovalState {
  UNKNOWN = 'unknown',
  NOT_APPROVED = 'not_approved',
  PENDING = 'pending',
  APPROVED = 'approved',
  ERROR = 'error'
}

/**
 * Informations utilisateur marketplace
 */
export interface UserMarketplaceData {
  // Listings de l'utilisateur
  activeListings: number[]
  totalListings: number
  
  // Revenus
  proceeds: bigint
  proceedsETH: string
  
  // NFTs possédés (non listés)
  ownedNFTs: number[]
  
  // Approbation
  approvalState: ApprovalState
}

/**
 * Statistiques marketplace
 */
export interface MarketplaceStats {
  // Général
  totalListings: number
  activeListings: number
  
  // Volume
  totalVolume: bigint
  totalVolumeETH: string
  
  // Configuration
  marketplaceFee: number    // basis points
  royaltyRate: number       // basis points
  
  // Adresses
  nftContract: Address
  feeRecipient: Address
}

/**
 * Filtres pour listings
 */
export interface ListingFilters {
  // Tri
  sortBy: 'price' | 'recent' | 'oldest' | 'tokenId'
  sortOrder: 'asc' | 'desc'
  
  // Filtres prix
  minPrice?: string
  maxPrice?: string
  
  // Filtres vendeur
  seller?: Address
  
  // Filtres NFT
  rarity?: string
  attributes?: Record<string, string>
  
  // Recherche
  searchTerm?: string
}

/**
 * Paramètres pour créer un listing
 */
export interface CreateListingParams {
  tokenId: number
  price: string  // En ETH
}

/**
 * Paramètres pour acheter un NFT
 */
export interface BuyItemParams {
  tokenId: number
  price: string  // En ETH (pour validation)
}

/**
 * Résultat d'une transaction marketplace
 */
export interface MarketplaceTransaction {
  hash: `0x${string}`
  type: 'list' | 'buy' | 'delist' | 'updatePrice' | 'withdraw'
  tokenId?: number
  price?: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
  error?: string
}

/**
 * État du hook marketplace
 */
export interface MarketplaceHookState {
  // Actions en cours
  isListing: boolean
  isBuying: boolean
  isDelisting: boolean
  isUpdatingPrice: boolean
  isWithdrawing: boolean
  
  // Erreurs
  error: Error | null
  
  // Dernière transaction
  lastTransaction?: MarketplaceTransaction
}

// ===== UTILITAIRES DE CONVERSION =====

export const marketplaceUtils = {
  /**
   * Calculer les frais marketplace
   */
  calculateMarketplaceFee: (price: bigint, feeBasisPoints: number = 250): bigint => {
    return (price * BigInt(feeBasisPoints)) / BigInt(10000)
  },
  
  /**
   * Calculer les royalties
   */
  calculateRoyalty: (price: bigint, royaltyBasisPoints: number = 500): bigint => {
    return (price * BigInt(royaltyBasisPoints)) / BigInt(10000)
  },
  
  /**
   * Calculer ce que reçoit le vendeur
   */
  calculateSellerReceives: (
    price: bigint, 
    marketplaceFeeBasisPoints: number = 250,
    royaltyBasisPoints: number = 500
  ): bigint => {
    const marketplaceFee = marketplaceUtils.calculateMarketplaceFee(price, marketplaceFeeBasisPoints)
    const royalty = marketplaceUtils.calculateRoyalty(price, royaltyBasisPoints)
    return price - marketplaceFee - royalty
  },
  
  /**
   * Enrichir un listing avec les calculs
   */
  enrichListing: (
    listing: MarketplaceListing,
    tokenURI: string,
    metadata?: NFTMetadata
  ): EnrichedListing => {
    const priceETH = (Number(listing.price) / 1e18).toFixed(4)
    const royaltyAmount = marketplaceUtils.calculateRoyalty(listing.price)
    const marketplaceFee = marketplaceUtils.calculateMarketplaceFee(listing.price)
    const sellerReceives = marketplaceUtils.calculateSellerReceives(listing.price)
    
    return {
      ...listing,
      owner: listing.seller, // Le seller est l'owner jusqu'à la vente
      tokenURI,
      metadata,
      priceETH,
      royaltyAmount: (Number(royaltyAmount) / 1e18).toFixed(4),
      marketplaceFee: (Number(marketplaceFee) / 1e18).toFixed(4),
      sellerReceives: (Number(sellerReceives) / 1e18).toFixed(4),
    }
  },
  
  /**
   * Valider un prix
   */
  validatePrice: (price: string): { valid: boolean; error?: string } => {
    const priceNum = parseFloat(price)
    
    if (isNaN(priceNum) || priceNum <= 0) {
      return { valid: false, error: 'Price must be greater than 0' }
    }
    
    if (priceNum < 0.001) {
      return { valid: false, error: 'Price must be at least 0.001 ETH' }
    }
    
    if (priceNum > 1000) {
      return { valid: false, error: 'Price cannot exceed 1000 ETH' }
    }
    
    return { valid: true }
  },
  
  /**
   * Formater une adresse pour affichage
   */
  formatAddress: (address: Address): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  },
  
  /**
   * Formater un timestamp
   */
  formatTimestamp: (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// ===== TYPES POUR LES HOOKS =====

/**
 * Retour du hook useMarketplaceActions
 */
export interface UseMarketplaceActionsReturn {
  // Actions
  listItem: (params: CreateListingParams) => Promise<void>
  buyItem: (params: BuyItemParams) => Promise<void>
  delistItem: (tokenId: number) => Promise<void>
  updatePrice: (tokenId: number, newPrice: string) => Promise<void>
  withdrawProceeds: () => Promise<void>
  
  // État
  state: MarketplaceHookState
  
  // Helpers
  canList: (tokenId: number) => boolean
  canBuy: (tokenId: number) => boolean
  canDelist: (tokenId: number) => boolean
}

/**
 * Retour du hook useMarketplaceListings
 */
export interface UseMarketplaceListingsReturn {
  // Données
  listings: EnrichedListing[]
  userListings: EnrichedListing[]
  
  // États
  isLoading: boolean
  error: Error | null
  
  // Actions
  refetch: () => void
  
  // Filtrage
  filters: ListingFilters
  setFilters: (filters: Partial<ListingFilters>) => void
  clearFilters: () => void
  
  // Stats
  stats: MarketplaceStats | null
}

/**
 * Retour du hook useMarketplaceApproval
 */
export interface UseMarketplaceApprovalReturn {
  // État
  approvalState: ApprovalState
  isApproved: boolean
  
  // Actions
  approve: () => Promise<void>
  checkApproval: () => Promise<void>
  
  // Statuts
  isApproving: boolean
  error: Error | null
}
