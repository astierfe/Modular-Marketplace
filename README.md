# 🎯 Modular Marketplace

**Decentralized P2P NFT marketplace with modern web interface**

## 📋 Overview

The **Modular Marketplace** is a complete NFT trading platform consisting of two main components:

- **Solidity Smart Contract**: Secure decentralized marketplace for P2P NFT trading
- **Next.js Frontend**: Modern and responsive user interface

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

## 🚀 Getting Started

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

## 📝 Project Status

- ✅ **Smart Contract**: Complete and secure
- 🚧 **Frontend**: Basic structure, Web3 interface in development
- 🎯 **Integration**: Blockchain/frontend connection in progress


### Foundry Tools
- **Forge**: Ethereum testing framework
- **Cast**: Swiss army knife for interacting with EVM smart contracts
- **Anvil**: Local Ethereum node

