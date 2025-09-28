// lib/contracts/index.ts - Configuration combinée des contrats (FIXED CASING)
import { type Address } from 'viem'
import { MODULAR_NFT_ABI, getContractAddress as getNFTAddress } from './ModularNFT'
import { 
  MARKETPLACE_ABI, 
  MARKETPLACE_CONFIG 
} from './marketplace' // ✅ FIXED: lowercase

// Types de chaînes supportées
export type SupportedChainId = 31337 | 11155111 | 1

// Configuration complète par réseau
export interface NetworkConfig {
  chainId: SupportedChainId
  name: string
  nftContract: Address
  marketplaceContract: Address
  rpcUrl: string
  explorerUrl: string
  currency: string
}

// Configurations réseau
export const NETWORK_CONFIGS: Record<SupportedChainId, NetworkConfig> = {
  // Anvil Local
  31337: {
    chainId: 31337,
    name: 'Anvil',
    nftContract: process.env.NEXT_PUBLIC_MODULAR_NFT_ANVIL as Address || '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
    marketplaceContract: process.env.NEXT_PUBLIC_MARKETPLACE_ANVIL as Address || '0x' as Address,
    rpcUrl: process.env.NEXT_PUBLIC_ANVIL_RPC_URL || 'http://localhost:8545',
    explorerUrl: 'http://localhost:8545',
    currency: 'ETH'
  },
  
  // Sepolia Testnet
  11155111: {
    chainId: 11155111,
    name: 'Sepolia',
    nftContract: process.env.NEXT_PUBLIC_MODULAR_NFT_SEPOLIA as Address || '0xd34F288Fa68b657926989EF286477E9f3C87A825' as Address,
    marketplaceContract: process.env.NEXT_PUBLIC_MARKETPLACE_SEPOLIA as Address || '0x7AbcF4d2B55a5FE578A42B4d3C0be2F4820d26eC' as Address,
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || '',
    explorerUrl: 'https://sepolia.etherscan.io',
    currency: 'SepoliaETH'
  },
  
  // Ethereum Mainnet (non prévu, pour référence)
  1: {
    chainId: 1,
    name: 'Ethereum',
    nftContract: '0x' as Address,
    marketplaceContract: '0x' as Address,
    rpcUrl: '',
    explorerUrl: 'https://etherscan.io',
    currency: 'ETH'
  }
}

// Configuration par défaut (Sepolia)
export const DEFAULT_CHAIN_ID = (parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN || '11155111') as SupportedChainId)

// Helper pour obtenir la config réseau
export function getNetworkConfig(chainId: SupportedChainId): NetworkConfig {
  const config = NETWORK_CONFIGS[chainId]
  if (!config) {
    throw new Error(`Network configuration not found for chain ${chainId}`)
  }
  return config
}

// Helper pour obtenir l'adresse NFT
export function getNFTContractAddress(chainId: SupportedChainId): Address {
  const config = getNetworkConfig(chainId)
  if (!config.nftContract || config.nftContract === '0x') {
    throw new Error(`NFT contract not deployed on chain ${chainId}`)
  }
  return config.nftContract
}

// Helper pour obtenir l'adresse Marketplace
export function getMarketplaceContractAddress(chainId: SupportedChainId): Address {
  const config = getNetworkConfig(chainId)
  if (!config.marketplaceContract || config.marketplaceContract === '0x') {
    throw new Error(`Marketplace contract not deployed on chain ${chainId}`)
  }
  return config.marketplaceContract
}

// Configuration complète des contrats pour Wagmi
export function getContractConfigs(chainId: SupportedChainId) {
  return {
    nft: {
      address: getNFTContractAddress(chainId),
      abi: MODULAR_NFT_ABI,
    },
    marketplace: {
      address: getMarketplaceContractAddress(chainId),
      abi: MARKETPLACE_ABI,
    }
  }
}

// Export des ABIs
export { MODULAR_NFT_ABI, MARKETPLACE_ABI }

