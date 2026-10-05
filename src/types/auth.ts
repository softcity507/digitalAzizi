export type UserRole = 'admin' | 'user';

export interface AppUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: UserRole;
  subscription_days: string;
  subscription_expires_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface GoogleLoginPayload {
  email?: string;
  name?: string;
  avatar_url?: string;
  token?: string;
  subscription_days?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AppUser;
  error?: string;
  message?: string;
}
