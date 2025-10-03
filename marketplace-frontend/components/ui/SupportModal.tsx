// components/ui/SupporModal.tsx
'use client'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import emailjs from '@emailjs/browser'

interface SupportModalProps { isOpen: boolean; onClose: () => void }

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
const { address } = useAccount()
const [subject, setSubject] = useState('')
const [message, setMessage] = useState('')
const [sending, setSending] = useState(false)
const [sent, setSent] = useState(false)
const [error, setError] = useState('')

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault()
if (!address) { setError('Please connect your wallet first'); return }
if (!subject.trim() || !message.trim()) { setError('Please fill all fields'); return }
setSending(true)
setError('')
try {
const templateParams = { wallet_address: address, subject: subject.trim(), message: message.trim(), timestamp: new Date().toLocaleString() }
await emailjs.send(process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!, process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!, templateParams, process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!)
setSent(true)
setTimeout(() => { onClose(); setSent(false); setSubject(''); setMessage('') }, 2000)
} catch (err) {
setError('Failed to send message. Please try again.')
} finally {
setSending(false)
}
}

if (!isOpen) return null

return (
<div className="modal-overlay">
<div className="modal-content support-modal">
<div className="modal-header">
<h2 className="modal-title">🎧 Contact Support</h2>
<button onClick={onClose} className="modal-close">×</button>
</div>
{sent ? (
<div className="alert-success">
<p className="alert-success-text">✅ Message sent successfully!</p>
<p className="text-secondary text-center" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>We&apos;ll get back to you soon</p>
</div>
) : (
<form onSubmit={handleSubmit} className="support-form">
<div className="form-group">
<label htmlFor="wallet-address" className="form-label">From Wallet</label>
<input id="wallet-address" type="text" value={address || 'Not connected'} disabled className="form-input form-input--disabled" />
</div>
<div className="form-group">
<label htmlFor="subject" className="form-label">Subject *</label>
<input id="subject" type="text" placeholder="Describe your issue..." value={subject} onChange={(e) => setSubject(e.target.value)} disabled={sending} className="form-input" maxLength={100} />
</div>
<div className="form-group">
<label htmlFor="message" className="form-label">Message *</label>
<textarea id="message" placeholder="Please provide details about your issue, what you were trying to do, and any error messages you received..." value={message} onChange={(e) => setMessage(e.target.value)} disabled={sending} className="form-textarea" rows={6} maxLength={1000} />
<div className="form-helper">Characters: {message.length}/1000</div>
</div>
{error && (
<div className="alert-error">
<p className="alert-error-text">{error}</p>
</div>
)}
<div className="modal-actions">
<button type="button" onClick={onClose} disabled={sending} className="btn" style={{ border: '1px solid #D1D5DB', background: 'transparent' }}>Cancel</button>
<button type="submit" disabled={sending || !address || !subject.trim() || !message.trim()} className="btn btn-primary">{sending ? 'Sending...' : 'Send Message'}</button>
</div>
</form>
)}
</div>
</div>
)
}