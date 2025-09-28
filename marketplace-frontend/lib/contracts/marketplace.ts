// lib/contracts/Marketplace.ts - Configuration Marketplace
import { type Address } from 'viem'

// ABI ModularNFTMarketplace (extrait de out/ModularNFTMarketplace.sol/ModularNFTMarketplace.json)
export const MARKETPLACE_ABI = [
  // ===== STRUCTURES =====
  {
    "type": "function",
    "name": "getListing",
    "stateMutability": "view",
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "outputs": [{
      "type": "tuple",
      "components": [
        { "name": "tokenId", "type": "uint256" },
        { "name": "seller", "type": "address" },
        { "name": "price", "type": "uint256" },
        { "name": "active", "type": "bool" },
        { "name": "timestamp", "type": "uint256" }
      ]
    }]
  },

  // ===== CORE FUNCTIONS =====
  {
    "type": "function",
    "name": "listItem",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "tokenId", "type": "uint256" },
      { "name": "price", "type": "uint256" }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "buyItem",
    "stateMutability": "payable",
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "outputs": []
  },
  {
    "type": "function",
    "name": "delistItem",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "outputs": []
  },
  {
    "type": "function",
    "name": "updatePrice",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "tokenId", "type": "uint256" },
      { "name": "newPrice", "type": "uint256" }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "withdrawProceeds",
    "stateMutability": "nonpayable",
    "inputs": [],
    "outputs": []
  },

  // ===== VIEW FUNCTIONS =====
  {
    "type": "function",
    "name": "getActiveListings",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256[]" }]
  },
  {
    "type": "function",
    "name": "getSellerListings",
    "stateMutability": "view",
    "inputs": [{ "name": "seller", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256[]" }]
  },
  {
    "type": "function",
    "name": "getProceeds",
    "stateMutability": "view",
    "inputs": [{ "name": "seller", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "getActiveListingsCount",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "modularNFT",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }]
  },
  {
    "type": "function",
    "name": "marketplaceFee",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "feeRecipient",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }]
  },

  // ===== EVENTS =====
  {
    "type": "event",
    "name": "ItemListed",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "indexed": true },
      { "name": "seller", "type": "address", "indexed": true },
      { "name": "price", "type": "uint256", "indexed": false },
      { "name": "timestamp", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "ItemSold",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "indexed": true },
      { "name": "seller", "type": "address", "indexed": true },
      { "name": "buyer", "type": "address", "indexed": true },
      { "name": "price", "type": "uint256", "indexed": false },
      { "name": "royaltyAmount", "type": "uint256", "indexed": false },
      { "name": "marketplaceFeeAmount", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "ItemDelisted",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "indexed": true },
      { "name": "seller", "type": "address", "indexed": true }
    ]
  },
  {
    "type": "event",
    "name": "PriceUpdated",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "indexed": true },
      { "name": "seller", "type": "address", "indexed": true },
      { "name": "oldPrice", "type": "uint256", "indexed": false },
      { "name": "newPrice", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "ProceedsWithdrawn",
    "inputs": [
      { "name": "recipient", "type": "address", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false }
    ]
  },

  // ===== ERRORS =====
  {
    "type": "error",
    "name": "NotTokenOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TokenNotApproved",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidPrice",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TokenAlreadyListed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TokenNotListed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientPayment",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CannotBuyOwnToken",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoProceeds",
    "inputs": []
  }
] as const

// Adresses des contrats par réseau
export const MARKETPLACE_ADDRESSES = {
  // Sepolia Testnet (DÉPLOYÉ)
  11155111: '0x2AE08980761CB189DA6ca1f89fffD0C6DAD65a8F' as Address,
  
  // Anvil Local (pour tests)
  31337: '0x' as Address, // À déployer localement
  
  // Mainnet (non prévu)
  1: '0x' as Address,
} as const

// Helper pour obtenir l'adresse du marketplace
export function getMarketplaceAddress(chainId: keyof typeof MARKETPLACE_ADDRESSES): Address {
  const address = MARKETPLACE_ADDRESSES[chainId]
  if (!address || address === '0x') {
    throw new Error(`Marketplace not deployed on chain ${chainId}`)
  }
  return address
}

// Configuration marketplace
export const MARKETPLACE_CONFIG = {
  FEE_BASIS_POINTS: 250,        // 2.5% commission
  ROYALTY_BASIS_POINTS: 500,    // 5% royalties
  BASIS_POINTS: 10000,          // 100% = 10000
  MIN_PRICE: '0.001',           // Prix minimum en ETH
  MAX_PRICE: '1000',            // Prix maximum en ETH
} as const

// Types TypeScript pour les retours du contrat
export interface MarketplaceListing {
  tokenId: bigint
  seller: Address
  price: bigint
  active: boolean
  timestamp: bigint
}

export interface MarketplaceStats {
  totalListings: number
  activeListings: number
  totalVolume: string
  marketplaceFee: number
}
