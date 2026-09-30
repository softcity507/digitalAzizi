import { create } from 'zustand';
import { BusinessProfile, AppAdminProfile, RegisteredUser, AuditLogItem } from '@/types/settings';
import { CustomerAccount, CurrencyCode } from '@/types/customer';
import { CUSTOMER_ACCOUNTS } from '@/data/customerData';
import { useCustomerDetailsStore } from './useCustomerDetailsStore';
import { useExchangeDeskStore } from './useExchangeDeskStore';
import { useCashBookStore } from './useCashBookStore';
import { SupportedLocale } from '@/i18n/languages';

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

  setActiveBusiness: (id: string) => void;
  setDefaultUser: (id: string) => void;
  addUser: (
    name: string,
    subtitle: string,
    currencies: CurrencyCode[],
    roleTag?: string,
    openingBalances?: Partial<Record<CurrencyCode, number>>,
    descriptionLocale?: SupportedLocale,
    notes?: string
  ) => void;
  updateBusiness: (id: string, name: string, subtitle: string) => void;
  deleteBusiness: (id: string) => void;
  openEditBusiness: (business: BusinessProfile) => void;
  triggerBackup: () => void;
  triggerRestore: () => void;
  openModal: (type: SettingsModalType) => void;
  closeModal: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  admin: {
    name: 'Azizullah',
    title: 'System Manager',
    email: 'azizullah0703@gmail.com',
    badge: 'Super Admin / Manager',
  },
  businesses: [
    {
      id: 'al-rehman',
      name: 'Al-Rehman Co',
      subtitle: 'Primary Ledger & Vault',
      isActive: true,
      supportedCurrencies: ['AFN', 'USD', 'PKR'],
    },
    {
      id: 'kabul-express',
      name: 'Kabul Express Hawala',
      subtitle: 'Secondary Settlement Hub',
      isActive: false,
      supportedCurrencies: ['AFN', 'USD', 'PKR'],
    },
  ],
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
  customers: CUSTOMER_ACCOUNTS,
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

  setActiveBusiness: (id) =>
    set((s) => ({
      businesses: s.businesses.map((b) => ({ ...b, isActive: b.id === id })),
    })),

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

  addUser: (name, subtitle, currencies, roleTag = 'Customer', openingBalances = {}, descriptionLocale = 'en', notes = '') => {
    const slugId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `user-${Date.now()}`;
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

    useCustomerDetailsStore.getState().setSelectedCustomerId(slugId);

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
          balances: [
            ...currencies.map((currency) => ({ currency, amount: String(normalizedOpeningBalances[currency] ?? 0), isCredit: true })),
          ],
        },
      ],
      businesses: [
        ...s.businesses,
        {
          id: slugId,
          name,
          subtitle,
          descriptionLocale,
          isActive: false,
          supportedCurrencies: currencies,
        },
      ],
      activeModal: null,
      editingBusiness: null,
    }));
  },

  updateBusiness: (id, name, subtitle) => {
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

  deleteBusiness: (id) => {
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
