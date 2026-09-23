import { create } from 'zustand';
import { BusinessProfile, AppAdminProfile, RegisteredUser, AuditLogItem } from '@/types/settings';
import { CustomerAccount } from '@/types/customer';
import { CUSTOMER_ACCOUNTS } from '@/data/customerData';
import { useCustomerDetailsStore } from './useCustomerDetailsStore';
import { useExchangeDeskStore } from './useExchangeDeskStore';

export type SettingsModalType = 'add_customer' | 'audit_log' | 'backup_success' | 'restore_success' | null;

interface SettingsState {
  admin: AppAdminProfile;
  businesses: BusinessProfile[];
  users: RegisteredUser[];
  customers: CustomerAccount[];
  auditLogs: AuditLogItem[];
  lastSynced: string;
  activeModal: SettingsModalType;

  setActiveBusiness: (id: string) => void;
  setDefaultUser: (id: string) => void;
  addUser: (name: string, subtitle: string, roleTag?: string) => void;
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

  addUser: (name, subtitle, roleTag = 'Customer') => {
    const slugId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `user-${Date.now()}`;
    useExchangeDeskStore.getState().registerCustomer(slugId, name);
    set((s) => ({
      users: [
        ...s.users,
        {
          id: slugId,
          name,
          subtitle,
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
          balances: [
            { currency: 'AFN', amount: '0', isCredit: true },
            { currency: 'USD', amount: '0', isCredit: true },
            { currency: 'PKR', amount: '0', isCredit: true },
          ],
        },
      ],
      activeModal: null,
    }));
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

  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
}));
