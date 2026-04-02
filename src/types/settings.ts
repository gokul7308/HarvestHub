export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'green' | 'blue' | 'purple' | 'orange';
export type UIDensity = 'compact' | 'comfortable';

export interface ProfileSettings {
  fullName: string;
  email: string;
  bio: string;
  location: string;
  avatarUrl: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  activeSessions: ActiveSession[];
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface NotificationGroup {
  marketAlerts: boolean;
  buyerMessages: boolean;
  orderUpdates: boolean;
  aiInsights: boolean;
  promotions: boolean;
}

export interface NotificationSettings {
  email: NotificationGroup;
  push: NotificationGroup;
  sms: NotificationGroup;
}

export interface BillingSettings {
  currentPlan: 'Free' | 'Pro' | 'Enterprise';
  paymentMethods: PaymentMethod[];
  billingHistory: BillingInvoice[];
}

export interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
}

export interface BillingInvoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

export interface AppearanceSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  uiDensity: UIDensity;
  fontSize: number; // 12 to 20
}

export interface UserSettings {
  profile: ProfileSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  billing: BillingSettings;
  appearance: AppearanceSettings;
}
