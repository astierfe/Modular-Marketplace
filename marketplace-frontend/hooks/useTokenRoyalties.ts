// hooks/useTokenRoyalties.ts - Version 1.0
// Hook pour récupérer les royalties d'un NFT spécifique
'use client'

import { useChainId, useReadContract } from 'wagmi'
import { getContractConfigs } from '@/lib/contracts'
import { useMemo } from 'react'

/**
 * Structure retournée par getTokenInfo du contrat ModularNFT
 * Selon la spec, c'est un tuple avec en dernier le pourcentage de royalties
 */
interface TokenInfo {
  // ... autres champs du tuple selon votre contrat
  royaltyPercentage: bigint // Le dernier élément du tuple (/100)
}

/**
 * Hook pour récupérer le pourcentage de royalties d'un token
 */
export function useTokenRoyalties(tokenId: number) {
  const chainId = useChainId()
  const contracts = chainId === 11155111 ? getContractConfigs(11155111) : null

  // Récupérer les infos du token depuis le contrat NFT
  const { 
    data: tokenInfo, 
    isLoading,
    error 
  } = useReadContract({
    address: contracts?.nft.address,
    abi: contracts?.nft.abi,
    functionName: 'getTokenInfo',
    args: [BigInt(tokenId)],
    query: {
      enabled: !!contracts && tokenId >= 0,
    }
  })

  // Extraire et formater le pourcentage de royalties
  const royaltyData = useMemo(() => {
    if (!tokenInfo) {
      return {
        percentage: 5, // Fallback par défaut
        basisPoints: 500,
        formatted: '5%'
      }
    }

    // tokenInfo est un tuple, le dernier élément est royaltyPercentage
    // Si getTokenInfo retourne [owner, creator, ..., royaltyPercentage]
    const royaltyPercentage = Array.isArray(tokenInfo) 
      ? Number(tokenInfo[tokenInfo.length - 1]) 
      : 5

    return {
      percentage: royaltyPercentage,
      basisPoints: royaltyPercentage * 100, // Conversion en basis points
      formatted: `${royaltyPercentage}%`
    }
  }, [tokenInfo])

  // Calculer le montant de royalties pour un prix donné
  const calculateRoyaltyAmount = (priceWei: bigint): bigint => {
    return (priceWei * BigInt(royaltyData.basisPoints)) / BigInt(10000)
  }

  // Formatter le montant en ETH
  const formatRoyaltyAmount = (priceWei: bigint): string => {
    const royaltyWei = calculateRoyaltyAmount(priceWei)
    const royaltyETH = Number(royaltyWei) / 1e18
    return royaltyETH.toFixed(4)
  }

  return {
    // Données brutes
    percentage: royaltyData.percentage,
    basisPoints: royaltyData.basisPoints,
    formatted: royaltyData.formatted,
    
    // États
    isLoading,
    error,
    
    // Helpers
    calculateRoyaltyAmount,
    formatRoyaltyAmount,
  }
}

/**
 * Hook pour calculer les royalties à partir d'un listing enrichi
 */
export function useListingRoyalties(tokenId: number, priceETH: string) {
  const { percentage, formatted, formatRoyaltyAmount } = useTokenRoyalties(tokenId)
  
  const royaltyAmount = useMemo(() => {
    if (!priceETH || priceETH === '0') return '0.0000'
    
    try {
      const priceWei = BigInt(Math.floor(parseFloat(priceETH) * 1e18))
      return formatRoyaltyAmount(priceWei)
    } catch {
      return '0.0000'
    }
  }, [priceETH, formatRoyaltyAmount])

  return {
    percentage,
    formatted,
    royaltyAmount,
  }
}