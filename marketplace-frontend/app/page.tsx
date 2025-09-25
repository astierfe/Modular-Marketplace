// app/page.tsx - Page d'accueil refactorisée
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '../styles/globals.css'
import './page.css'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/marketplace')
  }, [router])

  return (
    <div className="page-container home-gradient-bg">
      <div className="section-spacing text-center">
        
        <div className="home-icon">
  <Image 
    src="/Modular-Marketplace_logo400_367.png"  
    alt="Modular Marketplace Logo"
    width={400}
    height={367}
    priority
  />
</div>

        <h1 className="home-title">Modular Marketplace</h1>
        <p className="text-secondary">Redirecting to marketplace...</p>
        <div className="loading-spinner" />
      </div>
    </div>
  )
}