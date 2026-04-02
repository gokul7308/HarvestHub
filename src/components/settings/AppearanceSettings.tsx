import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '../ui/button';
import { SettingSection } from './SettingSection';
import { Sun, Moon, Monitor, Type, Palette, MousePointer2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function AppearanceSettings() {
  const { settings, updateSettings, loading } = useSettings();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  if (loading || !settings) return <div>{t("settings.loadingAppearance")}</div>;

  const { accentColor, fontSize } = settings.appearance;

  const handleUpdate = (data: Partial<typeof settings.appearance>) => {
    updateSettings('appearance', data);
  };

  const colors = [
    { name: 'green', hex: '#1B5E20' },
    { name: 'blue', hex: '#2563eb' },
    { name: 'purple', hex: '#7e22ce' },
    { name: 'orange', hex: '#ea580c' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <SettingSection title={t("settings.themePreferences")} description={t("settings.chooseLook")}>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'light', icon: Sun, label: t("settings.light") },
            { id: 'dark', icon: Moon, label: t("settings.dark") },
            { id: 'system', icon: Monitor, label: t("settings.system") },
          ].map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id as any)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === themeOption.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <themeOption.icon size={20} className={theme === themeOption.id ? 'text-[var(--color-primary)]' : 'text-slate-500'} />
              <span className={`text-sm font-medium ${theme === themeOption.id ? 'text-[var(--color-primary)]' : 'text-slate-600'}`}>{themeOption.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <label className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Palette size={16} /> {t("settings.accentColor")}</label>
          <div className="flex gap-4">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => handleUpdate({ accentColor: c.name as any })}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                  accentColor === c.name ? 'ring-2 ring-offset-2 ring-slate-900' : ''
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {accentColor === c.name && <Check size={16} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex justify-between">
             <label className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Type size={16} /> {t("settings.fontSize")}</label>
             <span className="text-sm text-slate-500">{fontSize}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="18"
            value={fontSize}
            onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1B5E20]"
          />
        </div>
      </SettingSection>

      <SettingSection title={t("settings.uiPreview")} description={t("settings.realTimePreview")}>
        <div className="p-6 bg-slate-50 rounded-2xl border border-gray-100">
           <div className="p-4 bg-white shadow-sm border border-gray-100 rounded-xl max-w-sm">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white"><MousePointer2 size={18} /></div>
               <div>
                  <div className="h-2 w-24 bg-slate-200 rounded-full mb-1"></div>
                  <div className="h-2 w-16 bg-slate-100 rounded-full"></div>
               </div>
             </div>
             <Button className="w-full bg-[var(--color-primary)] text-white hover:brightness-110">{t("settings.sampleButton")}</Button>
           </div>
        </div>
      </SettingSection>
    </motion.div>
  );
}
