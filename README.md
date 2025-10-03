# ModularNFT Marketplace

A decentralized peer-to-peer marketplace built exclusively for trading NFTs from the **ModularNFT** smart contract collection.

## Overview

This marketplace enables users to buy and sell ModularNFT tokens with full transparency and security. Key features include:

- **Trade ModularNFT Collection**: Buy and sell NFTs minted exclusively from the ModularNFT contract
- **IPFS Image Display**: View NFT images stored on Pinata directly in the marketplace
- **Flexible Listing**: Set custom prices for your NFTs and manage your listings
- **Instant Withdrawals**: Collect your sales proceeds anytime
- **Built-in Royalties**: Creator royalties and marketplace fees are automatically calculated and distributed as configured by the ModularNFT contract administrator

Built with Next.js 15, Wagmi v2, and Solidity, this marketplace provides a seamless trading experience on Sepolia testnet.

## 🏗️ Architecture

### Smart Contract (`ModularNFTMarketplace.sol`)
- **P2P Marketplace**: Direct trading between users without intermediaries
- **EIP-2981 Support**: Automatic creator royalties management
- **Advanced Security**: Reentrancy protection, emergency pause system
- **Modular Fees**: Configurable marketplace fees (max 10%)
- **Revenue Management**: Secure withdrawal system for sellers/creators

### Frontend (`marketplace-frontend/`)
- **Next.js 15** with App Router and Turbopack
- **React 19** for user interface
- **Tailwind CSS 4** for styling
- **TypeScript** for type safety
- **Modern Architecture** with modular components

## ⚡ Key Features

**Smart Contract:**
- ✅ NFT listing/delisting
- ✅ Direct purchase with automatic fund distribution
- ✅ Dynamic price updates
- ✅ EIP-2981 royalties support
- ✅ Efficient listing enumeration
- ✅ Admin and emergency functions

**Frontend:**
- 🚧 Basic Next.js interface (in development)
- 🎯 Architecture ready for Web3 integration

## 🛠️ Tech Stack

**Blockchain:**
- Solidity 0.8.19
- Foundry for development and testing
- OpenZeppelin for security

**Frontend:**
- Next.js 15 with Turbopack
- React 19
- TypeScript 5
- Tailwind CSS 4
- ESLint for code quality

## Getting Started

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Node.js](https://nodejs.org/) (v18 or later)
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Modular-Marketplace

# Smart contracts setup
forge install
forge build
forge test

# Frontend setup
... in progress
```

### Smart Contract Development

```bash
# Build contracts
forge build

# Run tests
forge test

# Format code
forge fmt

# Gas snapshots
forge snapshot

# Start local blockchain
anvil

# Deploy (example)
forge script script/Deploy.s.sol:DeployScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Frontend Development

```bash
... in progress
```

## 📁 Project Structure

```
Modular-Marketplace/
├── src/                          # Solidity contracts
│   └── ModularNFTMarketplace.sol
├── test/                         # Contract tests
├── script/                       # Deployment scripts
├── lib/                          # Dependencies
├── marketplace-frontend/         # Next.js application
│   ├── src/app/                  # App router pages
│   ├── public/                   # Static assets
│   └── package.json
├── foundry.toml                  # Foundry configuration
└── README.md
```

## 🔒 Security Features

- **Reentrancy Protection**: OpenZeppelin's ReentrancyGuard
- **Pausable Contract**: Emergency stop functionality
- **Access Control**: Owner-only administrative functions
- **Input Validation**: Custom error handling and checks
- **Safe Transfers**: Secure ETH and NFT transfers


### Foundry Tools
- **Forge**: Ethereum testing framework
- **Cast**: Swiss army knife for interacting with EVM smart contracts
- **Anvil**: Local Ethereum node

