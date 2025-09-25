// contexts/TransactionContext.tsx - Contexte global avec timeout automatique
'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'

interface TransactionContextType {
  isPending: boolean
  startTransaction: () => void
  endTransaction: () => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

interface TransactionProviderProps {
  children: ReactNode
}

export function TransactionProvider({ children }: TransactionProviderProps) {
  const [isPending, setIsPending] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startTransaction = useCallback(() => {
    console.log('🚀 Global transaction started - Overlay should appear')
    setIsPending(true)
    
    // ✅ TIMEOUT : Auto-fermeture après 3 minutes (180 secondes)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      console.log('⏱️ Transaction timeout after 60 seconds - Auto-closing overlay')
      console.log('💡 The transaction may still be processing on the blockchain')
      setIsPending(false)
      
      // Optionnel : Notification à l'utilisateur
      if (typeof window !== 'undefined' && 'Notification' in window) {
        new Notification('Transaction Timeout', {
          body: 'Transaction overlay closed after 60 seconds. Check your wallet for transaction status.',
          icon: '/favicon.ico'
        })
      }
      
      timeoutRef.current = null
    }, 60 * 1000) // ✅ 60 secondes = 60 000 ms
  }, [])

  const endTransaction = useCallback(() => {
    console.log('✅ Global transaction ended - Overlay should disappear')
    
    // ✅ NETTOYAGE : Annuler le timeout si transaction terminée avant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    setIsPending(false)
  }, [])

  // Log de debug
  console.log('📊 Global transaction state:', { isPending })

  const value: TransactionContextType = {
    isPending,
    startTransaction,
    endTransaction,
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}

/**
 * Hook pour utiliser le contexte transaction
 */
export function useTransaction() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider')
  }
  return context
}