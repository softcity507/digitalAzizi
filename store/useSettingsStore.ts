import { create } from 'zustand';
import { BusinessProfile, AppAdminProfile, RegisteredUser, AuditLogItem } from '@/types/settings';
import { CustomerAccount, CurrencyCode } from '@/types/customer';
import { useCustomerDetailsStore } from './useCustomerDetailsStore';
import { useExchangeDeskStore } from './useExchangeDeskStore';
import { useCashBookStore } from './useCashBookStore';
import { SupportedLocale } from '@/i18n/languages';
import { supabaseClient } from '@/lib/supabaseClient';
import seedData from './AllJs.json';

interface BusinessRow {
  id: number | string;
  name: string | null;
  subtitle: string | null;
  description_locale: string | null;
  is_active: boolean | null;
  supported_currencies: string | string[] | null;
}

const DEFAULT_BUSINESS_CURRENCIES: CurrencyCode[] = ['AFN', 'USD', 'PKR'];
const VALID_BUSINESS_CURRENCIES = new Set<CurrencyCode>([
  'AFN', 'USD', 'PKR', 'IRR', 'INR', 'AED', 'EUR', 'GBP', 'CNY', 'TRY',
]);

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
}

const mapBusinessRow = (business: BusinessRow): BusinessProfile => ({
  id: String(business.id),
  name: business.name ?? 'My Business',
  subtitle: business.subtitle ?? '',
  descriptionLocale: (business.description_locale ?? 'en') as SupportedLocale,
  isActive: Boolean(business.is_active),
  supportedCurrencies: parseBusinessCurrencies(business.supported_currencies),
});

const getSignedInEmail = async (): Promise<string> => {
  const { data, error } = await supabaseClient.auth.getUser();
  const email = data.user?.email?.trim().toLowerCase();
  if (error || !email) throw new Error('Sign in with Supabase to manage business profiles.');
  return email;
};

