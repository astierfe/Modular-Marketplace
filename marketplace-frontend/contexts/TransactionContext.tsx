// contexts/TransactionContext.tsx - Contexte global pour overlay transaction
'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

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

  const startTransaction = useCallback(() => {
    console.log('🚀 Global transaction started - Overlay should appear')
    setIsPending(true)
  }, [])

  const endTransaction = useCallback(() => {
    console.log('✅ Global transaction ended - Overlay should disappear')
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