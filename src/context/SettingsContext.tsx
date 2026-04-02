import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSettings } from '../types/settings';
import { getSettings, updateSettings as updateSettingsApi } from '../services/settingsService';
import { toast } from 'sonner';

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  updateSettings: <K extends keyof UserSettings>(section: K, data: Partial<UserSettings[K]>) => Promise<void>;
  applyAppearance: (appearance: UserSettings['appearance']) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((data) => {
      setSettings(data);
      applyAppearance(data.appearance);
      setLoading(false);
    });
  }, []);

  const applyAppearance = (appearance: UserSettings['appearance']) => {
    const root = document.documentElement;
    
    // FontSize
    root.style.fontSize = `${appearance.fontSize}px`;
    
    // Accent Colors
    const accents: Record<string, string> = {
      green: '#1B5E20',
      blue: '#2563eb',
      purple: '#7e22ce',
      orange: '#ea580c'
    };
    root.style.setProperty('--color-primary', accents[appearance.accentColor] || accents.green);
  };

  const updateSettings = async <K extends keyof UserSettings>(section: K, data: Partial<UserSettings[K]>) => {
    try {
      const updated = await updateSettingsApi(section, data);
      setSettings(updated);
      if (section === 'appearance') {
        applyAppearance(updated.appearance);
      }
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings updated`);
    } catch (e) {
      toast.error('Failed to update settings');
      throw e;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, applyAppearance }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
