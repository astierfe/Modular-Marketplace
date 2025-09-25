// hooks/useTransactionOverlay.ts - Étape 1 : Hook de base pour gestion état transaction
'use client'

import { useState, useCallback } from 'react'

/**
 * Hook pour gérer l'état global des transactions avec overlay
 * Étape 1 : Logique d'état uniquement, pas d'UI
 */
export function useTransactionOverlay() {
  const [isPending, setIsPending] = useState(false)

  /**
   * Démarrer une transaction (afficher overlay)
   */
  const startTransaction = useCallback(() => {
    console.log('🚀 Transaction started - Overlay should appear')
    setIsPending(true)
  }, [])

  /**
   * Terminer une transaction (masquer overlay)
   */
  const endTransaction = useCallback(() => {
    console.log('✅ Transaction ended - Overlay should disappear')
    setIsPending(false)
  }, [])

  // Log de debug pour l'étape 1
  console.log('📊 Transaction state:', { isPending })

  return {
    // État
    isPending,
    
    // Actions
    startTransaction,
    endTransaction,
  }
}