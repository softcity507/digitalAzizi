import { CurrencyCode } from './customer';

export const SYSTEM_DEFAULT_BUSINESS_SUBTITLE = 'Default business created by the system';

export interface BusinessProfile {
  id: string;
  name: string;
  subtitle: string;
  isActive: boolean;
  supportedCurrencies: CurrencyCode[];
  recycle?: boolean;
  deleteDate?: string | null;
  customerCount?: number;
}

export interface AppAdminProfile {
  name: string;
  title: string;
  email: string;
  badge: string;
  id: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  roleTag: string;
  subtitle: string;
  isDefault: boolean;
}

export interface AuditLogItem {
  id: string;
  title: string;
  description: string;
  date: string;
}
