import { supabase } from '@/lib/supabase';

export async function ensureDefaultBusiness(email: string, displayName: string, userId?: string) {
  const ownerEmail = email.trim().toLowerCase();
  if (!ownerEmail) return;

  // 1. Always prioritize the real Supabase Auth user ID if provided
  let finalUserId = userId;

  if (!finalUserId) {
    const { data: authData } = await supabase.auth.getUser();
    finalUserId = authData?.user?.id;
  }

  if (!finalUserId) {
    console.warn('ensureDefaultBusiness: No authenticated Supabase Auth session found for', ownerEmail);
    return;
  }

  // 2. Check if a business already exists for this auth user ID
  const { data: existingBusiness, error: lookupError } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', finalUserId)
    .limit(1)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existingBusiness) return;

  const businessName = displayName.trim() || ownerEmail.split('@')[0] || 'My';

  // 3. Insert new business using the exact Supabase Auth UUID
  const { error: insertError } = await supabase.from('businesses').insert({
    user_id: finalUserId,
    owner_email: ownerEmail,
    name: `${businessName}'s Business`,
    subtitle: 'Default business',
    is_active: true,
    supported_currencies: 'AFN, USD, PKR',
  });

  if (insertError && insertError.code !== '23505') throw insertError;
}