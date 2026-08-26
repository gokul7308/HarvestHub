import { UserSettings } from '../types/settings';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SETTINGS_KEY = 'harvesthub_user_settings';

const defaultSettings: UserSettings = {
  profile: {
    fullName: 'Alex Johnson',
    email: 'alex@farm.com',
    bio: 'Professional farmer specializing in premium commodities.',
    location: 'San Francisco, California',
    avatarUrl: 'https://i.pravatar.cc/150?u=f1',
  },
  security: {
    twoFactorEnabled: false,
    loginAlerts: true,
    activeSessions: [
      { id: '1', deviceName: 'MacBook Pro 16"', location: 'San Francisco, CA', lastActive: 'Current Session', isCurrent: true },
      { id: '2', deviceName: 'iPhone 14 Pro', location: 'San Francisco, CA', lastActive: '2 hours ago', isCurrent: false },
    ],
  },
  notifications: {
    email: { marketAlerts: true, buyerMessages: true, orderUpdates: true, aiInsights: true, promotions: false },
    push: { marketAlerts: true, buyerMessages: true, orderUpdates: true, aiInsights: true, promotions: false },
    sms: { marketAlerts: false, buyerMessages: true, orderUpdates: false, aiInsights: false, promotions: false },
  },
  billing: {
    currentPlan: 'Pro',
    paymentMethods: [
      { id: 'pm1', last4: '4242', brand: 'Visa', expiry: '12/26', isDefault: true },
    ],
    billingHistory: [
      { id: 'inv1', date: '2026-03-01', amount: 49.00, status: 'paid' },
      { id: 'inv2', date: '2026-02-01', amount: 49.00, status: 'paid' },
    ],
  },
  appearance: {
    theme: 'system',
    accentColor: 'green',
    uiDensity: 'comfortable',
    fontSize: 14,
  },
};

export const getSettings = async (): Promise<UserSettings> => {
  await delay(800); // simulate network
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
  return JSON.parse(data) as UserSettings;
};

export const updateSettings = async <K extends keyof UserSettings>(
  section: K,
  data: Partial<UserSettings[K]>
): Promise<UserSettings> => {
  await delay(600);
  const current = await getSettings();
  const updated: UserSettings = {
    ...current,
    [section]: { ...current[section], ...data }
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
};

export const resetAppearanceSettings = async (): Promise<UserSettings> => {
  return updateSettings('appearance', defaultSettings.appearance);
};