// Export des constantes
export { MARKETPLACE_CONFIG }

// Helper pour formater les adresses
export function formatAddress(address: Address, length: number = 4): string {
  return `${address.slice(0, 2 + length)}...${address.slice(-length)}`
}

// Helper pour obtenir le lien explorateur
export function getExplorerLink(
  chainId: SupportedChainId,
  type: 'tx' | 'address' | 'token',
  hash: string
): string {
  const config = getNetworkConfig(chainId)
  
  switch (type) {
    case 'tx':
      return `${config.explorerUrl}/tx/${hash}`
    case 'address':
      return `${config.explorerUrl}/address/${hash}`
    case 'token':
      return `${config.explorerUrl}/token/${hash}`
    default:
      return config.explorerUrl
  }
}

// Constantes marketplace
export const MARKETPLACE_CONSTANTS = {
  FEE_BASIS_POINTS: parseInt(process.env.NEXT_PUBLIC_MARKETPLACE_FEE || '250'),
  ROYALTY_BASIS_POINTS: parseInt(process.env.NEXT_PUBLIC_ROYALTY_FEE || '500'),
  BASIS_POINTS: 10000,
  MIN_PRICE_ETH: parseFloat(process.env.NEXT_PUBLIC_MIN_LISTING_PRICE || '0.001'),
  MAX_PRICE_ETH: parseFloat(process.env.NEXT_PUBLIC_MAX_LISTING_PRICE || '1000'),
} as const

// Helpers de calcul
export const marketplaceHelpers = {
  /**
   * Calculer la commission marketplace
   */
  calculateMarketplaceFee: (priceWei: bigint): bigint => {
    return (priceWei * BigInt(MARKETPLACE_CONSTANTS.FEE_BASIS_POINTS)) / BigInt(MARKETPLACE_CONSTANTS.BASIS_POINTS)
  },
  
  /**
   * Calculer les royalties
   */
  calculateRoyalty: (priceWei: bigint): bigint => {
    return (priceWei * BigInt(MARKETPLACE_CONSTANTS.ROYALTY_BASIS_POINTS)) / BigInt(MARKETPLACE_CONSTANTS.BASIS_POINTS)
  },
  
  /**
   * Calculer ce que reçoit le vendeur
   */
  calculateSellerReceives: (priceWei: bigint): bigint => {
    const fee = marketplaceHelpers.calculateMarketplaceFee(priceWei)
    const royalty = marketplaceHelpers.calculateRoyalty(priceWei)
    return priceWei - fee - royalty
  },
  
  /**
   * Formatter un montant en ETH
   */
  formatETH: (wei: bigint, decimals: number = 4): string => {
    const eth = Number(wei) / 1e18
    return eth.toFixed(decimals)
  },
  
  /**
   * Parser un montant ETH vers Wei
   */
  parseETH: (eth: string): bigint => {
    const num = parseFloat(eth)
    if (isNaN(num) || num < 0) {
      throw new Error('Invalid ETH amount')
    }
    return BigInt(Math.floor(num * 1e18))
  },
  
  /**
   * Valider un prix de listing
   */
  validateListingPrice: (priceETH: string): { valid: boolean; error?: string } => {
    const price = parseFloat(priceETH)
    
    if (isNaN(price)) {
      return { valid: false, error: 'Invalid price format' }
    }
    
    if (price < MARKETPLACE_CONSTANTS.MIN_PRICE_ETH) {
      return { 
        valid: false, 
        error: `Price must be at least ${MARKETPLACE_CONSTANTS.MIN_PRICE_ETH} ETH` 
      }
    }
    
    if (price > MARKETPLACE_CONSTANTS.MAX_PRICE_ETH) {
      return { 
        valid: false, 
        error: `Price cannot exceed ${MARKETPLACE_CONSTANTS.MAX_PRICE_ETH} ETH` 
      }
    }
    
    return { valid: true }
  }
}