const seedBusinesses = seedData[0].businesses;
const jsonBusinesses: BusinessProfile[] = seedBusinesses.map((business) => ({
  id: business.id,
  name: business.name,
  subtitle: business.description,
  isActive: business.id === seedData[0].current_business_id,
  supportedCurrencies: business.active_currencies as CurrencyCode[],
}));
const jsonCustomers: CustomerAccount[] = seedBusinesses.flatMap((business) => business.customers.map((customer) => ({
  id: `${business.id}_${customer.id}`,
  name: `${customer.first_name} ${customer.last_name}`.trim(),
  phone: customer.phone,
  subtitle: customer.address,
  businessId: business.id,
  balances: customer.customer_currencies
    .filter((balance) => business.active_currencies.includes(balance.type))
    .map((balance) => ({ currency: balance.type as CurrencyCode, amount: String(balance.amount), isCredit: balance.amount >= 0 })),
})));

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
  setActiveBusiness: (id: string) => Promise<void>;
  getActiveCustomers: () => CustomerAccount[];
  setDefaultUser: (id: string) => void;
  addBusiness: (
    name: string,
    subtitle: string,
    supportedCurrencies: CurrencyCode[],
    descriptionLocale?: SupportedLocale
  ) => Promise<void>;
  addUser: (
    name: string,
    subtitle: string,
    currencies: CurrencyCode[],
    roleTag?: string,
    openingBalances?: Partial<Record<CurrencyCode, number>>,
    descriptionLocale?: SupportedLocale,
    notes?: string
  ) => void;
  updateBusiness: (id: string, name: string, subtitle: string) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
  openEditBusiness: (business: BusinessProfile) => void;
  triggerBackup: () => void;
  triggerRestore: () => void;
  openModal: (type: SettingsModalType) => void;
  closeModal: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  admin: {
    name: 'Azizullah',
    title: 'System Manager',
    email: 'azizullah0703@gmail.com',
    badge: 'Super Admin / Manager',
  },
  businesses: jsonBusinesses,
  users: [
    {
      id: 'aziz-khan',
      name: 'Aziz Khan',
      roleTag: 'DEFAULT',
      subtitle: 'Primary Active User / Default Account',
      isDefault: true,
    },
    {
      id: 'salam-jan',
      name: 'Salam Jan',
      roleTag: 'Customer',
      subtitle: 'Secondary Record',
      isDefault: false,
    },
    {
      id: 'haji-noorullah',
      name: 'Haji Noorullah',
      roleTag: 'Customer',
      subtitle: 'Hawala & Trade Account',
      isDefault: false,
    },
  ],
  customers: jsonCustomers,
  auditLogs: [
    {
      id: 'log-1',
      title: 'Soft-deleted cash voucher #CV-1092',
      description: 'Marked is_deleted: true on AFN 50,000 cash in',
      date: '2025-02-24 14:32',
    },
    {
      id: 'log-2',
      title: 'Customer account archived: Wahid Sarraf',
      description: 'Zero balance ledger state archived safely',
      date: '2025-02-23 11:15',
    },
    {
      id: 'log-3',
      title: 'Rate table synced with Sarafi Market',
      description: 'USD/AFN rate adjusted to 71.20',
      date: '2025-02-22 09:00',
    },
  ],
  lastSynced: 'Synced 4 minutes ago',
  activeModal: null,
  editingBusiness: null,

  setAdmin: (admin) => set({ admin }),

  fetchBusinesses: async () => {
    const ownerEmail = await getSignedInEmail();
    const { data, error } = await supabaseClient
      .from('businesses')
      .select('id, name, subtitle, description_locale, is_active, supported_currencies')
      .eq('owner_email', ownerEmail)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    set({ businesses: (data ?? []).map((business) => mapBusinessRow(business as BusinessRow)) });
  },

  setActiveBusiness: async (id) => {
    const currentBusiness = get().businesses.find((business) => business.id === id);
    if (!currentBusiness || currentBusiness.isActive) return;
    const ownerEmail = await getSignedInEmail();

    const { error: clearError } = await supabaseClient
      .from('businesses')
      .update({ is_active: false })
      .eq('owner_email', ownerEmail)
      .eq('is_active', true);
    if (clearError) throw new Error(clearError.message);

    const { error } = await supabaseClient
      .from('businesses')
      .update({ is_active: true })
      .eq('id', id)
      .eq('owner_email', ownerEmail);
    if (error) throw new Error(error.message);

    set((s) => {
      const updatedBusinesses = s.businesses.map((b) => ({ ...b, isActive: b.id === id }));
      // Sync customer details and exchange desk if there is a matching customer for this business
      const matchedCustomer = s.customers.find((c) => c.businessId === id);
      if (matchedCustomer) {
        useCustomerDetailsStore.getState().setSelectedCustomerId(matchedCustomer.id);
        useExchangeDeskStore.getState().setCustomerId(matchedCustomer.id);
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

  addBusiness: async (name, subtitle, supportedCurrencies, descriptionLocale = 'en') => {
    const currencies: CurrencyCode[] = [...new Set(supportedCurrencies)].slice(0, 3);
    if (currencies.length !== 3) return;
    const ownerEmail = await getSignedInEmail();

    const { data, error } = await supabaseClient
      .from('businesses')
      .insert({
        owner_email: ownerEmail,
        name,
        subtitle,
        description_locale: descriptionLocale,
        is_active: get().businesses.length === 0,
        supported_currencies: currencies.join(', '),
      })
      .select('id, name, subtitle, description_locale, is_active, supported_currencies')
      .single();
    if (error) throw new Error(error.message);

    set((s) => ({
      businesses: [...s.businesses, mapBusinessRow(data as BusinessRow)],
    }));
  },

  addUser: (name, subtitle, currencies, roleTag = 'Customer', openingBalances = {}, descriptionLocale = 'en', notes = '') => {
    const baseId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'customer';
    const slugId = `${baseId}-${Date.now().toString(36)}`;
    useExchangeDeskStore.getState().registerCustomer(slugId, name, currencies);

    const normalizedOpeningBalances = Object.fromEntries(currencies.map((currency) => {
      const amount = openingBalances[currency] ?? 0;
      return [currency, Number.isFinite(amount) && amount > 0 ? amount : 0];
    })) as Partial<Record<CurrencyCode, number>>;

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
          currency,
          isCredit: true,
          date: new Date().toISOString().slice(0, 10),
          refNo: `OB-${Date.now()}-${currency}`,
          notes: notes || subtitle || 'Initial opening balance',
        });
      }
    }

    const activeBiz = get().businesses.find((b) => b.isActive) || get().businesses[0];
    const currentBizId = activeBiz?.id;
    const businessCurrencies = activeBiz?.supportedCurrencies ?? currencies;
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
          businessId: currentBizId,
          balances: [
            ...validCurrencies.map((currency) => ({ currency, amount: String(normalizedOpeningBalances[currency] ?? 0), isCredit: true })),
          ],
        },
      ],
      activeModal: null,
      editingBusiness: null,
    }));
  },

  updateBusiness: async (id, name, subtitle) => {
    const ownerEmail = await getSignedInEmail();
    const { error } = await supabaseClient
      .from('businesses')
      .update({ name: name.trim(), subtitle: subtitle.trim() })
      .eq('id', id)
      .eq('owner_email', ownerEmail);
    if (error) throw new Error(error.message);

    set((s) => ({
      businesses: s.businesses.map((b) =>
        b.id === id ? { ...b, name, subtitle } : b
      ),
      users: s.users.map((u) =>
        u.id === id ? { ...u, name, subtitle } : u
      ),
      customers: s.customers.map((c) =>
        c.id === id ? { ...c, name, subtitle } : c
      ),
      activeModal: null,
      editingBusiness: null,
    }));
  },

  deleteBusiness: async (id) => {
    const ownerEmail = await getSignedInEmail();
    const { error } = await supabaseClient
      .from('businesses')
      .delete()
      .eq('id', id)
      .eq('owner_email', ownerEmail);
    if (error) throw new Error(error.message);

    set((s) => {
      const nextBusinesses = s.businesses.filter((b) => b.id !== id);
      const nextUsers = s.users.filter((u) => u.id !== id);
      const nextCustomers = s.customers.filter((c) => c.id !== id);

      // If active business deleted, set first available as active
      const hasActive = nextBusinesses.some((b) => b.isActive);
      if (!hasActive && nextBusinesses.length > 0) {
        nextBusinesses[0].isActive = true;
      }

      // If default user deleted, set first available as default
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
