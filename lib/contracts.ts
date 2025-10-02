// ===================================
// PHASE 3A - CONFIGURATION MARKETPLACE
// Fichier: lib/contracts.ts (à ajouter/étendre)
// ===================================

import { Address } from 'viem'

// ===== ADRESSES DE CONTRATS =====

export const CONTRACT_ADDRESSES = {
  // Contrat ModularNFT existant (ne pas modifier)
  modularNFT: {
    anvil: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address,
    sepolia: "0xd34F288Fa68b657926989EF286477E9f3C87A825" as Address,
    mainnet: "0x..." as Address, // À définir plus tard
  },
  
  // NOUVEAU : Marketplace déployé
  marketplace: {
    anvil: "0x..." as Address, // À déployer
    sepolia: "0x7AbcF4d2B55a5FE578A42B4d3C0be2F4820d26eC" as Address, // ✅ Déjà déployé
    mainnet: "0x..." as Address, // À déployer plus tard
  }
} as const

// ===== CONFIGURATION MARKETPLACE =====

export const MARKETPLACE_CONFIG = {
  // Paramètres économiques
  MARKETPLACE_FEE: 250, // 2.5% en basis points
  MAX_MARKETPLACE_FEE: 1000, // 10% maximum
  MIN_PRICE: "0.001", // Prix minimum en ETH
  MAX_PRICE: "1000", // Prix maximum en ETH
  
  // Gas limits estimés
  GAS_LIMITS: {
    LIST_ITEM: 150000,
    BUY_ITEM: 200000,
    DELIST_ITEM: 100000,
    UPDATE_PRICE: 80000,
    WITHDRAW_PROCEEDS: 100000,
    APPROVE_ALL: 50000,
  },
  
  // Royalties configuration (EIP-2981)
  ROYALTY_CONFIG: {
    defaultRate: 500, // 5% en basis points
    maxRate: 1000,    // 10% maximum
    enforced: true    // Toujours calculer les royalties
  }
} as const

// ===== TYPES TYPESCRIPT MARKETPLACE =====

export interface Listing {
  tokenId: number
  seller: Address
  price: bigint
  active: boolean
  timestamp: number
}

export interface MarketplaceStats {
  totalListings: number
  totalSales: number
  totalVolume: bigint
  activeListings: number
}

export interface NFTWithListing {
  tokenId: number
  owner: Address
  tokenURI: string
  metadata?: NFTMetadata
  listing?: Listing
  isListed: boolean
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  external_url?: string
  attributes: Array<{
    trait_type: string
    value: string | number
    display_type?: string
  }>
  animation_url?: string
  youtube_url?: string
}

// ===== NETWORK CONFIGURATION =====

export const SUPPORTED_CHAINS = {
  anvil: {
    id: 31337,
    name: "Anvil",
    network: "anvil",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: ["http://localhost:8545"] },
      public: { http: ["http://localhost:8545"] },
    },
    blockExplorers: {
      default: { name: "Anvil", url: "http://localhost:8545" },
    },
    contracts: {
      modularNFT: CONTRACT_ADDRESSES.modularNFT.anvil,
      marketplace: CONTRACT_ADDRESSES.marketplace.anvil,
    },
  },
  sepolia: {
    id: 11155111,
    name: "Sepolia",
    network: "sepolia",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: ["https://rpc.sepolia.org"] },
      public: { http: ["https://rpc.sepolia.org"] },
    },
    blockExplorers: {
      default: { name: "Etherscan", url: "https://sepolia.etherscan.io" },
    },
    contracts: {
      modularNFT: CONTRACT_ADDRESSES.modularNFT.sepolia,
      marketplace: CONTRACT_ADDRESSES.marketplace.sepolia,
    },
  },
} as const

// ===== HELPER FUNCTIONS =====

