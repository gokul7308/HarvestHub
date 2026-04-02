import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { SettingSection } from './SettingSection';
import { motion } from 'framer-motion';
import { Loader2, Monitor, Smartphone, ShieldCheck, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function SecuritySettings() {
  const { settings, updateSettings } = useSettings();
  const { t } = useTranslation();
  const [updating, setUpdating] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema)
  });

  if (!settings) return null;
  const security = settings.security;

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    // mock API delay
    await new Promise(r => setTimeout(r, 800));
    toast.success(t("settings.passwordChanged"));
    reset();
  };

  const toggle2FA = async (checked: boolean) => {
    setUpdating(true);
    await updateSettings('security', { twoFactorEnabled: checked });
    setUpdating(false);
  };

  const toggleAlerts = async (checked: boolean) => {
    setUpdating(true);
    await updateSettings('security', { loginAlerts: checked });
    setUpdating(false);
  };

  const removeSession = async (id: string) => {
    setUpdating(true);
    const newSessions = security.activeSessions.filter(s => s.id !== id);
    await updateSettings('security', { activeSessions: newSessions });
    toast.success(t("settings.sessionTerminated"));
    setUpdating(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      
      <SettingSection title={t("settings.changePassword")} description={t("settings.ensureLongRandom")}>
        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
           <div className="space-y-2">
             <label className="text-sm font-medium text-slate-700">{t("settings.currentPassword")}</label>
             <Input type="password" {...register('currentPassword')} className="bg-gray-50/50" />
             {errors.currentPassword && <p className="text-red-500 text-xs">{errors.currentPassword.message}</p>}
           </div>
           <div className="space-y-2">
             <label className="text-sm font-medium text-slate-700">{t("settings.newPassword")}</label>
             <Input type="password" {...register('newPassword')} className="bg-gray-50/50" />
             {errors.newPassword && <p className="text-red-500 text-xs">{errors.newPassword.message}</p>}
           </div>
           <div className="space-y-2">
             <label className="text-sm font-medium text-slate-700">{t("settings.confirmPassword")}</label>
             <Input type="password" {...register('confirmPassword')} className="bg-gray-50/50" />
             {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
           </div>
           <div className="pt-2">
             <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white rounded-xl shadow-md">
               {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
               {t("settings.updatePassword")}
             </Button>
           </div>
        </form>
      </SettingSection>

      <SettingSection title={t("settings.enhancedSecurity")} description={t("settings.extraLayers")}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                 {t("settings.twoFactor")} 
                 {security.twoFactorEnabled && <ShieldCheck size={16} className="text-[#00E676]" />}
              </h4>
              <p className="text-sm text-slate-500">{t("settings.protectAuthApp")}</p>
            </div>
            <Switch checked={security.twoFactorEnabled} onCheckedChange={toggle2FA} disabled={updating} />
          </div>
          
          <hr className="border-gray-100" />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium text-slate-900">{t("settings.loginAlerts")}</h4>
              <p className="text-sm text-slate-500">{t("settings.getNotifiedUnrecognized")}</p>
            </div>
            <Switch checked={security.loginAlerts} onCheckedChange={toggleAlerts} disabled={updating} />
          </div>
        </div>
      </SettingSection>

      <SettingSection title={t("settings.activeSessions")} description={t("settings.currentlyLogged")}>
        <div className="space-y-4">
           {security.activeSessions.map((session, i) => (
             <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 gap-4">
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-full ${session.isCurrent ? 'bg-[#F0FDF4] text-[#1B5E20]' : 'bg-gray-100 text-slate-500'}`}>
                     {session.deviceName.includes('iPhone') || session.deviceName.includes('Mobile') ? <Smartphone size={24} /> : <Monitor size={24} />}
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        {session.deviceName} {session.isCurrent && <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#00E676] px-2 py-0.5 rounded-full">{t("settings.current")}</span>}
                     </p>
                     <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {session.location}</span>
                        <span>•</span>
                        <span>{session.lastActive}</span>
                     </div>
                   </div>
                </div>
                {!session.isCurrent && (
                  <Button variant="ghost" size="sm" onClick={() => removeSession(session.id)} disabled={updating} className="text-slate-600 border border-gray-200">
                    {t("settings.logoutDevice")}
                  </Button>
                )}
             </div>
           ))}
        </div>
      </SettingSection>

    </motion.div>
  );
}
