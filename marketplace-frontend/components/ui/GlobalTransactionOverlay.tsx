// components/ui/GlobalTransactionOverlay.tsx - Overlay global qui utilise le contexte
'use client'

import { useTransaction } from '@/contexts/TransactionContext'
import { TransactionOverlay } from './TransactionOverlay'

/**
 * Composant wrapper qui connecte automatiquement l'overlay au contexte global
 */
export function GlobalTransactionOverlay() {
  const { isPending } = useTransaction()
  
  return <TransactionOverlay isVisible={isPending} />
}   