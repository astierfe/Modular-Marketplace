// global.d.ts - Déclarations TypeScript pour modules CSS
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Déclarations pour les modules CSS
declare module '*.css' {
  const content: Record<string, string>
  export default content
}

declare module '*.scss' {
  const content: Record<string, string>
  export default content
}

declare module '*.sass' {
  const content: Record<string, string>
  export default content
}

// Déclarations pour les modules d'images
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

// Déclarations pour les variables d'environnement Next.js
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_DEFAULT_CHAIN: string
    NEXT_PUBLIC_MODULAR_NFT_SEPOLIA: string
    NEXT_PUBLIC_MARKETPLACE_SEPOLIA: string
    NEXT_PUBLIC_MODULAR_NFT_ANVIL: string
    NEXT_PUBLIC_MARKETPLACE_ANVIL: string
    NEXT_PUBLIC_ALCHEMY_API_KEY: string
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: string
    NEXT_PUBLIC_ETHERSCAN_API_KEY: string
    NEXT_PUBLIC_IPFS_GATEWAY: string
    NEXT_PUBLIC_PINATA_GATEWAY: string
    NEXT_PUBLIC_CLOUDFLARE_GATEWAY: string
    NEXT_PUBLIC_MARKETPLACE_FEE: string
    NEXT_PUBLIC_ROYALTY_FEE: string
    NEXT_PUBLIC_MIN_LISTING_PRICE: string
    NEXT_PUBLIC_MAX_LISTING_PRICE: string
    NEXT_PUBLIC_DEBUG: string
    NEXT_PUBLIC_ENABLE_TEST_FEATURES: string
    NEXT_PUBLIC_GA_TRACKING_ID: string
    NEXT_PUBLIC_ANVIL_RPC_URL: string
    NEXT_PUBLIC_SEPOLIA_RPC_URL: string
  }
}