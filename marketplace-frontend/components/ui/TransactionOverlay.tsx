// components/ui/TransactionOverlay.tsx - Version finale (sans bouton test)
'use client'

interface TransactionOverlayProps {
  isVisible: boolean
}

export function TransactionOverlay({ isVisible }: TransactionOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="transaction-overlay">
      <div className="transaction-overlay-content">
        {/* Spinner */}
        <div className="transaction-spinner" />
        
        {/* Message générique */}
        <p className="transaction-message">
          Transaction in progress...
        </p>
        
        {/* Sous-message avec timeout */}
        <p className="transaction-submessage">
          Please wait and do not close this window (timeout in 60s)
        </p>
      </div>

      {/* Styles CSS intégrés */}
      <style jsx>{`
        .transaction-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
        }
        
        .transaction-overlay-content {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
          max-width: 400px;
          width: 90%;
        }
        
        .dark .transaction-overlay-content {
          background: #1F2937;
          color: white;
        }
        
        .transaction-spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid #E5E7EB;
          border-top-color: #2563EB;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem auto;
        }
        
        .dark .transaction-spinner {
          border-color: #374151;
          border-top-color: #60A5FA;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .transaction-message {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        
        .dark .transaction-message {
          color: #F9FAFB;
        }
        
        .transaction-submessage {
          font-size: 0.875rem;
          color: #6B7280;
          margin: 0;
        }
        
        .dark .transaction-submessage {
          color: #9CA3AF;
        }
      `}</style>
    </div>
  )
}