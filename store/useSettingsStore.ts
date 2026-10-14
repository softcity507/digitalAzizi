import { create } from 'zustand';
import { BusinessProfile, AppAdminProfile, RegisteredUser, AuditLogItem } from '@/types/settings';
import { CustomerAccount, CurrencyCode, CustomerBalance } from '@/types/customer';
import { useCustomerDetailsStore } from './useCustomerDetailsStore';
import { useExchangeDeskStore } from './useExchangeDeskStore';
import { useCashBookStore } from './useCashBookStore';
import type { SupportedLocale } from '@/i18n/languages';
import { supabaseClient } from '@/lib/supabaseClient';

interface BusinessRow {
  id: number | string;
  name: string | null;
  subtitle: string | null;
  is_active: boolean | null;
  supported_currencies: string | string[] | null;
  owner_email?: string | null;
  user_id?: string | null; 
}

interface CustomerRow {
  id: number | string;
  name: string;
  phone: string | null;
  address: string | null;
  created_at?: string;
  firstpayment: Record<string, number> | null;
  description: string | null;
  business_id: number | string | null;
}

const DEFAULT_EXCHANGE_ACCOUNT_DESCRIPTION = 'Default exchange account';
const exchangeAccountCreation = new Map<string, Promise<CustomerRow>>();

const mapCustomerRow = (row: CustomerRow): { user: RegisteredUser; customer: CustomerAccount } => {
  const slugId = String(row.id);
  const isSystemDefault = row.description === DEFAULT_EXCHANGE_ACCOUNT_DESCRIPTION;
  const subtitleParts = [row.description, row.phone, row.address].filter(Boolean);
  const subtitle = subtitleParts.join(' • ') || 'Customer Account';

  const firstpayment = (typeof row.firstpayment === 'object' && row.firstpayment !== null) ? row.firstpayment : {};
  const currencyKeys = Object.keys(firstpayment);
  const validCurrencies = currencyKeys.filter((c): c is CurrencyCode =>
    VALID_BUSINESS_CURRENCIES.has(c as CurrencyCode)
  );
  const currenciesToUse: CurrencyCode[] = validCurrencies.length > 0 ? validCurrencies : ['AFN', 'USD', 'PKR'];

  const balances: CustomerBalance[] = currenciesToUse.map((currency) => ({
    currency,
    amount: String(firstpayment[currency] ?? 0),
    isCredit: true,
  }));

  const user: RegisteredUser = {
    id: slugId,
    name: row.name,
    subtitle,
    isDefault: false,
    roleTag: isSystemDefault ? 'Exchange Account' : 'Customer',
  };

  const customer: CustomerAccount = {
    id: slugId,
    name: row.name,
    subtitle,
    phone: row.phone || undefined,
    businessId: row.business_id ? String(row.business_id) : undefined,
    isSystemDefault,
    balances,
  };

  return { user, customer };
};

const DEFAULT_BUSINESS_CURRENCIES: CurrencyCode[] = ['AFN', 'USD', 'PKR'];
const VALID_BUSINESS_CURRENCIES = new Set<CurrencyCode>([
  'AFN', 'USD', 'PKR', 'IRR', 'INR', 'AED', 'EUR', 'GBP', 'CNY', 'TRY',
]);

const isValidUuid = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
};

const parseBusinessCurrencies = (value: BusinessRow['supported_currencies']): CurrencyCode[] => {
  if (Array.isArray(value)) {
    const currencies = value.filter((currency): currency is CurrencyCode =>
      VALID_BUSINESS_CURRENCIES.has(currency as CurrencyCode)
    );
    return currencies.length === 3 ? [...new Set(currencies)] : DEFAULT_BUSINESS_CURRENCIES;
  }

  if (typeof value !== 'string') return DEFAULT_BUSINESS_CURRENCIES;

  let parsedValues: unknown;
  try {
    parsedValues = JSON.parse(value);
  } catch {
    let normalizedValue = value.trim().replaceAll("''", "'");
    if (normalizedValue.startsWith('"') && normalizedValue.endsWith('"')) {
      normalizedValue = normalizedValue.slice(1, -1);
    }
    if (normalizedValue.startsWith('{') && normalizedValue.endsWith('}')) {
      normalizedValue = normalizedValue.slice(1, -1);
    }
    parsedValues = normalizedValue.split(',').map((currency) =>
      currency.trim().replaceAll("'", '').replaceAll('"', '')
    );
  }

  if (!Array.isArray(parsedValues)) return DEFAULT_BUSINESS_CURRENCIES;
  const currencies = parsedValues.filter((currency): currency is CurrencyCode =>
    typeof currency === 'string' && VALID_BUSINESS_CURRENCIES.has(currency as CurrencyCode)
  );
  const uniqueCurrencies = [...new Set(currencies)];
  return uniqueCurrencies.length === 3 ? uniqueCurrencies : DEFAULT_BUSINESS_CURRENCIES;
};

