// hooks/useUserData.ts - Données utilisateur marketplace
'use client'

import { useAccount, useChainId, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { getContractConfigs } from '@/lib/contracts'
import { useMemo } from 'react'

export function useUserMarketplaceData() {
  const { address } = useAccount()
  const chainId = useChainId()

  // Configuration contrats
  const contracts = chainId === 11155111 ? getContractConfigs(11155111) : null

  // Récupérer les NFTs possédés par l'utilisateur
  const { data: userNFTs, isLoading: isLoadingNFTs } = useReadContract({
    address: contracts?.nft.address,
    abi: contracts?.nft.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!contracts && !!address,
    }
  })

  // Récupérer les listings de l'utilisateur
  const { data: userListingIds, isLoading: isLoadingListings } = useReadContract({
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
  const { data: proceeds, isLoading: isLoadingProceeds, refetch: refetchProceeds } = useReadContract({
    address: contracts?.marketplace.address,
    abi: contracts?.marketplace.abi,
    functionName: 'getProceeds',
    args: address ? [address] : undefined,
    query: {
      enabled: !!contracts && !!address,
      refetchInterval: 5000,
    }
  })

  // Données formatées
  const userData = useMemo(() => {
    return {
      nftBalance: userNFTs ? Number(userNFTs) : 0,
      activeListingsCount: userListingIds?.length || 0,
      listingIds: userListingIds || [],
      proceeds: proceeds || BigInt(0),
      proceedsETH: proceeds ? formatEther(proceeds) : '0',
      hasProceeds: proceeds ? proceeds > BigInt(0) : false,
    }
  }, [userNFTs, userListingIds, proceeds])

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

  const { data: owner } = useReadContract({
    address: contracts?.nft.address,
    abi: contracts?.nft.abi,
    functionName: 'ownerOf',
    args: [BigInt(tokenId)],
    query: {
      enabled: !!contracts,
    }
  })

  const isOwner = useMemo(() => {
    if (!address || !owner) return false
    return address.toLowerCase() === owner.toLowerCase()
  }, [address, owner])

  return {
    owner,
    isOwner,
  }
}
