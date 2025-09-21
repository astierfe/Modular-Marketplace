// hooks/useMarketplace.ts - Actions principales du marketplace
'use client'

import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { getContractConfigs, marketplaceHelpers } from '@/lib/contracts'
import { useState, useCallback } from 'react'
import { CreateListingParams, BuyItemParams } from '@/lib/types/marketplaceTypes'

export function useMarketplace() {
  const { address } = useAccount()
  const chainId = useChainId()
  const [error, setError] = useState<Error | null>(null)

  // Configuration contrats
  const contracts = chainId === 11155111 ? getContractConfigs(11155111) : null

  // Hook pour écrire sur le contrat
  const { 
    writeContract, 
    data: hash, 
    isPending,
    error: writeError,
    reset 
  } = useWriteContract()

  // Attendre la confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash,
  })

  // ===== LIST ITEM =====
  const listItem = useCallback(async ({ tokenId, price }: CreateListingParams) => {
    if (!contracts || !address) {
      throw new Error('Wallet not connected or wrong network')
    }

    try {
      setError(null)
      
      // Valider le prix
      const validation = marketplaceHelpers.validateListingPrice(price)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const priceWei = parseEther(price)
      
      console.log('Listing NFT:', { tokenId, price, priceWei: priceWei.toString() })

      writeContract({
        address: contracts.marketplace.address,
        abi: contracts.marketplace.abi,
        functionName: 'listItem',
        args: [BigInt(tokenId), priceWei],
      })
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    }
  }, [contracts, address, writeContract])

  // ===== BUY ITEM =====
  const buyItem = useCallback(async ({ tokenId, price }: BuyItemParams) => {
    if (!contracts || !address) {
      throw new Error('Wallet not connected or wrong network')
    }

    try {
      setError(null)
      const priceWei = parseEther(price)
      
      console.log('Buying NFT:', { tokenId, price, priceWei: priceWei.toString() })

      writeContract({
        address: contracts.marketplace.address,
        abi: contracts.marketplace.abi,
        functionName: 'buyItem',
        args: [BigInt(tokenId)],
        value: priceWei,
      })
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    }
  }, [contracts, address, writeContract])

  // ===== DELIST ITEM =====
  const delistItem = useCallback(async (tokenId: number) => {
    if (!contracts || !address) {
      throw new Error('Wallet not connected or wrong network')
    }

    try {
      setError(null)
      
      console.log('Delisting NFT:', { tokenId })

      writeContract({
        address: contracts.marketplace.address,
        abi: contracts.marketplace.abi,
        functionName: 'delistItem',
        args: [BigInt(tokenId)],
      })
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    }
  }, [contracts, address, writeContract])

  // ===== UPDATE PRICE =====
  const updatePrice = useCallback(async (tokenId: number, newPrice: string) => {
    if (!contracts || !address) {
      throw new Error('Wallet not connected or wrong network')
    }

    try {
      setError(null)
      
      // Valider le nouveau prix
      const validation = marketplaceHelpers.validateListingPrice(newPrice)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const priceWei = parseEther(newPrice)
      
      console.log('Updating price:', { tokenId, newPrice, priceWei: priceWei.toString() })

      writeContract({
        address: contracts.marketplace.address,
        abi: contracts.marketplace.abi,
        functionName: 'updatePrice',
        args: [BigInt(tokenId), priceWei],
      })
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    }
  }, [contracts, address, writeContract])

  // ===== WITHDRAW PROCEEDS =====
  const withdrawProceeds = useCallback(async () => {
    if (!contracts || !address) {
      throw new Error('Wallet not connected or wrong network')
    }

    try {
      setError(null)
      
      console.log('Withdrawing proceeds...')

      writeContract({
        address: contracts.marketplace.address,
        abi: contracts.marketplace.abi,
        functionName: 'withdrawProceeds',
      })
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    }
  }, [contracts, address, writeContract])

  return {
    // Actions
    listItem,
    buyItem,
    delistItem,
    updatePrice,
    withdrawProceeds,
    
    // État
    isPending,
    isConfirming,
    isConfirmed,
    error: error || writeError,
    
    // Transaction
    hash,
    
    // Helpers
    reset,
  }
}
