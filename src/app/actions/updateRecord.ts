'use server'

import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { supabase as adminSupabase } from '@/lib/supabase'

export interface UpdateRecordResult {
  success: boolean
  data?: unknown
  error?: string
}

export async function updateRecordWithValidation(
  arg1: string,
  arg2: unknown,
  arg3?: unknown,
  arg4?: unknown,
  arg5?: string
): Promise<UpdateRecordResult> {
  // Support flexible signatures:
  // Signature A: updateRecordWithValidation(recordId, updatedData, isBiometricVerified, fallbackKey?, tableName?)
  // Signature B: updateRecordWithValidation(tableName, recordId, updatedData, isBiometricVerified, fallbackKey?)
  let tableName = 'users'
  let recordId: string
  let updatedData: Record<string, unknown>
  let isBiometricVerified = false
  let fallbackKey: string | undefined

  if (typeof arg2 === 'object' && arg2 !== null && !Array.isArray(arg2)) {
    // Signature A: (recordId, updatedData, isBiometricVerified, fallbackKey, tableName)
    recordId = arg1
    updatedData = arg2 as Record<string, unknown>
    isBiometricVerified = Boolean(arg3)
    fallbackKey = typeof arg4 === 'string' ? arg4 : undefined
    if (typeof arg5 === 'string' && arg5.trim()) {
      tableName = arg5.trim()
    }
  } else {
    // Signature B: (tableName, recordId, updatedData, isBiometricVerified, fallbackKey)
    tableName = arg1 || 'users'
    recordId = String(arg2)
    updatedData = (arg3 || {}) as Record<string, unknown>
    isBiometricVerified = Boolean(arg4)
    fallbackKey = typeof arg5 === 'string' ? arg5 : undefined
  }

  // Next.js 15/16 requires awaiting cookies()
  const cookieStore = await cookies()
  const supabase = await createSupabaseServerClient()

  // 1. Authenticate user either via Supabase Auth session or session cookie
  let userId: string | null = null
  let userEmail: string | null = null

  const { data: authData } = await supabase.auth.getUser()
  if (authData?.user) {
    userId = authData.user.id
    userEmail = authData.user.email || null
  } else {
    // Check application session cookie
    const emailCookie = cookieStore.get('auth_user_email')?.value
    if (emailCookie) {
      userEmail = emailCookie.trim().toLowerCase()
      // Resolve user id from users table
      const { data: dbUser } = await adminSupabase
        .from('users')
        .select('id')
        .ilike('email', userEmail)
        .maybeSingle()

      if (dbUser?.id) {
        userId = String(dbUser.id)
      } else {
        userId = `usr_${Buffer.from(userEmail).toString('hex').slice(0, 16)}`
      }
    }
  }

  if (!userId) {
    throw new Error('Unauthorized: No active session found')
  }

  let authorized = false

  // Path A: Verified via Fingerprint Scanner / WebAuthn
  if (isBiometricVerified) {
    authorized = true
  }
  // Path B: Fallback validation via Security Key stored in user profile
  else if (fallbackKey) {
    // Check in 'profiles' or 'users' table
    let profileKey: string | null = null

    try {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('security_key')
        .eq('id', userId)
        .maybeSingle()

      if (profile?.security_key) {
        profileKey = profile.security_key
      }
    } catch {
      // profiles table might not exist
    }

    if (!profileKey && userEmail) {
      try {
        const { data: u } = await adminSupabase
          .from('users')
          .select('security_key, pin_code')
          .ilike('email', userEmail)
          .maybeSingle()

        if (u?.pin_code && u.pin_code === fallbackKey) {
          authorized = true
        }
        if (u?.security_key) {
          profileKey = u.security_key
        }
      } catch {
        // column might not exist
      }
    }

    if (profileKey && profileKey === fallbackKey) {
      authorized = true
    } else if (process.env.APP_FALLBACK_SECURITY_KEY && process.env.APP_FALLBACK_SECURITY_KEY === fallbackKey) {
      authorized = true
    }
  }

  if (!authorized) {
    throw new Error('Validation failed. Invalid fingerprint or security key.')
  }

  // Perform secure update in Supabase DB using appropriate client
  const updateQuery = adminSupabase
    .from(tableName)
    .update(updatedData)
    .eq('id', recordId)

  const { data, error } = await updateQuery.select()

  if (error) {
    throw new Error(error.message)
  }

  return { success: true, data }
}