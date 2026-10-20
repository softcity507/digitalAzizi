'use client'

import { startAuthentication, type PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser'
import { invokeWebAuthn, verifySecurityPin } from '@/callapi/security'

/** Requests a challenge and verifies the signed passkey response in authz-api. */
export async function verifyAndAuthorizeAction(_userId: string): Promise<boolean> {
  try {
    const options = await invokeWebAuthn<Record<string, unknown>>('auth-options')
    if (options.error) throw new Error(String(options.error))
    const assertion = await startAuthentication({ optionsJSON: options as unknown as PublicKeyCredentialRequestOptionsJSON })
    const result = await invokeWebAuthn<{ verified: boolean; error?: string }>('auth-verify', { authResp: assertion })
    return Boolean(result.verified)
  } catch (error) {
    console.error('Biometric verification cancelled or failed:', error)
    return false
  }
}

export async function verifyPinAction(_userId: string, pin: string): Promise<boolean> {
  try {
    const result = await verifySecurityPin(pin)
    return Boolean(result.verified)
  } catch (error) {
    console.error('PIN verification error:', error)
    return false
  }
}

export default verifyAndAuthorizeAction
