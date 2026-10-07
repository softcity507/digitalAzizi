import { CurrencyCode } from './customer';

export interface BusinessProfile {
  id: string;
  name: string;
  subtitle: string;
  isActive: boolean;
  supportedCurrencies: CurrencyCode[];
}

export interface AppAdminProfile {
  name: string;
  title: string;
  email: string;
  badge: string;
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
