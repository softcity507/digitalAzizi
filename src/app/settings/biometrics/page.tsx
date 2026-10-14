'use client'

import React, { useState, useEffect } from 'react'
import { startRegistration, browserSupportsWebAuthn } from '@simplewebauthn/browser'
import { supabaseClient } from '@/lib/supabaseClient'
import verifyAndAuthorizeAction from '@/components/max_second/verifyAndAuthorizeAction'
import Link from 'next/link'
import {
  Fingerprint,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  Lock,
  Check,
} from 'lucide-react'
import { APP_LOCK_KEY } from '@/components/max_second/AppLockGuard'

export default function RegisterBiometric() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string; name?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [testing, setTesting] = useState(false)
  const [supported, setSupported] = useState<boolean | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  // App lock & PIN states
  const [isAppLock, setIsAppLock] = useState(false)
  const [hasPin, setHasPin] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [savingPin, setSavingPin] = useState(false)
  const [showPinInput, setShowPinInput] = useState(false)

  // 1. Fetch user session and security status on mount
  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        setSupported(browserSupportsWebAuthn())
        setIsAppLock(localStorage.getItem(APP_LOCK_KEY) === 'true')

        let userObj: { id: string; email?: string; name?: string } | null = null

        // Check Supabase Auth Client
        const { data: authData } = await supabaseClient.auth.getUser()
        if (authData?.user) {
          userObj = {
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0],
          }
        } else {
          // Fallback to application session endpoint
          const res = await fetch('/api/auth/me')
          const data = await res.json()
          if (data.success && data.user) {
            userObj = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
            }
          }
        }

        if (userObj && mounted) {
          setCurrentUser(userObj)

          // Fetch security status
          const pinRes = await fetch('/api/auth/security/pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'status', userId: userObj.id }),
          })
          const pinData = await pinRes.json()
          if (pinData?.status) {
            setHasPin(Boolean(pinData.status.hasPin))
          }
        }
      } catch (err) {
        console.error('Error loading session or PIN status:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [])

  // Toggle App Lock
  const handleToggleAppLock = () => {
    const nextVal = !isAppLock
    if (nextVal && !hasPin) {
      setShowPinInput(true)
      setMessage({ type: 'info', text: 'Please set a 4-digit PIN code below to enable App Lock.' })
      return
    }
    setIsAppLock(nextVal)
    localStorage.setItem(APP_LOCK_KEY, nextVal ? 'true' : 'false')
    window.dispatchEvent(new Event('app_lock_setting_changed'))
  }

  // Save PIN code
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!currentUser) return
    if (pinInput.length < 4) {
      setMessage({ type: 'error', text: 'PIN code must be at least 4 digits.' })
      return
    }
    if (pinInput !== pinConfirm) {
      setMessage({ type: 'error', text: 'PIN codes do not match. Please re-enter.' })
      return
    }

    setSavingPin(true)
    try {
      const res = await fetch('/api/auth/security/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set',
          pin: pinInput,
          userId: currentUser.id,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setHasPin(true)
        setShowPinInput(false)
        setPinInput('')
        setPinConfirm('')
        setIsAppLock(true)
        localStorage.setItem(APP_LOCK_KEY, 'true')
        window.dispatchEvent(new Event('app_lock_setting_changed'))
        setMessage({
          type: 'success',
          text: '4-digit PIN code saved and App Lock enabled!',
        })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save PIN code.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error saving PIN code.' })
    } finally {
      setSavingPin(false)
    }
  }

  // Register Biometric Device
  const handleRegister = async () => {
    setMessage(null)

    if (!currentUser) {
      setMessage({ type: 'error', text: 'Please sign in first before registering biometric authentication.' })
      return
    }

    if (!browserSupportsWebAuthn()) {
      setMessage({
        type: 'error',
        text: 'Your current browser or device does not support WebAuthn biometric sensors.',
      })
      return
    }

    setRegistering(true)

    try {
      // Step A: Request registration challenge options from server
      const res = await fetch('/api/auth/webauthn/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, email: currentUser.email }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || 'Failed to retrieve registration options from server')
      }

      const opts = await res.json()
      if (opts.error) {
        throw new Error(opts.error)
      }

      // Step B: Prompt browser / Touch ID / Face ID / Windows Hello / Fingerprint scanner
      const attResp = await startRegistration(opts)

      // Step C: Verify registration response on server and store in user_credentials table
      const verificationRes = await fetch('/api/auth/webauthn/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, attResp }),
      })

      const verification = await verificationRes.json()

      if (verification.verified) {
        setMessage({
          type: 'success',
          text: 'Biometric authenticator (Fingerprint / Face ID / Windows Hello) was successfully saved to user_credentials!',
        })
      } else {
        setMessage({
          type: 'error',
          text: verification.error || 'Registration failed to verify on server.',
        })
      }
    } catch (err: unknown) {
      console.error('Biometric registration error:', err)
      const errorObj = err as Error
      if (errorObj?.name === 'NotAllowedError') {
        setMessage({
          type: 'info',
          text: 'Biometric prompt was cancelled or timed out. Please try again.',
        })
      } else {
        setMessage({
          type: 'error',
          text: errorObj?.message || 'An unexpected error occurred during biometric setup.',
        })
      }
    } finally {
      setRegistering(false)
    }
  }

  // Test verification
  const handleTestVerification = async () => {
    if (!currentUser) return
    setTesting(true)
    setMessage(null)

    try {
      const verified = await verifyAndAuthorizeAction(currentUser.id)
      if (verified) {
        setMessage({
          type: 'success',
          text: 'Biometric authorization successful! Your fingerprint key is verified against user_credentials.',
        })
      } else {
        setMessage({
          type: 'error',
          text: 'Biometric authorization failed. Make sure your fingerprint/device is registered first.',
        })
      }
    } catch (err: unknown) {
      const errorObj = err as Error
      setMessage({ type: 'error', text: errorObj?.message || 'Verification test failed' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-content-muted hover:text-content-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-500">
            <Fingerprint className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-content-primary">
              Biometric & App Lock Security
            </h1>
            <p className="text-sm text-content-muted">
              Configure fingerprint / Face ID sensors and fallback PIN code. Automatically locks the app when you switch tabs or leave.
            </p>
          </div>
        </div>

        {/* Device support banner */}
        {supported === false && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Hardware or Browser Not Supported</p>
              <p className="text-xs mt-0.5 opacity-90">
                This browser or device does not support WebAuthn biometrics. You can still use your 4-digit PIN code for lock security.
              </p>
            </div>
          </div>
        )}

        {/* Current user status */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wider text-content-muted font-semibold">Active User</p>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-content-muted">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking session...
              </div>
            ) : currentUser ? (
              <p className="text-sm font-semibold text-content-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {currentUser.name} <span className="text-xs text-content-muted">({currentUser.email})</span>
              </p>
            ) : (
              <p className="text-sm text-amber-500">Not logged in. Please sign in first.</p>
            )}
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                supported
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              {supported ? 'WebAuthn Ready' : 'Unsupported'}
            </span>
          </div>
        </div>

        {/* SECTION 1: App Lock Toggle */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-content-primary">
                App Lock (Auto-Lock on Tab Switch)
              </h3>
              {isAppLock && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Active
                </span>
              )}
            </div>
            <p className="text-xs text-content-muted">
              When enabled, going outside or switching tabs locks the app immediately until unlocked via Fingerprint or PIN.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isAppLock}
            onClick={handleToggleAppLock}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAppLock ? 'bg-sky-500' : 'bg-slate-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isAppLock ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* SECTION 2: 4-Digit PIN Code Management */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface-subtle border border-surface-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-sky-500" />
              <h3 className="text-sm font-bold text-content-primary">4-Digit Security PIN</h3>
              {hasPin ? (
                <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Configured
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Not Set
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowPinInput(!showPinInput)}
              className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-border text-xs font-semibold text-content-primary border border-surface-border transition-colors cursor-pointer"
            >
              {showPinInput ? 'Cancel' : hasPin ? 'Change PIN' : 'Set PIN'}
            </button>
          </div>

          {showPinInput && (
            <form onSubmit={handleSavePin} className="pt-2 border-t border-surface-border space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-content-muted">New PIN (4 digits)</label>
                  <input
                    type="password"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full py-2 px-3 rounded-xl bg-surface border border-surface-border text-content-primary text-center font-bold tracking-widest text-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-content-muted">Confirm PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full py-2 px-3 rounded-xl bg-surface border border-surface-border text-content-primary text-center font-bold tracking-widest text-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPin || pinInput.length < 4}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow cursor-pointer"
                >
                  {savingPin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save PIN Code
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Feedback messages */}
        {message && (
          <div
            className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : message.type === 'info'
                ? 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div>{message.text}</div>
          </div>
        )}

        {/* SECTION 3: Biometric Fingerprint Scanner Actions */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs uppercase tracking-wider text-content-muted font-bold flex items-center gap-1.5">
            <Fingerprint className="w-4 h-4 text-sky-500" />
            WebAuthn Biometric Authenticator
          </h3>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleRegister}
              disabled={registering || !currentUser || loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-md active:scale-98 cursor-pointer"
            >
              {registering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning & Registering to user_credentials...
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  Register Phone / Fingerprint Scanner
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleTestVerification}
              disabled={testing || !currentUser || loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-subtle hover:bg-surface-border text-content-primary border border-surface-border font-medium text-sm transition-all active:scale-98 cursor-pointer"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Test Verification
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Info Card */}
        <div className="pt-4 border-t border-surface-border space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-content-muted flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            How the App Lock System Operates
          </h4>
          <ul className="text-xs text-content-muted space-y-1.5 list-disc list-inside">
            <li>
              When <strong>App Lock</strong> is switched ON, switching browser tabs, minimizing the browser, or locking your phone automatically locks the application.
            </li>
            <li>
              To unlock, you can either tap the <strong>Fingerprint / Face ID</strong> sensor or enter your <strong>4-digit PIN</strong>.
            </li>
            <li>
              Biometric credentials are securely stored in your Postgres table <code className="bg-surface-subtle px-1.5 py-0.5 rounded text-content-primary">public.user_credentials</code> and PINs in <code className="bg-surface-subtle px-1.5 py-0.5 rounded text-content-primary">public.users.pin_code</code>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}