const mapBusinessRow = (business: BusinessRow): BusinessProfile => ({
  id: String(business.id),
  name: business.name ?? 'My Business',
  subtitle: business.subtitle ?? '',
  isActive: Boolean(business.is_active),
  supportedCurrencies: parseBusinessCurrencies(business.supported_currencies),
});

const ensureDefaultExchangeCustomer = (business: BusinessProfile): Promise<CustomerRow> => {
  const existingRequest = exchangeAccountCreation.get(business.id);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    const businessId = Number(business.id);
    const { data: existing, error: lookupError } = await supabaseClient
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .eq('description', DEFAULT_EXCHANGE_ACCOUNT_DESCRIPTION)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (existing) return existing as CustomerRow;

    const firstpayment = Object.fromEntries(business.supportedCurrencies.map((currency) => [currency, 0]));
    const { data, error } = await supabaseClient
      .from('customers')
      .insert({
        business_id: businessId,
        name: 'Exchange Account',
        phone: null,
        address: null,
        description: DEFAULT_EXCHANGE_ACCOUNT_DESCRIPTION,
        firstpayment,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as CustomerRow;
  })();

  exchangeAccountCreation.set(business.id, request);
  void request.finally(() => {
    if (exchangeAccountCreation.get(business.id) === request) {
      exchangeAccountCreation.delete(business.id);
    }
  }).catch(() => undefined);
  return request;
};

const getSignedInUser = async (): Promise<{ id: string; email: string }> => {
  let authUserId: string | null = null;
  let email: string | null = null;

  try {
    const { data: authData } = await supabaseClient.auth.getUser();
    if (authData?.user) {
      authUserId = authData.user.id;
      email = authData.user.email?.trim().toLowerCase() ?? null;
    }
  } catch {
    // Auth getUser fallback
  }

  if (!authUserId || !email) {
    try {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      if (sessionData?.session?.user) {
        authUserId = sessionData.session.user.id;
        email = sessionData.session.user.email?.trim().toLowerCase() ?? null;
      }
    } catch {
      // Auth getSession fallback
    }
  }

  // Fallback to backend session endpoint /api/auth/me if needed
  if (!authUserId || !email) {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const body = await res.json();
        if (body?.user?.id && body?.user?.email) {
          authUserId = body.user.id;
          email = body.user.email.trim().toLowerCase();
        }
      }
    } catch {
      // Fetch session error fallback
    }
  }

  if (!authUserId || !email || !isValidUuid(authUserId)) {
    throw new Error('Sign in with Supabase to manage business profiles.');
  }

  // Keep store admin profile in sync with valid Supabase Auth ID and email
  const currentAdmin = useSettingsStore.getState().admin;
  if (currentAdmin.id !== authUserId || currentAdmin.email !== email) {
    useSettingsStore.getState().setAdmin({ ...currentAdmin, id: authUserId, email });
  }

  return { id: authUserId, email };
};

export type SettingsModalType = 'add_customer' | 'edit_business' | 'audit_log' | 'backup_success' | 'restore_success' | null;

interface SettingsState {
  admin: AppAdminProfile;
  businesses: BusinessProfile[];
  users: RegisteredUser[];
  customers: CustomerAccount[];
  auditLogs: AuditLogItem[];
  lastSynced: string;
  activeModal: SettingsModalType;
  editingBusiness: BusinessProfile | null;

  setAdmin: (admin: AppAdminProfile) => void;
  fetchBusinesses: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  setActiveBusiness: (id: string) => Promise<void>;
  getActiveCustomers: () => CustomerAccount[];
  setDefaultUser: (id: string) => void;
  addBusiness: (
    name: string,
    subtitle: string,
    supportedCurrencies: CurrencyCode[]
  ) => Promise<BusinessProfile>;

