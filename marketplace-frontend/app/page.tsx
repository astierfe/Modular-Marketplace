// app/page.tsx - Page de test Phase 3A + 3B (VERSION COMPLÈTE CORRIGÉE)
'use client'

import { useAccount, useChainId, useReadContract } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { getContractConfigs, formatAddress, getNetworkConfig } from '@/lib/contracts'
import { useListings } from '@/hooks'
import { useState, useEffect } from 'react'

export default function TestPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [mounted, setMounted] = useState(false)

  // Hook marketplace Phase 3B
  const { activeListingIds = [], stats, isLoading: isLoadingListings } = useListings()

  // Fix hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Configuration contrats
  const contracts = chainId === 11155111 ? getContractConfigs(11155111) : null
  const networkConfig = chainId === 11155111 ? getNetworkConfig(11155111) : null

  // Lecture NFT contract
  const { data: nftName } = useReadContract({
    address: contracts?.nft.address,
    abi: contracts?.nft.abi,
    functionName: 'name',
  })

  const { data: totalSupply } = useReadContract({
    address: contracts?.nft.address,
    abi: contracts?.nft.abi,
    functionName: 'totalSupply',
  })

  // Lecture Marketplace contract
  const { data: marketplaceFee } = useReadContract({
    address: contracts?.marketplace.address,
    abi: contracts?.marketplace.abi,
    functionName: 'marketplaceFee',
  })

  const { data: activeListingsCount } = useReadContract({
    address: contracts?.marketplace.address,
    abi: contracts?.marketplace.abi,
    functionName: 'getActiveListingsCount',
  })

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎨 ModularNFT Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Phase 3A + 3B - Configuration & Hooks Test
          </p>
        </div>

        {/* Connect Button */}
        <div className="flex justify-center">
          <ConnectButton />
        </div>

        {/* Network Info */}
        {isConnected && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">📡 Network Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Chain ID</p>
                <p className="font-mono">{chainId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Network</p>
                <p className="font-semibold">{networkConfig?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Connected Address</p>
                <p className="font-mono">{address ? formatAddress(address) : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Explorer</p>
                <a 
                  href={networkConfig?.explorerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Explorer →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Contract Addresses */}
        {contracts && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">📝 Smart Contracts</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium">ModularNFT Collection</span>
                <code className="text-xs font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                  {formatAddress(contracts.nft.address)}
                </code>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium">Marketplace Contract</span>
                <code className="text-xs font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                  {formatAddress(contracts.marketplace.address)}
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Contract Data */}
        {isConnected && chainId === 11155111 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">📊 Live Contract Data</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NFT Data */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  NFT Collection
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="font-medium">{nftName as string || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Supply:</span>
                    <span className="font-medium">{totalSupply?.toString() || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Marketplace Data */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                  Marketplace
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fee:</span>
                    <span className="font-medium">
                      {marketplaceFee ? `${Number(marketplaceFee) / 100}%` : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Listings:</span>
                    <span className="font-medium">{activeListingsCount?.toString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Marketplace Hooks Phase 3B */}
        {isConnected && chainId === 11155111 && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-4">
              🔗 Marketplace Hooks (Phase 3B)
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-600 dark:text-purple-300">Total listings:</span>
                <strong>{stats?.totalListings ?? 0}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600 dark:text-purple-300">Your listings:</span>
                <strong>{stats?.userListings ?? 0}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600 dark:text-purple-300">Loading:</span>
                <span>{isLoadingListings ? 'Yes' : 'No'}</span>
              </div>
              {Array.isArray(activeListingIds) && activeListingIds.length > 0 && (
                <p className="text-xs text-purple-600 dark:text-purple-300 mt-2">
                  Active IDs: {activeListingIds.slice(0, 3).map((id: bigint) => id.toString()).join(', ')}
                  {activeListingIds.length > 3 && '...'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-2">
            ✅ Phase 3A & 3B - Complete
          </h2>
          <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
            <li>✓ Web3 Providers configured (Wagmi + RainbowKit)</li>
            <li>✓ Contract addresses loaded (Sepolia testnet)</li>
            <li>✓ Type system validated</li>
            <li>✓ Helpers and utilities ready</li>
            <li>✓ Hooks Web3 functional (useMarketplace, useListings, useApproval)</li>
            <li className="font-semibold mt-4">🚀 Ready for Phase 3C - UI Components</li>
          </ul>
        </div>

        {/* Wrong Network Warning */}
        {isConnected && chainId !== 11155111 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
              ⚠️ Wrong Network
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Please switch to Sepolia Testnet to use the marketplace.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}