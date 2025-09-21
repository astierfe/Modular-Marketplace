// app/test-hooks/page.tsx - Page de test des hooks Phase 3B
'use client'

import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { 
  useMarketplace, 
  useListings, 
  useMarketplaceApproval,
  useUserMarketplaceData,
  useListingById
} from '@/hooks'
import { ApprovalState } from '@/lib/types/marketplaceTypes'

export default function TestHooksPage() {
  const [mounted, setMounted] = useState(false)
  const [testTokenId, setTestTokenId] = useState('1')
  const [testPrice, setTestPrice] = useState('0.01')

  // Hooks marketplace
  const approval = useMarketplaceApproval()
  const marketplace = useMarketplace()
  const listings = useListings()
  const userData = useUserMarketplaceData()
  const { listing: testListing } = useListingById(parseInt(testTokenId) || 1)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Helper pour afficher l'état d'approbation
  const getApprovalStateEmoji = (state: ApprovalState) => {
    switch (state) {
      case ApprovalState.APPROVED: return '✅'
      case ApprovalState.NOT_APPROVED: return '❌'
      case ApprovalState.PENDING: return '⏳'
      case ApprovalState.ERROR: return '⚠️'
      default: return '❓'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">🧪 Test Hooks Phase 3B</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Validation des hooks Web3 Marketplace
          </p>
          <ConnectButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Approval Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              1. Approval Status
              <span>{getApprovalStateEmoji(approval.approvalState)}</span>
            </h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">State:</span>
                <span className="font-mono">{approval.approvalState}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Is Approved:</span>
                <span className="font-mono">{approval.isApproved ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Is Approving:</span>
                <span className="font-mono">{approval.isApproving ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {!approval.isApproved && (
              <button
                onClick={approval.approve}
                disabled={approval.isApproving}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {approval.isApproving ? 'Approving...' : 'Approve Marketplace'}
              </button>
            )}

            {approval.approvalHash && (
              <p className="text-xs text-gray-500 break-all">
                Hash: {approval.approvalHash}
              </p>
            )}
          </div>

          {/* 2. User Data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">2. User Data</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">NFT Balance:</span>
                <span className="font-mono">{userData.nftBalance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Listings:</span>
                <span className="font-mono">{userData.activeListingsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Proceeds:</span>
                <span className="font-mono">{userData.proceedsETH} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Has Proceeds:</span>
                <span className="font-mono">{userData.hasProceeds ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {userData.hasProceeds && (
              <button
                onClick={marketplace.withdrawProceeds}
                disabled={marketplace.isPending}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {marketplace.isPending ? 'Withdrawing...' : 'Withdraw Proceeds'}
              </button>
            )}
          </div>

          {/* 3. Marketplace Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">3. Marketplace Stats</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Listings:</span>
                <span className="font-mono">{listings.stats.totalListings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">My Listings:</span>
                <span className="font-mono">{listings.stats.userListings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Filtered Count:</span>
                <span className="font-mono">{listings.stats.filteredCount}</span>
              </div>
            </div>

            {listings.activeListingIds.length > 0 && (
              <div className="text-xs text-gray-500">
                <p className="font-semibold mb-1">Active IDs:</p>
                <p className="font-mono break-all">
                  {listings.activeListingIds.slice(0, 5).map(id => id.toString()).join(', ')}
                  {listings.activeListingIds.length > 5 && '...'}
                </p>
              </div>
            )}

            <button
              onClick={listings.refetch}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Refresh Listings
            </button>
          </div>

          {/* 4. Transaction Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">4. Transaction Status</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Is Pending:</span>
                <span className="font-mono">{marketplace.isPending ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Is Confirming:</span>
                <span className="font-mono">{marketplace.isConfirming ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Is Confirmed:</span>
                <span className="font-mono">{marketplace.isConfirmed ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {marketplace.hash && (
              <div className="text-xs text-gray-500">
                <p className="font-semibold mb-1">Transaction Hash:</p>
                <p className="font-mono break-all">{marketplace.hash}</p>
              </div>
            )}

            {marketplace.error && (
              <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                <p className="font-semibold">Error:</p>
                <p>{marketplace.error.message}</p>
              </div>
            )}
          </div>

          {/* 5. Test Actions - List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">5. Test List Item</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Token ID:</label>
                <input
                  type="number"
                  value={testTokenId}
                  onChange={(e) => setTestTokenId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="Token ID"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Price (ETH):</label>
                <input
                  type="text"
                  value={testPrice}
                  onChange={(e) => setTestPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="0.01"
                />
              </div>

              <button
                onClick={() => {
                  marketplace.listItem({ 
                    tokenId: parseInt(testTokenId), 
                    price: testPrice 
                  })
                }}
                disabled={!approval.isApproved || marketplace.isPending}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {marketplace.isPending ? 'Listing...' : 'List NFT'}
              </button>

              {!approval.isApproved && (
                <p className="text-xs text-yellow-600">
                  ⚠️ Approve marketplace first
                </p>
              )}
            </div>
          </div>

          {/* 6. Test Listing Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">6. Listing Details</h2>
            
            <div className="space-y-2 text-sm">
              {testListing ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token ID:</span>
                    <span className="font-mono">{testListing.tokenId.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-mono">{testListing.priceETH} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seller:</span>
                    <span className="font-mono text-xs">{testListing.seller.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Royalty:</span>
                    <span className="font-mono">{testListing.royaltyAmount} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marketplace Fee:</span>
                    <span className="font-mono">{testListing.marketplaceFee} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seller Receives:</span>
                    <span className="font-mono">{testListing.sellerReceives} ETH</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Not listed or loading...
                </p>
              )}
            </div>

            {testListing && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    marketplace.buyItem({ 
                      tokenId: parseInt(testTokenId), 
                      price: testListing.priceETH 
                    })
                  }}
                  disabled={marketplace.isPending}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {marketplace.isPending ? 'Buying...' : `Buy for ${testListing.priceETH} ETH`}
                </button>

                <button
                  onClick={() => marketplace.delistItem(parseInt(testTokenId))}
                  disabled={marketplace.isPending}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {marketplace.isPending ? 'Delisting...' : 'Delist NFT'}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Success Message */}
        {marketplace.isConfirmed && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <p className="text-green-800 dark:text-green-200 font-semibold">
              ✅ Transaction Confirmed!
            </p>
            <p className="text-sm text-green-600 dark:text-green-300 mt-2">
              Hash: {marketplace.hash}
            </p>
          </div>
        )}

        {/* Phase Status */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2">
            🎯 Phase 3B - Hooks Web3
          </h2>
          <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <li>✅ useMarketplaceApproval - Gestion approbations</li>
            <li>✅ useMarketplace - Actions (list, buy, delist, withdraw)</li>
            <li>✅ useListings - Récupération listings</li>
            <li>✅ useUserMarketplaceData - Données utilisateur</li>
            <li>✅ useListingById - Détails listing spécifique</li>
          </ul>
          <p className="mt-4 font-semibold text-blue-800 dark:text-blue-200">
            🚀 Ready for Phase 3C - UI Components
          </p>
        </div>

      </div>
    </div>
  )
}
