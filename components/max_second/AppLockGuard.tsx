'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Fingerprint,
  Lock,
  LogOut,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Delete,
} from 'lucide-react'
import verifyAndAuthorizeAction from './verifyAndAuthorizeAction'
import { authApi } from '@/callapi/auth'
import { useRouter } from 'next/navigation'

export const APP_LOCK_KEY = 'digitalazizi_app_lock_enabled'
export const IS_LOCKED_KEY = 'digitalazizi_session_locked'
export const LAST_AUTH_TIME_KEY = 'digitalazizi_last_auth_time'
export const ONE_HOUR_MS = 60 * 60 * 1000 // 1 hour in milliseconds

export default function AppLockGuard({ children }: { children?: React.ReactNode }) {
  const [isLockEnabled, setIsLockEnabled] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string; name?: string } | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [verifyingPin, setVerifyingPin] = useState(false)
  const [verifyingBiometric, setVerifyingBiometric] = useState(false)
  const [shake, setShake] = useState(false)
  const router = useRouter()
  const isBiometricAttempting = useRef(false)

  // Mark session unlocked and reset 1-hour timer
  const markUnlocked = useCallback(() => {
    sessionStorage.removeItem(IS_LOCKED_KEY)
    localStorage.setItem(LAST_AUTH_TIME_KEY, Date.now().toString())
    setIsLocked(false)
    setPinInput('')
    setPinError('')
  }, [])

  // 1. Check user session & lock setting on mount
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const enabled = localStorage.getItem(APP_LOCK_KEY) === 'true'
        setIsLockEnabled(enabled)

        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success && data.user && mounted) {
          setCurrentUser(data.user)

          // Check if session was previously locked or if 1 hour has elapsed
          const lastAuth = localStorage.getItem(LAST_AUTH_TIME_KEY)
          const isTimeout = lastAuth ? Date.now() - parseInt(lastAuth, 10) >= ONE_HOUR_MS : false

          if (enabled && (sessionStorage.getItem(IS_LOCKED_KEY) === 'true' || isTimeout)) {
            sessionStorage.setItem(IS_LOCKED_KEY, 'true')
            setIsLocked(true)
          } else if (!lastAuth) {
            localStorage.setItem(LAST_AUTH_TIME_KEY, Date.now().toString())
          }
        }
      } catch (err) {
        console.warn('AppLockGuard init error:', err)
      }
    }

    init()

    // Listen to lock setting changes from settings toggle
    const handleLockSettingChange = () => {
      const enabled = localStorage.getItem(APP_LOCK_KEY) === 'true'
      setIsLockEnabled(enabled)
      if (!enabled) {
        sessionStorage.removeItem(IS_LOCKED_KEY)
        setIsLocked(false)
      }
    }

    window.addEventListener('app_lock_setting_changed', handleLockSettingChange)
    window.addEventListener('storage', handleLockSettingChange)

    return () => {
      mounted = false
      window.removeEventListener('app_lock_setting_changed', handleLockSettingChange)
      window.removeEventListener('storage', handleLockSettingChange)
    }
  }, [])

  // 2. Lock application when user goes outside (visibilitychange / pagehide)
  useEffect(() => {
    if (!isLockEnabled || !currentUser) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sessionStorage.setItem(IS_LOCKED_KEY, 'true')
        setIsLocked(true)
      }
    }

    const handlePageHide = () => {
      sessionStorage.setItem(IS_LOCKED_KEY, 'true')
      setIsLocked(true)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [isLockEnabled, currentUser])

  // 3. 1-Hour Inactivity / Session Timer: auto-locks after 1 hour of session time
  useEffect(() => {
    if (!isLockEnabled || !currentUser) return

    const checkOneHourTimeout = () => {
      const lastAuthStr = localStorage.getItem(LAST_AUTH_TIME_KEY)
      if (lastAuthStr) {
        const lastAuth = parseInt(lastAuthStr, 10)
        if (Date.now() - lastAuth >= ONE_HOUR_MS) {
          sessionStorage.setItem(IS_LOCKED_KEY, 'true')
          setIsLocked(true)
        }
      } else {
        localStorage.setItem(LAST_AUTH_TIME_KEY, Date.now().toString())
      }
    }

    // Check immediately and then every 15 seconds
    checkOneHourTimeout()
    const timer = setInterval(checkOneHourTimeout, 15000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkOneHourTimeout()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [isLockEnabled, currentUser])

  // 4. Unlock with Biometrics
  const triggerBiometricUnlock = useCallback(async () => {
    if (!currentUser || isBiometricAttempting.current) return
    isBiometricAttempting.current = true
    setVerifyingBiometric(true)
    setPinError('')

    try {
      const success = await verifyAndAuthorizeAction(currentUser.id)
      if (success) {
        markUnlocked()
      } else {
        setPinError('Biometric verification failed. Please enter your PIN.')
      }
    } catch {
      setPinError('Biometric scan cancelled. Please use your PIN.')
    } finally {
      setVerifyingBiometric(false)
      isBiometricAttempting.current = false
    }
  }, [currentUser, markUnlocked])

  // Auto trigger biometrics once when lock screen opens
  useEffect(() => {
    if (isLocked && currentUser) {
      const timer = setTimeout(() => {
        triggerBiometricUnlock()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isLocked, currentUser, triggerBiometricUnlock])

  // 5. Submit PIN verification
  const handleVerifyPin = async (pinToVerify: string) => {
    if (!currentUser || pinToVerify.length < 4 || verifyingPin) return
    setVerifyingPin(true)
    setPinError('')

    try {
      const res = await fetch('/api/auth/security/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          pin: pinToVerify,
          userId: currentUser.id,
        }),
      })

      const data = await res.json()
      if (data.verified) {
        markUnlocked()
      } else {
        setPinError('Incorrect PIN code. Try again.')
        setShake(true)
        setTimeout(() => setShake(false), 500)
        setPinInput('')
      }
    } catch {
      setPinError('Verification error. Please try again.')
    } finally {
      setVerifyingPin(false)
    }
  }

  // Keypad button click
  const handleKeypadPress = (digit: string) => {
    if (pinInput.length >= 6) return
    const nextPin = pinInput + digit
    setPinInput(nextPin)
    setPinError('')
    if (nextPin.length === 4) {
      handleVerifyPin(nextPin)
    }
  }

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1))
    setPinError('')
  }

  // 5. Emergency Sign Out
  const handleSignOut = async () => {
    sessionStorage.removeItem(IS_LOCKED_KEY)
    await authApi.logout()
    router.push('/')
  }

  return (
    <>
      {/* Background content */}
      <div className={isLocked ? 'pointer-events-none select-none filter blur-xl' : ''}>
        {children}
      </div>

      {/* Lock Screen Overlay */}
      {isLocked && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto animate-fade-in"
        >
          <div
            className={`w-full max-w-sm sm:max-w-md bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center space-y-6 ${
              shake ? 'animate-shake' : ''
            }`}
          >
            {/* Security Icon */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-full text-white ring-2 ring-surface shadow">
                <ShieldAlert className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Header info */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-content-primary">Application Locked</h2>
              <p className="text-xs sm:text-sm text-content-muted">
                {currentUser?.name ? `Welcome back, ${currentUser.name}.` : 'Secure Session'}{' '}
                Please authenticate using Fingerprint / Face ID or enter your PIN.
              </p>
            </div>

            {/* Biometric Quick Button */}
            <button
              type="button"
              onClick={triggerBiometricUnlock}
              disabled={verifyingBiometric}
              className="w-full inline-flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg active:scale-98 cursor-pointer"
            >
              {verifyingBiometric ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying Fingerprint / Face ID...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  Tap to Verify Biometric Sensor
                </>
              )}
            </button>

            {/* Divider */}
            <div className="w-full flex items-center gap-3 text-xs uppercase tracking-wider text-content-muted font-bold">
              <div className="flex-1 h-px bg-surface-border" />
              <span>Or Enter PIN Code</span>
              <div className="flex-1 h-px bg-surface-border" />
            </div>

            {/* PIN Code Dots Display */}
            <div className="flex items-center justify-center gap-3 py-1">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pinInput.length > idx
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      filled
                        ? 'bg-sky-500 scale-110 shadow-md ring-2 ring-sky-500/30'
                        : 'bg-surface-subtle border border-surface-border'
                    }`}
                  />
                )
              })}
            </div>

            {/* Error Message */}
            {pinError && (
              <div className="text-xs text-rose-500 flex items-center gap-1.5 font-medium animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-[280px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  disabled={verifyingPin}
                  className="h-12 sm:h-14 rounded-2xl bg-surface-subtle hover:bg-surface-border active:scale-95 text-lg font-bold text-content-primary border border-surface-border transition-all flex items-center justify-center cursor-pointer"
                >
                  {digit}
                </button>
              ))}

              {/* Clear / Key icon */}
              <button
                type="button"
                onClick={() => setPinInput('')}
                className="h-12 sm:h-14 rounded-2xl text-xs font-bold text-content-muted hover:text-content-primary flex items-center justify-center transition-all cursor-pointer"
              >
                Clear
              </button>

              {/* 0 button */}
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                disabled={verifyingPin}
                className="h-12 sm:h-14 rounded-2xl bg-surface-subtle hover:bg-surface-border active:scale-95 text-lg font-bold text-content-primary border border-surface-border transition-all flex items-center justify-center cursor-pointer"
              >
                0
              </button>

              {/* Backspace button */}
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 sm:h-14 rounded-2xl text-content-muted hover:text-content-primary flex items-center justify-center transition-all cursor-pointer"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Actions: Sign Out */}
            <div className="pt-2 w-full border-t border-surface-border flex items-center justify-between text-xs text-content-muted">
              <span>Security Protected</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-400 font-semibold cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