export function getContractAddress(
  contractName: 'modularNFT' | 'marketplace',
  chainId: number
): Address {
  switch (chainId) {
    case 31337:
      return CONTRACT_ADDRESSES[contractName].anvil
    case 11155111:
      return CONTRACT_ADDRESSES[contractName].sepolia
    case 1:
      return CONTRACT_ADDRESSES[contractName].mainnet
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`)
  }
}

export function getChainConfig(chainId: number) {
  switch (chainId) {
    case 31337:
      return SUPPORTED_CHAINS.anvil
    case 11155111:
      return SUPPORTED_CHAINS.sepolia
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`)
  }
}

// ===== MARKETPLACE ABI (PARTIEL) =====
// Note: ABI complet à ajouter après génération par Foundry

export const MARKETPLACE_ABI = [
  // View functions
  "function getListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool active, uint256 timestamp))",
  "function getActiveListings() view returns (uint256[])",
  "function getSellerListings(address seller) view returns (uint256[])",
  "function getProceeds(address seller) view returns (uint256)",
  "function getActiveListingsCount() view returns (uint256)",
  "function marketplaceFee() view returns (uint256)",
  "function feeRecipient() view returns (address)",
  "function modularNFT() view returns (address)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  
  // Write functions
  "function listItem(uint256 tokenId, uint256 price)",
  "function buyItem(uint256 tokenId) payable",
  "function delistItem(uint256 tokenId)",
  "function updatePrice(uint256 tokenId, uint256 newPrice)",
  "function withdrawProceeds()",
  
  // Events
  "event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price, uint256 timestamp)",
  "event ItemSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price, uint256 royaltyAmount, uint256 marketplaceFeeAmount)",
  "event ItemDelisted(uint256 indexed tokenId, address indexed seller)",
  "event PriceUpdated(uint256 indexed tokenId, address indexed seller, uint256 oldPrice, uint256 newPrice)",
  "event ProceedsWithdrawn(address indexed recipient, uint256 amount)",
] as const

// ===== MODULAR NFT ABI (EXTENSION) =====
// Fonctions supplémentaires nécessaires pour le marketplace

export const MODULAR_NFT_MARKETPLACE_ABI = [
  // Fonctions de base ERC721
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function setApprovalForAll(address operator, bool approved)",
  "function approve(address to, uint256 tokenId)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  
  // Métadonnées
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  
  // Collection info (spécifique ModularNFT)
  "function getCollectionInfo() view returns (tuple)",
  "function tokensOfOwner(address owner) view returns (uint256[])",
  "function getTokenInfo(uint256 tokenId) view returns (tuple)",
  
  // Royalties EIP-2981
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address receiver, uint256 royaltyAmount)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
] as const

// ===== CONSTANTES UTILES =====

export const MARKETPLACE_CONSTANTS = {
  // Basis points
  BASIS_POINTS: 10000,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Cache times (en secondes)
  CACHE_TIME: {
    METADATA: 300,     // 5 minutes
    LISTINGS: 30,      // 30 secondes
    USER_DATA: 60,     // 1 minute
    STATIC_DATA: 3600, // 1 heure
  },
  
  // Formats pour affichage
  DISPLAY_FORMATS: {
    PRICE_DECIMALS: 4,
    PERCENTAGE_DECIMALS: 2,
    DATE_FORMAT: "MMM dd, yyyy HH:mm",
  },
  
  // Statuts
  LISTING_STATUS: {
    ACTIVE: "active",
    SOLD: "sold",
    DELISTED: "delisted",
    EXPIRED: "expired",
  } as const,
  
  // Filtres marketplace
  SORT_OPTIONS: {
    PRICE_LOW_TO_HIGH: "price_asc",
    PRICE_HIGH_TO_LOW: "price_desc", 
    NEWEST_FIRST: "newest",
    OLDEST_FIRST: "oldest",
    RECENTLY_LISTED: "recent_listed",
  } as const,
} as const

export type SortOption = keyof typeof MARKETPLACE_CONSTANTS.SORT_OPTIONS
export type ListingStatus = typeof MARKETPLACE_CONSTANTS.LISTING_STATUS[keyof typeof MARKETPLACE_CONSTANTS.LISTING_STATUS]