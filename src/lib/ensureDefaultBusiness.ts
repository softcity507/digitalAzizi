import { supabase } from '@/lib/supabase';

export async function ensureDefaultBusiness(email: string, displayName: string, userId?: string) {
  const ownerEmail = email.trim().toLowerCase();
  if (!ownerEmail) return;

  // The OAuth callback passes the authenticated Supabase UUID explicitly.
  // The service client used for database writes does not carry the user's session.
  let finalUserId = userId;

  if (!finalUserId) {
    const { data: authData } = await supabase.auth.getUser();
    finalUserId = authData?.user?.id;
  }

  if (!finalUserId) {
    console.warn('ensureDefaultBusiness: No authenticated Supabase Auth session found for', ownerEmail);
    return;
  }

  // Keep sign-ins idempotent: each auth user gets at most one system default.
  const { data: existingBusiness, error: lookupError } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', finalUserId)
    .limit(1)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existingBusiness) return;

  const businessName = displayName.trim() || ownerEmail.split('@')[0] || 'My';

  // `subtitle` is the description field available in the businesses schema.
  const { error: insertError } = await supabase.from('businesses').insert({
    user_id: finalUserId,
    owner_email: ownerEmail,
    name: `${businessName}'s Business`,
    subtitle: 'Default business created by the system',
    is_active: true,
    supported_currencies: 'AFN, USD, PKR',
  });

  if (insertError && insertError.code !== '23505') throw insertError;
}