  addUser: (
    name: string,
    subtitle: string,
    currencies: CurrencyCode[],
    roleTag?: string,
    openingBalances?: Partial<Record<CurrencyCode, number>>,
    descriptionLocale?: SupportedLocale,
    notes?: string
  ) => Promise<void>;
  updateUser: (
    id: string,
    name: string,
    phone?: string,
    address?: string,
    description?: string
  ) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateBusiness: (
    id: string,
    name: string,
    subtitle: string,
    supportedCurrencies?: CurrencyCode[]
  ) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
  openEditBusiness: (business: BusinessProfile) => void;
  triggerBackup: () => void;
  triggerRestore: () => void;
  openModal: (type: SettingsModalType) => void;
  closeModal: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  admin: {
    id: '',
    name: '',
    title: '',
    email: '',
    badge: '',
  },
  businesses: [],
  users: [],
  customers: [],
  auditLogs: [],
  lastSynced: '',
  activeModal: null,
  editingBusiness: null,

  setAdmin: (admin) => set({ admin }),

  fetchBusinesses: async () => {
    const { id: userId, email: ownerEmail } = await getSignedInUser();

    // Query businesses where user_id matches, or fallback to owner_email
    const res = await supabaseClient
      .from('businesses')
      .select('id, name, subtitle, is_active, supported_currencies, owner_email, user_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    let data = res.data;
    const error = res.error;

    if (!error && (!data || data.length === 0)) {
      const fallback = await supabaseClient
        .from('businesses')
        .select('id, name, subtitle, is_active, supported_currencies, owner_email, user_id')
        .ilike('owner_email', ownerEmail)
        .order('created_at', { ascending: true });

      if (!fallback.error && fallback.data && fallback.data.length > 0) {
        data = fallback.data;
      }
    }

    if (error && (!data || data.length === 0)) {
      const fallback = await supabaseClient
        .from('businesses')
        .select('id, name, subtitle, is_active, supported_currencies, owner_email, user_id')
        .ilike('owner_email', ownerEmail)
        .order('created_at', { ascending: true });

      if (fallback.error) throw new Error(fallback.error.message || error.message);
      data = fallback.data;
    }

    const mapped = (data ?? []).map((business) => mapBusinessRow(business as BusinessRow));

    // Ensure at least one business is marked active if available
    if (mapped.length > 0 && !mapped.some((b) => b.isActive)) {
      mapped[0].isActive = true;
    }

    set({ businesses: mapped });
    await get().fetchCustomers();
  },

  fetchCustomers: async () => {
    const { data, error } = await supabaseClient
      .from('customers')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    const customerRows = [...(data ?? [])] as CustomerRow[];
    for (const business of get().businesses) {
      const hasExchangeAccount = customerRows.some((row) =>
        String(row.business_id) === business.id
        && row.description === DEFAULT_EXCHANGE_ACCOUNT_DESCRIPTION
      );
      if (!hasExchangeAccount) {
        customerRows.push(await ensureDefaultExchangeCustomer(business));
      }
    }

    const mappedUsers: RegisteredUser[] = [];
    const mappedCustomers: CustomerAccount[] = [];

    customerRows.forEach((row) => {
      const { user, customer } = mapCustomerRow(row as CustomerRow);
      mappedUsers.push(user);
      mappedCustomers.push(customer);

      const currencies = get().businesses.find((business) => business.id === customer.businessId)?.supportedCurrencies
        ?? customer.balances.map((balance) => balance.currency);
      useExchangeDeskStore.getState().registerCustomer(customer.id, customer.name, currencies);
    });

    set({ users: mappedUsers, customers: mappedCustomers });

    const activeBiz = get().businesses.find((b) => b.isActive) || get().businesses[0];
    if (activeBiz) {
      const matched = mappedCustomers.find((c) => c.businessId === activeBiz.id);
      if (matched) {
        useCustomerDetailsStore.getState().setSelectedCustomerId(matched.id);
        useExchangeDeskStore.getState().setCustomerId(matched.id);
      } else {
        useCustomerDetailsStore.getState().setSelectedCustomerId('');
        useExchangeDeskStore.getState().setCustomerId('');
      }
    }
  },

  setActiveBusiness: async (id) => {
    const currentBusiness = get().businesses.find((business) => business.id === id);
    if (!currentBusiness || currentBusiness.isActive) return;
    const { id: userId, email: ownerEmail } = await getSignedInUser();

    // Deactivate previous active businesses
    await supabaseClient
      .from('businesses')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    await supabaseClient
      .from('businesses')
      .update({ is_active: false })
      .ilike('owner_email', ownerEmail)
      .eq('is_active', true);

    // Activate the chosen business
    const { error } = await supabaseClient
      .from('businesses')
      .update({ is_active: true })
      .eq('id', id);

    if (error) throw new Error(error.message);

    get().customers
      .filter((customer) => customer.businessId === id)
      .forEach((customer) => {
        useExchangeDeskStore.getState().registerCustomer(
          customer.id,
          customer.name,
          currentBusiness.supportedCurrencies,
        );
      });

    set((s) => {
      const updatedBusinesses = s.businesses.map((b) => ({ ...b, isActive: b.id === id }));
      // Sync customer details and exchange desk if there is a matching customer for this business
      const matchedCustomer = s.customers.find((c) => c.businessId === id);
      if (matchedCustomer) {
        useCustomerDetailsStore.getState().setSelectedCustomerId(matchedCustomer.id);
        useExchangeDeskStore.getState().setCustomerId(matchedCustomer.id);
      } else {
        useCustomerDetailsStore.getState().setSelectedCustomerId('');
        useExchangeDeskStore.getState().setCustomerId('');
      }
      return { businesses: updatedBusinesses };
    });
  },

  getActiveCustomers: () => {
    const { businesses, customers } = get();
    const activeBiz = businesses.find((b) => b.isActive) || businesses[0];
    if (!activeBiz) return customers;
    return customers.filter((c) => c.businessId === activeBiz.id);
  },

  setDefaultUser: (id) => {
    set((s) => ({
      users: s.users.map((u) => ({
        ...u,
        isDefault: u.id === id,
        roleTag: u.id === id ? 'DEFAULT' : 'Customer',
      })),
    }));
    // Sync with Customer Details Page
    useCustomerDetailsStore.getState().setSelectedCustomerId(id);
    // Sync with Exchange Desk Page
    useExchangeDeskStore.getState().setCustomerId(id);
  },

  addBusiness: async (name, subtitle, supportedCurrencies) => {
    const currencies: CurrencyCode[] = [...new Set(supportedCurrencies)].slice(0, 3);
    if (currencies.length !== 3) {
      throw new Error('Please select exactly 3 supported currencies.');
    }
    const { id: userId, email: ownerEmail } = await getSignedInUser();
    const isFirstBusiness = get().businesses.length === 0;

    if (isFirstBusiness) {
      await supabaseClient
        .from('businesses')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);
    }

    const payload = {
      user_id: userId,
      owner_email: ownerEmail,
      name: name.trim(),
      subtitle: subtitle.trim(),
      is_active: isFirstBusiness,
      supported_currencies: currencies.join(', '),
    };

    const { data, error } = await supabaseClient
      .from('businesses')
      .insert(payload)
      .select('id, name, subtitle, is_active, supported_currencies, owner_email, user_id')
      .single();

    if (error) throw new Error(error.message);

    const createdBusiness = mapBusinessRow(data as BusinessRow);

    let customerRow: CustomerRow;
    try {
      customerRow = await ensureDefaultExchangeCustomer(createdBusiness);
    } catch (customerError) {
      const customerErrorMessage = customerError instanceof Error ? customerError.message : String(customerError);
      const { error: rollbackError } = await supabaseClient
        .from('businesses')
        .delete()
        .eq('id', createdBusiness.id);
      if (rollbackError) {
        throw new Error(`Business was created, but its exchange account could not be created or rolled back: ${customerErrorMessage}; ${rollbackError.message}`);
      }
      throw new Error(`Unable to create the business exchange account: ${customerErrorMessage}`);
    }

    const { user: exchangeUser, customer: exchangeCustomer } = mapCustomerRow(customerRow);
    useExchangeDeskStore.getState().registerCustomer(
      exchangeCustomer.id,
      exchangeCustomer.name,
      currencies,
    );

    set((s) => ({
      businesses: [...s.businesses.filter((business) => business.id !== createdBusiness.id), createdBusiness],
      users: [...s.users.filter((user) => user.id !== exchangeUser.id), exchangeUser],
      customers: [...s.customers.filter((customer) => customer.id !== exchangeCustomer.id), exchangeCustomer],
      activeModal: null,
      editingBusiness: null,
    }));

    if (createdBusiness.isActive) {
      useCustomerDetailsStore.getState().setSelectedCustomerId(exchangeCustomer.id);
      useExchangeDeskStore.getState().setCustomerId(exchangeCustomer.id);
    }

    return createdBusiness;
  },

