// lib/utils/metadataUtils.ts - Utilitaires IPFS adaptés pour Marketplace
import { type Address } from 'viem'

// ===== TYPES =====

import { type NFTMetadata } from '@/lib/types/nftTypes'

export interface NFTWithMetadata {
  tokenId: number
  owner: Address
  tokenURI: string
  metadata?: NFTMetadata
}

// ===== CONSTANTES =====

// Gateways IPFS avec priorité
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
] as const

// ===== FONCTIONS UTILITAIRES =====

export const metadataUtils = {
  /**
   * Convertir une URI IPFS vers une URL HTTP gateway
   */
  ipfsToHttp: (ipfsUri: string, gatewayIndex: number = 0): string => {
    if (!ipfsUri) {
      console.warn('Empty IPFS URI provided')
      return ''
    }
    
    // Cas 1: URL HTTP malformée avec /ipfs/ipfs://
    if (ipfsUri.includes('/ipfs/ipfs://')) {
      let result = ipfsUri.replace('/ipfs/ipfs://', '/ipfs/')
      console.log(`🧹 Fixed malformed URL: ${ipfsUri} → ${result}`)
      return result
    }
    
    // Cas 2: URL HTTP normale
    if (ipfsUri.startsWith('http://') || ipfsUri.startsWith('https://')) {
      console.log(`✅ Already HTTP URL: ${ipfsUri}`)
      return ipfsUri
    }
    
    // Cas 3: URI IPFS pure (ipfs://hash)
    if (ipfsUri.startsWith('ipfs://')) {
      const hash = ipfsUri.replace('ipfs://', '')
      if (!hash) {
        console.warn('Invalid IPFS URI, no hash found:', ipfsUri)
        return ''
      }
      
      const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0]
      const httpUrl = `${gateway}${hash}`
      console.log(`🔄 IPFS → HTTP: ${ipfsUri} → ${httpUrl}`)
      return httpUrl
    }
    
    // Cas 4: autre format, retourner tel quel
    console.log(`⚠️ Unknown format, returning as-is: ${ipfsUri}`)
    return ipfsUri
  },

  /**
   * Récupérer les métadonnées JSON depuis IPFS avec retry
   */
  fetchMetadata: async (
    tokenURI: string, 
    maxRetries: number = 3
  ): Promise<NFTMetadata | null> => {
    if (!tokenURI) {
      console.warn('Empty tokenURI provided to fetchMetadata')
      return null
    }

    console.log('🔍 Fetching metadata from:', tokenURI)
    
    // Nettoyer l'URL malformée
    let cleanUrl = tokenURI.replace('/ipfs/ipfs://', '/ipfs/')
    console.log('🧹 Cleaned URL:', cleanUrl)
    
    try {
      const response = await fetch(cleanUrl, {
        headers: { 'Accept': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const metadata = await response.json() as NFTMetadata
      
      if (!metadata.name && !metadata.image) {
        throw new Error('Invalid metadata structure')
      }
      
      // Nettoyer l'image IPFS si nécessaire
      if (metadata.image?.startsWith('ipfs://')) {
        metadata.image = metadataUtils.ipfsToHttp(metadata.image)
      }
      
      console.log('✅ Metadata loaded successfully:', {
        name: metadata.name,
        image: metadata.image?.substring(0, 50) + '...',
        attributes: metadata.attributes?.length || 0
      })
      
      return metadata
      
    } catch (error) {
      console.error('❌ Failed to fetch metadata:', error)
      return null
    }
  },

  /**
   * Créer des métadonnées par défaut
   */
  createDefaultMetadata: (tokenId: number): NFTMetadata => {
    const metadata: NFTMetadata = {
      name: `ModularNFT #${tokenId}`,
      description: `NFT Token #${tokenId} from the ModularNFT collection`,
      image: 'https://via.placeholder.com/400x400/2563EB/FFFFFF?text=NFT+' + tokenId,
      attributes: []
    }
    
    console.log('📝 Created default metadata for token', tokenId)
    return metadata
  },

  /**
   * Valider une structure de métadonnées
   */
  validateMetadata: (metadata: unknown): metadata is NFTMetadata => {
    if (!metadata || typeof metadata !== 'object') {
      return false
    }
    
    const m = metadata as Partial<NFTMetadata>
    const hasName = typeof m.name === 'string' && m.name.length > 0
    const hasImage = typeof m.image === 'string' && m.image.length > 0
    const hasDescription = typeof m.description === 'string'
    
    return hasName && (hasImage || hasDescription)
  },

  /**
   * Nettoyer et normaliser les métadonnées
   */
  normalizeMetadata: (metadata: unknown, tokenId: number): NFTMetadata => {
    if (!metadataUtils.validateMetadata(metadata)) {
      console.warn('Invalid metadata structure, using defaults for token', tokenId)
      return metadataUtils.createDefaultMetadata(tokenId)
    }
    
    const m = metadata as NFTMetadata
    
    return {
      name: m.name.trim(),
      description: m.description?.trim() || '',
      image: m.image?.trim() || '',
      external_url: m.external_url?.trim() || undefined,
      animation_url: m.animation_url?.trim() || undefined,
      background_color: m.background_color?.trim() || undefined,
      attributes: Array.isArray(m.attributes) ? m.attributes : []
    }
  },

  /**
   * Obtenir tous les gateways disponibles
   */
  getAvailableGateways: () => [...IPFS_GATEWAYS],

  /**
   * Tester la connectivité d'un gateway IPFS
   */
  testGateway: async (gatewayUrl: string): Promise<boolean> => {
    try {
      const testHash = 'QmQJ68PFMDdAsgCZvA1UVzzn18asVcf7HVvCDL9KQCM5FC'
      const testUrl = `${gatewayUrl}${testHash}`
      
      const response = await fetch(testUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })
      
      return response.ok
    } catch (error) {
      console.warn(`Gateway ${gatewayUrl} not accessible:`, error)
      return false
    }
  }
}

// ===== EXPORT PAR DÉFAUT =====

export default metadataUtils