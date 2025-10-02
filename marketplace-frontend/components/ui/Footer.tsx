// components/ui/Footer.tsx
'use client'
import { useState } from 'react'
import { SupportModal } from './SupportModal'

export function Footer() {
const [showSupportModal, setShowSupportModal] = useState(false)

return (
<>
<footer className="footer">
<div className="footer-container">
<div className="footer-content">
<div className="footer-left">
<span className="footer-text">© 2024 ModularNFT Marketplace</span>
</div>
<div className="footer-right">
<button className="footer-support-btn" onClick={() => setShowSupportModal(true)}>
<span className="footer-support-icon">🎧</span>
<span className="footer-support-text">Support</span>
</button>
</div>
</div>
</div>
</footer>
<SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
</>
)
}