  addUser: async (
    name,
    subtitle,
    currencies,
    roleTag = 'Customer',
    openingBalances = {},
    descriptionLocale = 'en',
    notes = ''
  ) => {
    await getSignedInUser();

    const activeBiz = get().businesses.find((b) => b.isActive) || get().businesses[0];
    if (!activeBiz) {
      throw new Error('No active business found. Please create or select a business first.');
    }
    const currentBizId = Number(activeBiz.id);

    const parts = subtitle.split('•').map((p) => p.trim());
    const descriptionText = parts[0] || notes;
    const phoneText = parts.find((p) => p.startsWith('+') || /^\d[\d\s-]*$/.test(p)) || null;
    const addressText = parts.length > 2 ? parts[2] : null;

    const customerPayload = {
      business_id: currentBizId,
      name: name.trim(),
      phone: phoneText,
      address: addressText,
      description: descriptionText,
      firstpayment: openingBalances,
    };

    const { data, error } = await supabaseClient
      .from('customers')
      .insert(customerPayload)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const slugId = String(data.id);

    useExchangeDeskStore.getState().registerCustomer(slugId, name, currencies);

    const normalizedOpeningBalances = Object.fromEntries(
      currencies.map((currency) => {
        const amount = openingBalances[currency] ?? 0;
        return [currency, Number.isFinite(amount) && amount > 0 ? amount : 0];
      })
    ) as Partial<Record<CurrencyCode, number>>;

    for (const currency of currencies) {
      const amount = normalizedOpeningBalances[currency] ?? 0;
      if (currency === 'PKR' || currency === 'AFN' || currency === 'USD') {
        useCashBookStore.getState().addOpeningBalance(currency, amount);
      }

      if (amount > 0) {
        useCustomerDetailsStore.getState().addTransaction({
          customerId: slugId,
          title: 'Opening Balance',
          tag: 'Initial',
          category: 'initial',
          amount,
          currency: currency as CurrencyCode,
          isCredit: true,
          date: new Date().toISOString().slice(0, 10),
          refNo: `OB-${Date.now()}-${currency}`,
          notes: notes || descriptionText || 'Initial opening balance',
        });
      }
    }

    const businessCurrencies = activeBiz.supportedCurrencies ?? currencies;
    const validCurrencies = currencies.filter((currency) => businessCurrencies.includes(currency));

    set((s) => ({
      users: [
        ...s.users,
        {
          id: slugId,
          name,
          subtitle,
          descriptionLocale,
          roleTag,
          isDefault: false,
        },
      ],
      customers: [
        ...s.customers,
        {
          id: slugId,
          name,
          subtitle,
          descriptionLocale,
          businessId: activeBiz.id,
          balances: [
            ...validCurrencies.map((currency) => ({
              currency,
              amount: String(normalizedOpeningBalances[currency] ?? 0),
              isCredit: true,
            })),
          ],
        },
      ],
      activeModal: null,
      editingBusiness: null,
    }));
  },

