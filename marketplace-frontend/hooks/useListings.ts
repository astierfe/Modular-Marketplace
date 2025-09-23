// hooks/useListings.ts - Récupération et gestion des listings
'use client'

import { useAccount, useChainId, useReadContract } from 'wagmi'
import { getContractConfigs, marketplaceHelpers } from '@/lib/contracts'
import { EnrichedListing, MarketplaceListing, ListingFilters } from '@/lib/types/marketplaceTypes'
import { useMemo, useState, useCallback } from 'react'
import { formatEther } from 'viem'

export function useListings() {
  const { address } = useAccount()
  const chainId = useChainId()
  const [filters, setFilters] = useState<ListingFilters>({
    sortBy: 'recent',
    sortOrder: 'desc',
  })

  // Configuration contrats
  const contracts = chainId === 11155111 ? getContractConfigs(11155111) : null

  // Récupérer tous les listings actifs (IDs)
  const { 
    data: activeListingIds, 
    isLoading: isLoadingIds,
    refetch: refetchListingIds 
  } = useReadContract({
    address: contracts?.marketplace.address,
    abi: contracts?.marketplace.abi,
    functionName: 'getActiveListings',
    query: {
      enabled: !!contracts,
      refetchInterval: 10000, // Rafraîchir toutes les 10s
    }
  }) as { data: readonly bigint[] | undefined; isLoading: boolean; refetch: () => Promise<any> }

  // Récupérer les listings de l'utilisateur
  const { 
    data: userListingIds,
    refetch: refetchUserListings 
  } = useReadContract({
    address: contracts?.marketplace.address,
    abi: contracts?.marketplace.abi,
    functionName: 'getSellerListings',
    args: address ? [address] : undefined,
    query: {
      enabled: !!contracts && !!address,
      refetchInterval: 10000,
    }
  }) as { data: readonly bigint[] | undefined; refetch: () => Promise<any> }

  // Récupérer les détails d'un listing
  const useListingDetails = (tokenId: bigint) => {
    return useReadContract({
      address: contracts?.marketplace.address,
      abi: contracts?.marketplace.abi,
      functionName: 'getListing',
      args: [tokenId],
      query: {
        enabled: !!contracts,
      }
    })
  }

  // Récupérer les métadonnées NFT
  const useNFTMetadata = (tokenId: bigint) => {
    return useReadContract({
      address: contracts?.nft.address,
      abi: contracts?.nft.abi,
      functionName: 'tokenURI',
      args: [tokenId],
      query: {
        enabled: !!contracts,
      }
    })
  }

  // Enrichir les listings avec les métadonnées
  const enrichedListings = useMemo(() => {
    if (!activeListingIds || activeListingIds.length === 0) return []

    // Pour l'instant, retourner les listings de base
    // TODO: Charger les métadonnées IPFS en Phase 3C
    const listings: EnrichedListing[] = []
    
    return listings
  }, [activeListingIds])

  // Filtrer et trier les listings
  const filteredListings = useMemo(() => {
    let result = [...enrichedListings]

    // Filtrer par vendeur
    if (filters.seller) {
      result = result.filter(l => l.seller.toLowerCase() === filters.seller!.toLowerCase())
    }

    // Filtrer par prix
    if (filters.minPrice) {
      const minWei = BigInt(parseFloat(filters.minPrice) * 1e18)
      result = result.filter(l => l.price >= minWei)
    }
    if (filters.maxPrice) {
      const maxWei = BigInt(parseFloat(filters.maxPrice) * 1e18)
      result = result.filter(l => l.price <= maxWei)
    }

    // Trier
    result.sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
        case 'price':
          comparison = Number(a.price - b.price)
          break
        case 'recent':
          comparison = Number(b.timestamp - a.timestamp)
          break
        case 'oldest':
          comparison = Number(a.timestamp - b.timestamp)
          break
        case 'tokenId':
          comparison = Number(a.tokenId - b.tokenId)
          break
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [enrichedListings, filters])

  // Récupérer les proceeds de l'utilisateur
  const { data: userProceeds } = useReadContract({
    address: contracts?.marketplace.address,
    abi: contracts?.marketplace.abi,
    functionName: 'getProceeds',
    args: address ? [address] : undefined,
    query: {
      enabled: !!contracts && !!address,
    }
  }) as { data: bigint | undefined }

  // Calculer les statistiques
  const stats = useMemo(() => {
    return {
      totalListings: activeListingIds?.length || 0,
      userListings: userListingIds?.length || 0,
      userProceeds: userProceeds ? formatEther(userProceeds) : '0',
      filteredCount: filteredListings.length,
    }
  }, [activeListingIds, userListingIds, userProceeds, filteredListings])

  // Actions
  const updateFilters = useCallback((newFilters: Partial<ListingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      sortBy: 'recent',
      sortOrder: 'desc',
    })
  }, [])

  const refetchAll = useCallback(async () => {
    await refetchListingIds()
    if (address) {
      await refetchUserListings()
    }
  }, [refetchListingIds, refetchUserListings, address])

  return {
    // Données
    activeListingIds: activeListingIds || [],
    userListingIds: userListingIds || [],
    listings: filteredListings,
    
    // État
    isLoading: isLoadingIds,
    
    // Statistiques
    stats,
    
    // Filtres
    filters,
    updateFilters,
    clearFilters,
    
    // Actions
    refetch: refetchAll,
  }
}

// Hook pour récupérer un listing spécifique enrichi
export function useListingById(tokenId: number) {
  const chainId = useChainId()
  const contracts = chainId === 11155111 ? getContractConfigs(11155111) : null

  // Récupérer le listing
  const { 
    data: listing, 
    isLoading: isLoadingListing,
    refetch: refetchListing
  } = useReadContract({
    address: contracts?.marketplace.address,
    abi: contracts?.marketplace.abi,
    functionName: 'getListing',
    args: [BigInt(tokenId)],
    query: {
      enabled: !!contracts,
    }
  }) as { data: MarketplaceListing | undefined; isLoading: boolean; refetch: () => Promise<any> }

  // Récupérer le tokenURI
  const { 
    data: tokenURI, 
    isLoading: isLoadingURI,
    refetch: refetchURI
  } = useReadContract({
    address: contracts?.nft.address,
    abi: contracts?.nft.abi,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
    query: {
      enabled: !!contracts,
    }
  }) as { data: string | undefined; isLoading: boolean; refetch: () => Promise<any> }

  // Enrichir le listing
  const enrichedListing = useMemo(() => {
    if (!listing || !listing.active) return null

    const priceETH = formatEther(listing.price)
    const royaltyWei = marketplaceHelpers.calculateRoyalty(listing.price)
    const feeWei = marketplaceHelpers.calculateMarketplaceFee(listing.price)
    const sellerWei = marketplaceHelpers.calculateSellerReceives(listing.price)

    return {
      ...listing,
      owner: listing.seller,
      tokenURI: tokenURI as string || '',
      priceETH,
      royaltyAmount: formatEther(royaltyWei),
      marketplaceFee: formatEther(feeWei),
      sellerReceives: formatEther(sellerWei),
    } as EnrichedListing
  }, [listing, tokenURI])

  // Fonction refetch combinée
  const refetch = useCallback(async () => {
    await Promise.all([
      refetchListing(),
      refetchURI()
    ])
  }, [refetchListing, refetchURI])

  return {
    listing: enrichedListing,
    isLoading: isLoadingListing || isLoadingURI,
    refetch,
  }
}