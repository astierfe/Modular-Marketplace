// hooks/useOwnedTokens.ts - Récupération des NFTs possédés par un utilisateur
'use client'

import { useAccount, useChainId, useReadContract } from 'wagmi'
import { getContractConfigs } from '@/lib/contracts'
import { useMemo } from 'react'

/**
 * Hook pour récupérer les tokenIds des NFTs possédés par l'utilisateur connecté
 */
export function useOwnedTokens() {
  const { address } = useAccount()
  const chainId = useChainId()

  // Configuration contrats
  const contracts = chainId === 11155111 ? getContractConfigs(11155111) : null

  // Récupérer les tokenIds possédés via la fonction tokensOfOwner du contrat ModularNFT
  const { 
    data: ownedTokenIds, 
    isLoading, 
    error,
    refetch 
  } = useReadContract({
    address: contracts?.nft.address,
    abi: contracts?.nft.abi,
    functionName: 'tokensOfOwner',
    args: address ? [address] : undefined,
    query: {
      enabled: !!contracts && !!address,
      refetchInterval: 10000, // Rafraîchir toutes les 10s
    }
  })

  // Convertir les bigints en numbers pour faciliter l'utilisation
  const tokenIds = useMemo(() => {
    if (!ownedTokenIds || !Array.isArray(ownedTokenIds)) return []
    return ownedTokenIds.map(id => Number(id))
  }, [ownedTokenIds])

  // Statistiques
  const stats = useMemo(() => ({
    totalOwned: tokenIds.length,
    tokenIds: tokenIds,
  }), [tokenIds])

  console.log('🔍 useOwnedTokens:', { 
    address, 
    tokenIds, 
    isLoading, 
    error: error?.message 
  })

  return {
    // Données
    tokenIds,           // Array de numbers: [0, 1, 2, ...]
    ownedTokenIds,      // Array de bigints (format brut)
    
    // États
    isLoading,
    error,
    
    // Statistiques
    stats,
    
    // Actions
    refetch,
  }
}