  updateUser: async (id, name, phone, address, description) => {
    await getSignedInUser();
    const currentCustomer = get().customers.find((customer) => customer.id === id);
    if (currentCustomer?.isSystemDefault) {
      throw new Error('The Exchange Account cannot be renamed.');
    }
    const numericId = Number(id);

    const updatePayload: Record<string, unknown> = {
      name: name.trim(),
    };
    if (phone !== undefined) updatePayload.phone = phone.trim() || null;
    if (address !== undefined) updatePayload.address = address.trim() || null;
    if (description !== undefined) updatePayload.description = description.trim() || null;

    const { error } = await supabaseClient
      .from('customers')
      .update(updatePayload)
      .eq('id', isNaN(numericId) ? id : numericId);

    if (error) throw new Error(error.message);

    const subtitleParts = [description, phone, address].filter(Boolean);
    const subtitle = subtitleParts.join(' • ') || 'Customer Account';

    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, name: name.trim(), subtitle } : u)),
      customers: s.customers.map((c) =>
        c.id === id ? { ...c, name: name.trim(), subtitle, phone: phone || c.phone } : c
      ),
    }));
  },

  deleteUser: async (id) => {
    await getSignedInUser();
    const currentCustomer = get().customers.find((customer) => customer.id === id);
    if (currentCustomer?.isSystemDefault) {
      throw new Error('The Exchange Account cannot be deleted.');
    }
    const numericId = Number(id);

    // customer_ledger_transactions has an ON DELETE CASCADE foreign key. Refuse
    // deletion when ledger rows exist so deleting a customer never deletes them.
    const { count, error: ledgerLookupError } = await supabaseClient
      .from('customer_ledger_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', isNaN(numericId) ? id : numericId);
    if (ledgerLookupError) throw new Error(ledgerLookupError.message);
    if ((count ?? 0) > 0) {
      throw new Error('This customer has ledger transactions and cannot be deleted.');
    }

    const { error } = await supabaseClient
      .from('customers')
      .delete()
      .eq('id', isNaN(numericId) ? id : numericId);

    if (error) throw new Error(error.message);

    set((s) => ({
      users: s.users.filter((u) => u.id !== id),
      customers: s.customers.filter((c) => c.id !== id),
    }));
  },

  updateBusiness: async (id, name, subtitle, supportedCurrencies) => {
    await getSignedInUser();

    const updatePayload: Record<string, string> = {
      name: name.trim(),
      subtitle: subtitle.trim(),
    };

    if (supportedCurrencies && supportedCurrencies.length === 3) {
      updatePayload.supported_currencies = supportedCurrencies.join(', ');
    }

    const { error } = await supabaseClient
      .from('businesses')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw new Error(error.message);

    set((s) => ({
      businesses: s.businesses.map((b) =>
        b.id === id
          ? {
            ...b,
            name: name.trim(),
            subtitle: subtitle.trim(),
            ...(supportedCurrencies && supportedCurrencies.length === 3
              ? { supportedCurrencies }
              : {}),
          }
          : b
      ),
      users: s.users.map((u) =>
        u.id === id ? { ...u, name: name.trim(), subtitle: subtitle.trim() } : u
      ),
      customers: s.customers.map((c) =>
        c.id === id ? { ...c, name: name.trim(), subtitle: subtitle.trim() } : c
      ),
      activeModal: null,
      editingBusiness: null,
    }));
  },

  deleteBusiness: async (id) => {
    await getSignedInUser();

    const { error } = await supabaseClient
      .from('businesses')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    set((s) => {
      const nextBusinesses = s.businesses.filter((b) => b.id !== id);
      const nextUsers = s.users.filter((u) => u.id !== id);
      const nextCustomers = s.customers.filter((c) => c.businessId !== id);

      const hasActive = nextBusinesses.some((b) => b.isActive);
      if (!hasActive && nextBusinesses.length > 0) {
        nextBusinesses[0].isActive = true;
        supabaseClient
          .from('businesses')
          .update({ is_active: true })
          .eq('id', nextBusinesses[0].id)
          .then();
      }

      const hasDefault = nextUsers.some((u) => u.isDefault);
      if (!hasDefault && nextUsers.length > 0) {
        nextUsers[0].isDefault = true;
        useCustomerDetailsStore.getState().setSelectedCustomerId(nextUsers[0].id);
        useExchangeDeskStore.getState().setCustomerId(nextUsers[0].id);
      }

      return {
        businesses: nextBusinesses,
        users: nextUsers,
        customers: nextCustomers,
        activeModal: null,
        editingBusiness: null,
      };
    });
  },

  openEditBusiness: (business) => {
    set({
      editingBusiness: business,
      activeModal: 'edit_business',
    });
  },

  triggerBackup: () =>
    set({
      lastSynced: 'Just now (Synced to Google Drive)',
      activeModal: 'backup_success',
    }),

  triggerRestore: () =>
    set({
      lastSynced: 'Restored just now',
      activeModal: 'restore_success',
    }),

  openModal: (activeModal) => set({ activeModal, editingBusiness: activeModal === 'add_customer' ? null : undefined }),
  closeModal: () => set({ activeModal: null, editingBusiness: null }),
}));
