// hooks/useNFTMetadata.ts - Hook simplifiÃ© pour Marketplace
'use client'

import { useState, useEffect } from 'react'
import { useChainId, useReadContract } from 'wagmi'
import { getContractConfigs } from '@/lib/contracts'
import { type NFTWithMetadata, metadataUtils } from '@/lib/utils/metadataUtils'

/**
 * Hook pour récupérer le tokenURI d'un NFT spécifique
 */
export function useNFTTokenURI(tokenId: number) {
  const chainId = useChainId()
  const contracts = chainId === 11155111 ? getContractConfigs(11155111) : null

  // Récupérer le tokenURI depuis le contrat NFT
  const { 
    data: tokenURI, 
    isLoading: isLoadingURI,
    error,
    refetch 
  } = useReadContract({
    address: contracts?.nft.address,
    abi: contracts?.nft.abi,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
    query: {
      enabled: !!contracts && tokenId > 0,
    }
  }) as { data: string | undefined; isLoading: boolean; error: any; refetch: () => Promise<any> }

  // Log du tokenURI récupéré (TEST ÉTAPE 5)
  useEffect(() => {
    if (tokenURI) {
      console.log(`📋 TokenURI for NFT #${tokenId}:`, tokenURI)
    }
    if (error) {
      console.error(`❌ Error loading tokenURI for NFT #${tokenId}:`, error)
    }
  }, [tokenURI, tokenId, error])

  return {
    tokenURI: tokenURI as string || '',
    isLoading: isLoadingURI,
    error,
    refetch,
  }
}

/**
 * Hook pour récupérer les métadonnées complètes d'un NFT
 * (Version simplifiée basée sur le projet ModularNFT)
 */
export function useNFTMetadata(tokenId: number) {
  const chainId = useChainId()
  const contracts = chainId === 11155111 ? getContractConfigs(11155111) : null
  
  const [nftData, setNftData] = useState<NFTWithMetadata | null>(null)
  const [loadingMetadata, setLoadingMetadata] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Hook pour récupérer le tokenURI
  const { tokenURI, isLoading: isLoadingURI } = useNFTTokenURI(tokenId)

  // Hook pour récupérer l'owner
  const { data: owner } = useReadContract({
    address: contracts?.nft.address,
    abi: contracts?.nft.abi,
    functionName: 'ownerOf',
    args: [BigInt(tokenId)],
    query: {
      enabled: !!contracts && tokenId > 0,
    }
  }) as { data: `0x${string}` | undefined }

  // Charger les métadonnées IPFS quand tokenURI change
  useEffect(() => {
    if (!tokenURI || !owner) return

    const loadMetadata = async () => {
      console.log(`🔍 Loading metadata for NFT #${tokenId}...`)
      setLoadingMetadata(true)
      setError(null)

      try {
        // Créer l'objet NFT de base
        const nftWithMetadata: NFTWithMetadata = {
          tokenId,
          owner,
          tokenURI,
        }

        // ÉTAPE 6: Fetch métadonnées IPFS
        const metadata = await metadataUtils.fetchMetadata(tokenURI)
        nftWithMetadata.metadata = metadata || metadataUtils.createDefaultMetadata(tokenId)

        console.log(`✅ NFT #${tokenId} data loaded:`, nftWithMetadata)
        setNftData(nftWithMetadata)

      } catch (err) {
        const error = err as Error
        console.error(`❌ Error loading metadata for NFT #${tokenId}:`, error)
        setError(error)
      } finally {
        setLoadingMetadata(false)
      }
    }

    loadMetadata()
  }, [tokenURI, owner, tokenId])

  return {
    nftData,
    tokenURI,
    owner,
    loadingMetadata: isLoadingURI || loadingMetadata,
    error,
  }
}