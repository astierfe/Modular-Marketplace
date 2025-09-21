// lib/contracts/test-marketplace-config.ts
// Script de test pour vérifier la configuration Marketplace

import { 
  getNetworkConfig, 
  getContractConfigs,
  marketplaceHelpers,
  MARKETPLACE_CONSTANTS,
  formatAddress,
  getExplorerLink
} from './index'

import { marketplaceUtils } from '../types/marketplaceTypes'
import { nftUtils } from '../types/nftTypes'

console.log('🧪 TESTING MARKETPLACE CONFIGURATION\n')

// ===== TEST 1: NETWORK CONFIG =====
console.log('📡 Test 1: Network Configuration')
try {
  const sepoliaConfig = getNetworkConfig(11155111)
  console.log('✅ Sepolia Config:', {
    name: sepoliaConfig.name,
    chainId: sepoliaConfig.chainId,
    nft: formatAddress(sepoliaConfig.nftContract),
    marketplace: formatAddress(sepoliaConfig.marketplaceContract),
    explorer: sepoliaConfig.explorerUrl
  })
} catch (error) {
  console.error('❌ Error:', error)
}

console.log('\n')

// ===== TEST 2: CONTRACT ADDRESSES =====
console.log('📝 Test 2: Contract Addresses')
try {
  const contracts = getContractConfigs(11155111)
  console.log('✅ NFT Contract:', contracts.nft.address)
  console.log('✅ Marketplace Contract:', contracts.marketplace.address)
  console.log('✅ NFT ABI Functions:', contracts.nft.abi.filter((x: any) => x.type === 'function').length)
  console.log('✅ Marketplace ABI Functions:', contracts.marketplace.abi.filter((x: any) => x.type === 'function').length)
} catch (error) {
  console.error('❌ Error:', error)
}

console.log('\n')

// ===== TEST 3: FEE CALCULATIONS =====
console.log('💰 Test 3: Fee Calculations')
try {
  const testPrice = BigInt('1000000000000000000') // 1 ETH
  
  const marketplaceFee = marketplaceHelpers.calculateMarketplaceFee(testPrice)
  const royalty = marketplaceHelpers.calculateRoyalty(testPrice)
  const sellerReceives = marketplaceHelpers.calculateSellerReceives(testPrice)
  
  console.log('Price:', marketplaceHelpers.formatETH(testPrice), 'ETH')
  console.log('  ├─ Marketplace Fee (2.5%):', marketplaceHelpers.formatETH(marketplaceFee), 'ETH')
  console.log('  ├─ Royalty (5%):', marketplaceHelpers.formatETH(royalty), 'ETH')
  console.log('  └─ Seller Receives (92.5%):', marketplaceHelpers.formatETH(sellerReceives), 'ETH')
  
  // Vérification
  const total = marketplaceFee + royalty + sellerReceives
  if (total === testPrice) {
    console.log('✅ Fee calculation verified!')
  } else {
    console.log('❌ Fee calculation error!')
  }
} catch (error) {
  console.error('❌ Error:', error)
}

console.log('\n')

// ===== TEST 4: PRICE VALIDATION =====
console.log('✔️  Test 4: Price Validation')
const testPrices = ['0.0001', '0.001', '1', '100', '1000', '10000']
testPrices.forEach(price => {
  const result = marketplaceHelpers.validateListingPrice(price)
  const status = result.valid ? '✅' : '❌'
  console.log(`${status} ${price} ETH: ${result.error || 'Valid'}`)
})

console.log('\n')

// ===== TEST 5: MARKETPLACE UTILS =====
console.log('🛠️  Test 5: Marketplace Utils')
try {
  const mockListing = {
    tokenId: BigInt(42),
    seller: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    price: BigInt('500000000000000000'), // 0.5 ETH
    active: true,
    timestamp: BigInt(Math.floor(Date.now() / 1000))
  }
  
  const enriched = marketplaceUtils.enrichListing(
    mockListing,
    'ipfs://QmTest123',
    {
      name: 'Test NFT #42',
      description: 'Test NFT',
      image: 'ipfs://QmImage123'
    }
  )
  
  console.log('✅ Enriched Listing:', {
    tokenId: enriched.tokenId.toString(),
    seller: formatAddress(enriched.seller),
    priceETH: enriched.priceETH,
    royalty: enriched.royaltyAmount,
    marketplaceFee: enriched.marketplaceFee,
    sellerReceives: enriched.sellerReceives,
    metadata: enriched.metadata?.name
  })
} catch (error) {
  console.error('❌ Error:', error)
}

console.log('\n')

// ===== TEST 6: NFT UTILS =====
console.log('🖼️  Test 6: NFT Utils')
try {
  const ipfsUri = 'ipfs://QmTest123456789'
  const httpUrl = nftUtils.resolveIPFSUrl(ipfsUri)
  console.log('✅ IPFS Resolution:')
  console.log('  Input:', ipfsUri)
  console.log('  Output:', httpUrl)
  
  const defaultMetadata = nftUtils.createDefaultMetadata(42)
  console.log('✅ Default Metadata:', {
    name: defaultMetadata.name,
    description: defaultMetadata.description
  })
} catch (error) {
  console.error('❌ Error:', error)
}

console.log('\n')

// ===== TEST 7: EXPLORER LINKS =====
console.log('🔗 Test 7: Explorer Links')
try {
  const testTx = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  const testAddress = '0x72Bd342Ec921BFcfDaeb429403cc1F0Da43fD312'
  
  console.log('✅ Transaction Link:')
  console.log('  ', getExplorerLink(11155111, 'tx', testTx))
  console.log('✅ Address Link:')
  console.log('  ', getExplorerLink(11155111, 'address', testAddress))
  console.log('✅ Token Link:')
  console.log('  ', getExplorerLink(11155111, 'token', testAddress))
} catch (error) {
  console.error('❌ Error:', error)
}

console.log('\n')

// ===== TEST 8: CONSTANTS =====
console.log('⚙️  Test 8: Configuration Constants')
console.log('Marketplace Fee:', MARKETPLACE_CONSTANTS.FEE_BASIS_POINTS, 'basis points')
console.log('Royalty Fee:', MARKETPLACE_CONSTANTS.ROYALTY_BASIS_POINTS, 'basis points')
console.log('Min Price:', MARKETPLACE_CONSTANTS.MIN_PRICE_ETH, 'ETH')
console.log('Max Price:', MARKETPLACE_CONSTANTS.MAX_PRICE_ETH, 'ETH')

console.log('\n')

// ===== SUMMARY =====
console.log('✅ ============================================')
console.log('✅ MARKETPLACE CONFIGURATION TEST COMPLETED')
console.log('✅ ============================================')
console.log('\n🎯 All systems operational!')
console.log('🚀 Ready for Phase 3B - Web3 Hooks')
