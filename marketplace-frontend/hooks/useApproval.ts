// hooks/useApproval.ts - Gestion des approbations NFT pour le Marketplace
'use client'

import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getContractConfigs } from '@/lib/contracts'
import { ApprovalState } from '@/lib/types/marketplaceTypes'
import { useCallback, useEffect, useState } from 'react'

export function useMarketplaceApproval() {
  const { address } = useAccount()
  const chainId = useChainId()
  const [approvalState, setApprovalState] = useState<ApprovalState>(ApprovalState.UNKNOWN)

  // Configuration contrats
  const contracts = chainId === 11155111 ? getContractConfigs(11155111) : null

  // Vérifier si le marketplace est approuvé
  const { data: isApproved, refetch: refetchApproval } = useReadContract({
    address: contracts?.nft.address,
    abi: contracts?.nft.abi,
    functionName: 'isApprovedForAll',
    args: address && contracts ? [address, contracts.marketplace.address] : undefined,
    query: {
      enabled: !!address && !!contracts,
    }
  })

  // Hook pour approuver le marketplace
  const { 
    writeContract, 
    data: approvalHash, 
    isPending: isApproving,
    error: approvalError 
  } = useWriteContract()

  // Attendre la confirmation de l'approbation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash: approvalHash,
  })

  // Mettre à jour l'état d'approbation
  useEffect(() => {
    if (isApproving || isConfirming) {
      setApprovalState(ApprovalState.PENDING)
    } else if (isConfirmed) {
      setApprovalState(ApprovalState.APPROVED)
      // Rafraîchir le statut d'approbation
      setTimeout(() => refetchApproval(), 1000)
    } else if (approvalError) {
      setApprovalState(ApprovalState.ERROR)
    } else if (isApproved !== undefined) {
      setApprovalState(isApproved ? ApprovalState.APPROVED : ApprovalState.NOT_APPROVED)
    }
  }, [isApproved, isApproving, isConfirming, isConfirmed, approvalError, refetchApproval])

  // Fonction pour approuver le marketplace
  const approve = useCallback(async () => {
    if (!contracts || !address) {
      console.error('Contracts or address not available')
      return
    }

    try {
      console.log('Approving marketplace for NFT transfers...')
      writeContract({
        address: contracts.nft.address,
        abi: contracts.nft.abi,
        functionName: 'setApprovalForAll',
        args: [contracts.marketplace.address, true],
      })
    } catch (error) {
      console.error('Error approving marketplace:', error)
    }
  }, [contracts, address, writeContract])

  // Fonction pour vérifier l'approbation
  const checkApproval = useCallback(async () => {
    if (!contracts || !address) return
    await refetchApproval()
  }, [contracts, address, refetchApproval])

  return {
    // État
    approvalState,
    isApproved: isApproved || false,
    
    // Actions
    approve,
    checkApproval,
    
    // Statuts
    isApproving: isApproving || isConfirming,
    error: approvalError,
    
    // Transaction
    approvalHash,
  }
}
