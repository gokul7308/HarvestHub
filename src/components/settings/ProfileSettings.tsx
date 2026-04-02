import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSettings } from '@/context/SettingsContext';
import { useUser } from '@/context/UserContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { SettingSection } from './SettingSection';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Camera, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const profileSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  bio: z.string().max(250),
  location: z.string(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const { settings, updateSettings } = useSettings();
  const { updateUser } = useUser();
  const { t } = useTranslation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: settings?.profile || { fullName: '', email: '', bio: '', location: '' }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateSettings('profile', data);
      updateUser({ name: data.fullName, email: data.email });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        updateSettings('profile', { avatarUrl: result });
        updateUser({ avatar: result });
        toast.info("Avatar updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    const defaultAvatar = 'https://i.pravatar.cc/150?u=default';
    updateSettings('profile', { avatarUrl: defaultAvatar });
    updateUser({ avatar: defaultAvatar });
    toast.info("Avatar removed.");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <SettingSection title={t("settings.publicProfile")} description={t("settings.beCarefulShare")}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-6">
             <div className="relative group">
               <motion.div 
                 whileHover={{ scale: 1.05 }}
                 className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-md"
               >
                 <img src={settings?.profile?.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                 <div 
                   className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}
                 >
                   <Camera size={20} className="text-white" />
                 </div>
               </motion.div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*" 
                 onChange={handleFileChange} 
               />
             </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">{settings?.profile?.fullName}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{settings?.profile?.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    className="h-9 px-4 rounded-xl shadow-sm border-gray-200 text-[11px] font-black uppercase tracking-widest hover:bg-[#F0FDF4] hover:text-[#1B5E20] hover:border-[#1B5E20]/20 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t("settings.changeImage")}
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-9 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                    onClick={removeAvatar}
                  >
                    <Trash2 size={14} className="mr-2" />
                    {t("settings.remove")}
                  </Button>
                </div>
              </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700">{t("settings.fullName")}</label>
               <Input {...register('fullName')} className="bg-gray-50/50" />
               {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700">{t("settings.emailAddress")}</label>
               <Input {...register('email')} className="bg-gray-50/50" />
               {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
             </div>
             <div className="sm:col-span-2 space-y-2">
               <label className="text-sm font-medium text-slate-700">{t("settings.bio")}</label>
               <textarea rows={4} {...register('bio')} className="flex w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] resize-none" />
               {errors.bio && <p className="text-red-500 text-xs">{errors.bio.message}</p>}
             </div>
             <div className="sm:col-span-2 space-y-2">
               <label className="text-sm font-medium text-slate-700">{t("marketplace.location")}</label>
               <Input {...register('location')} className="bg-gray-50/50" />
               {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
             </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50">
            <Button type="submit" disabled={isSubmitting} className="bg-slate-900 hover:bg-black text-white px-8 rounded-xl shadow-lg w-full sm:w-auto">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              {t("settings.saveChanges")}
            </Button>
          </div>
        </form>
      </SettingSection>

      <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
        <h3 className="text-red-600 font-bold mb-1">{t("settings.dangerZone")}</h3>
        <p className="text-red-600/70 text-sm mb-4">{t("settings.permanentlyDelete")}</p>
        <Button variant="destructive" className="bg-red-600 hover:bg-red-700 shadow-sm rounded-xl">{t("settings.deleteAccount")}</Button>
      </div>
    </motion.div>
  );
}
