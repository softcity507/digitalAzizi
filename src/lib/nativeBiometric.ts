import { Capacitor } from '@capacitor/core'
import { NativeBiometric } from 'capacitor-native-biometric'

const NATIVE_BIOMETRIC_KEY = 'digitalazizi_native_biometric_enabled'

export function isAndroidNativeApp() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export function getNativeBiometricEnabled(userId: string) {
  if (typeof window === 'undefined' || !isAndroidNativeApp()) return false
  return localStorage.getItem(`${NATIVE_BIOMETRIC_KEY}:${userId}`) === 'true'
}

export function setNativeBiometricEnabled(userId: string, enabled: boolean) {
  if (!isAndroidNativeApp()) return
  const key = `${NATIVE_BIOMETRIC_KEY}:${userId}`
  if (enabled) localStorage.setItem(key, 'true')
  else localStorage.removeItem(key)
}

export async function isNativeBiometricAvailable() {
  if (!isAndroidNativeApp()) return false
  const result = await NativeBiometric.isAvailable({ useFallback: false })
  return result.isAvailable
}

export async function verifyNativeBiometric(reason: string) {
  if (!isAndroidNativeApp()) return false
  try {
    await NativeBiometric.verifyIdentity({
      title: 'DigitalAzizi',
      subtitle: 'Biometric authentication',
      description: reason,
      reason,
      negativeButtonText: 'Cancel',
      useFallback: false,
      maxAttempts: 3,
    })
    return true
  } catch {
    return false
  }
}
