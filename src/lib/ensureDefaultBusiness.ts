import { supabase } from '@/lib/supabase';

export async function ensureDefaultBusiness(email: string, displayName: string) {
  const ownerEmail = email.trim().toLowerCase();
  if (!ownerEmail) return;

  const { data: existingBusiness, error: lookupError } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_email', ownerEmail)
    .limit(1)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existingBusiness) return;

  const businessName = displayName.trim() || ownerEmail.split('@')[0] || 'My';
  const { error: insertError } = await supabase.from('businesses').insert({
    owner_email: ownerEmail,
    name: `${businessName}'s Business`,
    subtitle: 'Default business',
    description_locale: 'en',
    is_active: true,
    supported_currencies: 'AFN, USD, PKR',
  });

  if (insertError && insertError.code !== '23505') throw insertError;
}
