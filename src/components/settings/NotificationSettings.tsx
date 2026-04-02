import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { SettingSection } from './SettingSection';
import { motion } from 'framer-motion';
import { Mail, Smartphone, MessageSquare, Save, Loader2 } from 'lucide-react';
import { NotificationGroup, NotificationSettings as INotificationSettings } from '@/types/settings';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function NotificationSettings() {
  const { settings, updateSettings } = useSettings();
  const { t } = useTranslation();
  const [localSettings, setLocalSettings] = useState<INotificationSettings | null>(null);
  const [saving, setSaving] = useState(false);

  const notificationKeys: Array<{ key: keyof NotificationGroup, label: string }> = [
    { key: 'marketAlerts', label: t('notifKeys.marketAlerts') },
    { key: 'buyerMessages', label: t('notifKeys.buyerMessages') },
    { key: 'orderUpdates', label: t('notifKeys.orderUpdates') },
    { key: 'aiInsights', label: t('notifKeys.aiInsights') },
    { key: 'promotions', label: t('notifKeys.promotions') },
  ];

  useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings.notifications);
    }
  }, [settings, localSettings]);

  if (!localSettings) return null;

  const handleToggle = (group: keyof INotificationSettings, key: keyof NotificationGroup) => {
    setLocalSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [group]: { ...prev[group], [key]: !prev[group][key] }
      };
    });
  };

  const handleSelectAll = (group: keyof INotificationSettings) => {
    setLocalSettings(prev => {
      if (!prev) return prev;
      const currentGroup = prev[group];
      const allSelected = notificationKeys.every(k => currentGroup[k.key]);
      
      const newGroupState = { ...currentGroup };
      notificationKeys.forEach(k => {
        newGroupState[k.key] = !allSelected;
      });

      return {
        ...prev,
        [group]: newGroupState
      };
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    await updateSettings('notifications', localSettings);
    setSaving(false);
  };

  const rendersGroup = (group: keyof INotificationSettings, title: string, icon: React.ReactNode) => {
    const isAllSelected = notificationKeys.every(k => localSettings[group][k.key]);

    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
           <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
             {icon}
           </div>
           <div className="flex-1">
             <h3 className="font-semibold text-slate-900">{title}</h3>
           </div>
           <Button variant="ghost" size="sm" onClick={() => handleSelectAll(group)} className="text-xs shrink-0 text-slate-600 hover:text-[var(--color-primary)]">
             {isAllSelected ? t("settings.deselectAll") : t("settings.selectAll")}
           </Button>
        </div>
        <div className="space-y-4">
          {notificationKeys.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm text-slate-700 cursor-pointer" onClick={() => handleToggle(group, key)}>{label}</label>
              <Switch checked={localSettings[group][key]} onCheckedChange={() => handleToggle(group, key)} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      
      <SettingSection title={t("settings.notifPreferences")} description={t("settings.chooseWhatNotify")}>
        
        {rendersGroup('email', t("settings.emailNotifs"), <Mail size={20} />)}
        {rendersGroup('push', t("settings.pushNotifs"), <Smartphone size={20} />)}
        {rendersGroup('sms', t("settings.smsNotifs"), <MessageSquare size={20} />)}

        <div className="flex justify-end pt-4 sticky bottom-6 z-10">
          <Button onClick={saveSettings} disabled={saving} className="bg-slate-900 hover:bg-black text-white px-8 rounded-xl shadow-xl shadow-black/10 transition-all h-12 w-full sm:w-auto text-base">
             {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
             {t("settings.savePreferences")}
          </Button>
        </div>

      </SettingSection>

    </motion.div>
  );
}
