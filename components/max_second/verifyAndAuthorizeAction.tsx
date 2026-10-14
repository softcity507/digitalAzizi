'use client'

import { startAuthentication } from '@simplewebauthn/browser'

/**
 * Prompts user for biometric verification (Touch ID, Face ID, Windows Hello, Phone scanner)
 * and verifies cryptographic signature against registered credentials.
 */
export async function verifyAndAuthorizeAction(userId: string): Promise<boolean> {
  try {
    // 1. Request authentication challenge
    const res = await fetch('/api/auth/webauthn/auth-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.warn('Biometric auth-options error:', errData.error || 'Server error')
      return false
    }

    const opts = await res.json()
    if (!opts || opts.error) {
      console.warn('Biometric auth options error:', opts?.error)
      return false
    }

    // 2. Prompt phone/device fingerprint scanner
    const authResp = await startAuthentication(opts)

    // 3. Verify signature on the server
    const verifyRes = await fetch('/api/auth/webauthn/auth-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, authResp }),
    })

    const result = await verifyRes.json().catch(() => ({ verified: false }))
    return Boolean(result.verified)
  } catch (error) {
    console.error('Biometric verification cancelled or failed:', error)
    return false
  }
}

export default verifyAndAuthorizeAction