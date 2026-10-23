'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
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
import { getSecurityStatus, verifySecurityPin } from '@/callapi/security'
import { useRouter } from 'next/navigation'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n/languages'
import { supabaseClient } from '@/lib/supabaseClient'
import { isWebAuthnPromptActive } from '@/lib/webAuthnPrompt'
import { getNativeBiometricEnabled, isAndroidNativeApp, verifyNativeBiometric } from '@/lib/nativeBiometric'
import type { AuthChangeEvent } from '@supabase/supabase-js'

export const APP_LOCK_KEY = 'digitalazizi_app_lock_enabled'
export const IS_LOCKED_KEY = 'digitalazizi_session_locked'
export const LAST_AUTH_TIME_KEY = 'digitalazizi_last_auth_time'
const ANDROID_RETURN_PATH_KEY = 'digitalazizi_android_return_path'
export const ONE_HOUR_MS = 60 * 60 * 1000 // 1 hour in milliseconds

const getExecutionContext = () => {
  if (Capacitor.isNativePlatform()) return 'native'
  const isInstalledPwa = window.matchMedia?.('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
  return isInstalledPwa ? 'pwa' : 'browser'
}

const getScopedStorageKey = (key: string) => `${key}:${getExecutionContext()}`

export const getAppLockEnabled = () => {
  if (typeof window === 'undefined') return false
  const scopedKey = getScopedStorageKey(APP_LOCK_KEY)
  const scopedValue = localStorage.getItem(scopedKey)
  if (scopedValue !== null) return scopedValue === 'true'

  // Preserve an existing native app lock when upgrading from the old shared key.
  return Capacitor.isNativePlatform() && localStorage.getItem(APP_LOCK_KEY) === 'true'
}

export const setAppLockEnabled = (enabled: boolean) => {
  localStorage.setItem(getScopedStorageKey(APP_LOCK_KEY), String(enabled))
  window.dispatchEvent(new Event('app_lock_setting_changed'))
}

export default function AppLockGuard({ children }: { children?: React.ReactNode }) {
  const [isLockEnabled, setIsLockEnabled] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string; name?: string } | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [hasPin, setHasPin] = useState(false)
  const [hasCredentials, setHasCredentials] = useState(false)
  const [hasNativeBiometric, setHasNativeBiometric] = useState(false)
  const [authorizationError, setAuthorizationError] = useState('')
  const [verifyingPin, setVerifyingPin] = useState(false)
  const [verifyingBiometric, setVerifyingBiometric] = useState(false)
  const [shake, setShake] = useState(false)
  const router = useRouter()
  const isBiometricAttempting = useRef(false)

  // Native Google sign-in completes inside the current WebView. The initial
  // session check may already have run while the user was signed out, so also
  // react to Supabase's sign-in event and take the user straight to cashbook.
  useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event !== 'SIGNED_IN') return

      const segments = window.location.pathname.split('/').filter(Boolean)
      const locale = SUPPORTED_LOCALES.includes(segments[0] as (typeof SUPPORTED_LOCALES)[number])
        ? segments[0]
        : DEFAULT_LOCALE
      const routeSegments = locale === segments[0] ? segments.slice(1) : segments

      // Supabase can emit SIGNED_IN again when a tab becomes active. Only
      // redirect from the landing/sign-in route; preserve the current route
      // when the user returns to an already-open page such as Cash Book.
      if (routeSegments.length > 0) return

      const requestedPath = new URLSearchParams(window.location.search).get('redirect')
      const safeRequestedPath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
        ? requestedPath
        : null
      router.replace(safeRequestedPath || `/${locale}/cash-book/`)
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Mark session unlocked and reset 1-hour timer
  const markUnlocked = useCallback(() => {
    sessionStorage.removeItem(getScopedStorageKey(IS_LOCKED_KEY))
    localStorage.setItem(getScopedStorageKey(LAST_AUTH_TIME_KEY), Date.now().toString())
    setIsLocked(false)
    setPinInput('')
    setPinError('')

    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      const returnPath = localStorage.getItem(ANDROID_RETURN_PATH_KEY)
      if (returnPath?.startsWith('/') && !returnPath.startsWith('//')) {
        localStorage.removeItem(ANDROID_RETURN_PATH_KEY)
        if (window.location.pathname !== returnPath) router.replace(returnPath)
      }
    }
  }, [router])

  // 1. Check user session & lock setting on mount
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const enabled = getAppLockEnabled()
        setIsLockEnabled(enabled)

        const segments = window.location.pathname.split('/').filter(Boolean)
        const locale = SUPPORTED_LOCALES.includes(segments[0] as (typeof SUPPORTED_LOCALES)[number])
          ? segments[0]
          : DEFAULT_LOCALE
        const routeSegments = locale === segments[0] ? segments.slice(1) : segments
        const isLandingRoute = routeSegments.length === 0
        const savedAndroidPath = enabled
          && sessionStorage.getItem(getScopedStorageKey(IS_LOCKED_KEY)) === 'true'
          && Capacitor.isNativePlatform()
          && Capacitor.getPlatform() === 'android'
          ? localStorage.getItem(ANDROID_RETURN_PATH_KEY)
          : null
        const isLanding = isLandingRoute && !savedAndroidPath
        const isPublic = window.location.pathname.includes('/about')
        if (isPublic) return

        // Check Supabase Auth separately from the profile Edge Function. A
        // temporary Edge Function failure must not navigate away from the
        // page the user is opening (for example, Biometrics in the Android app).
        const { data: sessionData } = await supabaseClient.auth.getSession()
        const { data: authData, error: authError } = await supabaseClient.auth.getUser()
        const signedInUser = authData.user || sessionData.session?.user || null
        if (!signedInUser) {
          if (!isLanding && mounted) {
            const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`)
            router.replace(`/${locale}?auth_error=${encodeURIComponent(authError?.message || 'Please sign in to continue.')}&redirect=${redirect}`)
          }
          return
        }

        const data = await authApi.getSession()
        if (!data.success || !data.user) {
          if (mounted) {
            const metadata = signedInUser.user_metadata || {}
            setCurrentUser({
              id: signedInUser.id,
              email: signedInUser.email,
              name: String(metadata.full_name || metadata.name || signedInUser.email || ''),
            })
            // A valid Supabase session with a rejected/missing app profile is
            // an authorization problem, not a sign-in problem. Sending this
            // user back to Google sign-in creates a Cash Book -> landing loop.
            setAuthorizationError(data.error || 'Your account could not be authorized. Sign out and sign in again.')
          }
          return
        }
        setAuthorizationError('')
        if (isLanding && mounted) {
          router.replace(`/${locale}/cash-book`)
          return
        }
        if (data.success && data.user && mounted) {
          setCurrentUser(data.user)
          if (isAndroidNativeApp()) setHasNativeBiometric(getNativeBiometricEnabled(data.user.id))

          const securityData = await getSecurityStatus()
          if (securityData.success && mounted) {
            setHasPin(Boolean(securityData.status?.hasPin))
            setHasCredentials(Boolean(securityData.status?.hasCredentials))
          }

          // Check if session was previously locked or if 1 hour has elapsed
          const lastAuth = localStorage.getItem(getScopedStorageKey(LAST_AUTH_TIME_KEY))
          const isTimeout = lastAuth ? Date.now() - parseInt(lastAuth, 10) >= ONE_HOUR_MS : false

          if (enabled && (sessionStorage.getItem(getScopedStorageKey(IS_LOCKED_KEY)) === 'true' || isTimeout)) {
            sessionStorage.setItem(getScopedStorageKey(IS_LOCKED_KEY), 'true')
            setIsLocked(true)
          } else if (!lastAuth) {
            localStorage.setItem(getScopedStorageKey(LAST_AUTH_TIME_KEY), Date.now().toString())
          }
        }
      } catch (err) {
        console.warn('AppLockGuard init error:', err)
      }
    }

    init()

    // Listen to lock setting changes from settings toggle
    const handleLockSettingChange = () => {
      const enabled = getAppLockEnabled()
      setIsLockEnabled(enabled)
      if (!enabled) {
        sessionStorage.removeItem(getScopedStorageKey(IS_LOCKED_KEY))
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
  }, [router])

  // 2. Lock application when user goes outside (visibilitychange / pagehide)
  useEffect(() => {
    if (!isLockEnabled || !currentUser) return

    const rememberAndroidRoute = () => {
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return
      const path = `${window.location.pathname}${window.location.search}${window.location.hash}`
      const segments = window.location.pathname.split('/').filter(Boolean)
      if (segments.length > 1) localStorage.setItem(ANDROID_RETURN_PATH_KEY, path)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (isWebAuthnPromptActive()) return
        rememberAndroidRoute()
        sessionStorage.setItem(getScopedStorageKey(IS_LOCKED_KEY), 'true')
        setIsLocked(true)
      }
    }

    const handlePageHide = () => {
      if (isWebAuthnPromptActive()) return
      rememberAndroidRoute()
      sessionStorage.setItem(getScopedStorageKey(IS_LOCKED_KEY), 'true')
      setIsLocked(true)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)

    // Android WebView does not consistently deliver page visibility events
    // when the native activity is backgrounded. Use Capacitor's lifecycle
    // event as the authoritative fallback so returning from another app
    // always shows the lock overlay.
    let removeAppStateListener: (() => void) | undefined
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      let disposed = false
      void App.addListener('appStateChange', ({ isActive }) => {
        if (!isActive) {
          if (isWebAuthnPromptActive()) return
          rememberAndroidRoute()
          sessionStorage.setItem(getScopedStorageKey(IS_LOCKED_KEY), 'true')
          setIsLocked(true)
          return
        }

        if (sessionStorage.getItem(getScopedStorageKey(IS_LOCKED_KEY)) === 'true') {
          setIsLocked(true)
        }
        // Refresh security capabilities on return. Android can resume the
        // WebView after a cold restore before the initial status request has
        // completed, which otherwise leaves the PIN keypad hidden.
        void getSecurityStatus().then((securityData) => {
          if (!securityData.success) return
          setHasPin(Boolean(securityData.status?.hasPin))
          setHasCredentials(Boolean(securityData.status?.hasCredentials))
        }).catch((error: unknown) => {
          console.warn('Could not refresh Android security status:', error)
        })
      }).then((listener) => {
        if (disposed) void listener.remove()
        else removeAppStateListener = () => { void listener.remove() }
      }).catch((error: unknown) => {
        console.warn('Could not register Android app lifecycle listener:', error)
      })
      const markDisposed = () => { disposed = true }

      return () => {
        markDisposed()
        removeAppStateListener?.()
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('pagehide', handlePageHide)
      }
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
      removeAppStateListener?.()
    }
  }, [isLockEnabled, currentUser])

  // 3. 1-Hour Inactivity / Session Timer: auto-locks after 1 hour of session time
  useEffect(() => {
    if (!isLockEnabled || !currentUser) return

    const checkOneHourTimeout = () => {
      const lastAuthStr = localStorage.getItem(getScopedStorageKey(LAST_AUTH_TIME_KEY))
      if (lastAuthStr) {
        const lastAuth = parseInt(lastAuthStr, 10)
        if (Date.now() - lastAuth >= ONE_HOUR_MS) {
          sessionStorage.setItem(getScopedStorageKey(IS_LOCKED_KEY), 'true')
          setIsLocked(true)
        }
      } else {
        localStorage.setItem(getScopedStorageKey(LAST_AUTH_TIME_KEY), Date.now().toString())
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
  const triggerBiometricUnlock = useCallback(async (showFailureMessage = true) => {
    const useNativeBiometric = isAndroidNativeApp()
    if (!currentUser || (useNativeBiometric ? !hasNativeBiometric : !hasCredentials) || isBiometricAttempting.current) return
    isBiometricAttempting.current = true
    setVerifyingBiometric(true)
    setPinError('')

    try {
      const success = useNativeBiometric
        ? await verifyNativeBiometric('Unlock DigitalAzizi')
        : await verifyAndAuthorizeAction(currentUser.id)
      if (success) {
        markUnlocked()
      } else if (showFailureMessage) {
        setPinError('Biometric verification failed. Please enter your PIN.')
      }
    } catch {
      if (showFailureMessage) {
        setPinError('Biometric scan cancelled. Please use your PIN.')
      }
    } finally {
      setVerifyingBiometric(false)
      isBiometricAttempting.current = false
    }
  }, [currentUser, hasCredentials, hasNativeBiometric, markUnlocked])

  // 5. Submit PIN verification
  const handleVerifyPin = async (pinToVerify: string) => {
    if (!currentUser || !hasPin || pinToVerify.length < 4 || verifyingPin) return
    setVerifyingPin(true)
    setPinError('')

    try {
      const data = await verifySecurityPin(pinToVerify)
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
    sessionStorage.removeItem(getScopedStorageKey(IS_LOCKED_KEY))
    localStorage.removeItem(ANDROID_RETURN_PATH_KEY)
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
                {hasPin
                  ? 'Enter your PIN to unlock, or use your registered biometric.'
                  : 'Use your registered device biometric to unlock.'}
              </p>
            </div>

            {/* PIN Code Dots Display */}
            {hasPin && <div className="flex items-center justify-center gap-3 py-1">
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
            </div>}

            {/* Error Message */}
            {pinError && (
              <div className="text-xs text-rose-500 flex items-center gap-1.5 font-medium animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {/* Numeric Keypad */}
            {hasPin && <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-[280px]">
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
            </div>}

            {/* Keep the native prompt behind an explicit tap. */}
            {hasPin && (isAndroidNativeApp() ? hasNativeBiometric : hasCredentials) && <div className="w-full flex items-center gap-3 text-xs uppercase tracking-wider text-content-muted font-bold">
              <div className="flex-1 h-px bg-surface-border" />
              <span>Or Use Biometrics</span>
              <div className="flex-1 h-px bg-surface-border" />
            </div>}
            {(isAndroidNativeApp() ? hasNativeBiometric : hasCredentials) && <button
              type="button"
              onClick={() => triggerBiometricUnlock()}
              disabled={verifyingBiometric}
              className="w-full inline-flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg active:scale-98 cursor-pointer"
            >
              {verifyingBiometric ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying biometrics...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  Use biometrics to unlock
                </>
              )}
            </button>}

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

      {authorizationError && !isLocked && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[999998] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface p-6 text-center shadow-2xl">
            <h2 className="text-lg font-bold text-content-primary">Account access unavailable</h2>
            <p className="mt-3 text-sm text-content-secondary">{authorizationError}</p>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-5 rounded bg-brand px-5 py-2.5 text-sm font-semibold text-black"
            >
              Sign out and return to sign in
            </button>
          </div>
        </div>
      )}
    </>
  )
}
