// hooks/useUserData.ts - Données utilisateur marketplace (FIXED)
'use client'

import { useAccount, useChainId, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { getContractConfigs } from '@/lib/contracts'
import { useMemo } from 'react'
import type { Address } from 'viem'

export function useUserMarketplaceData() {
  const { address } = useAccount()
  const chainId = useChainId()

  // Configuration contrats
  const contracts = chainId === 11155111 ? getContractConfigs(11155111) : null

  // Récupérer les NFTs possédés par l'utilisateur
  const { data: userNFTsData, isLoading: isLoadingNFTs } = useReadContract({
    address: contracts?.nft.address,
    abi: contracts?.nft.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!contracts && !!address,
    }
  })

  // Récupérer les listings de l'utilisateur
  const { data: userListingIdsData, isLoading: isLoadingListings } = useReadContract({
    address: contracts?.marketplace.address,
    abi: contracts?.marketplace.abi,
    functionName: 'getSellerListings',
    args: address ? [address] : undefined,
    query: {
      enabled: !!contracts && !!address,
      refetchInterval: 10000,
    }
  })

  // Récupérer les revenus de l'utilisateur
  const { data: proceedsData, isLoading: isLoadingProceeds, refetch: refetchProceeds } = useReadContract({
    address: contracts?.marketplace.address,
    abi: contracts?.marketplace.abi,
    functionName: 'getProceeds',
    args: address ? [address] : undefined,
    query: {
      enabled: !!contracts && !!address,
      refetchInterval: 5000,
    }
  })

  // ✅ FIXED: Données formatées avec type assertions
  const userData = useMemo(() => {
    // Type assertions pour les données du contrat
    const userNFTs = userNFTsData as bigint | undefined
    const userListingIds = userListingIdsData as readonly bigint[] | undefined
    const proceeds = proceedsData as bigint | undefined

    return {
      nftBalance: userNFTs ? Number(userNFTs) : 0,
      activeListingsCount: userListingIds?.length || 0,
      listingIds: userListingIds || [],
      proceeds: proceeds || BigInt(0),
      proceedsETH: proceeds ? formatEther(proceeds) : '0',
      hasProceeds: proceeds ? proceeds > BigInt(0) : false,
    }
  }, [userNFTsData, userListingIdsData, proceedsData])

  return {
    ...userData,
    isLoading: isLoadingNFTs || isLoadingListings || isLoadingProceeds,
    refetchProceeds,
  }
}

// Hook pour vérifier si un utilisateur possède un NFT spécifique
export function useIsNFTOwner(tokenId: number) {
  const { address } = useAccount()
  const chainId = useChainId()

  const contracts = chainId === 11155111 ? getContractConfigs(11155111) : null

  const { data: ownerData } = useReadContract({
    address: contracts?.nft.address,
    abi: contracts?.nft.abi,
    functionName: 'ownerOf',
    args: [BigInt(tokenId)],
    query: {
      enabled: !!contracts,
    }
  })

  // ✅ FIXED: Type assertion pour owner
  const owner = ownerData as Address | undefined

  const isOwner = useMemo(() => {
    if (!address || !owner) return false
    return address.toLowerCase() === owner.toLowerCase()
  }, [address, owner])

  return {
    owner,
    isOwner,
  }
}