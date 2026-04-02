import React, { useState } from "react"
import { useUser } from "@/context/UserContext"
import { useSettings } from "@/context/SettingsContext"
import { motion, AnimatePresence } from "framer-motion"
import { User, Lock, Bell, Palette, CreditCard } from "lucide-react"
import { useTranslation } from "react-i18next"

import { ProfileSettings } from "@/components/settings/ProfileSettings"
import { SecuritySettings } from "@/components/settings/SecuritySettings"
import { NotificationSettings } from "@/components/settings/NotificationSettings"
import { BillingSettings } from "@/components/settings/BillingSettings"
import { AppearanceSettings } from "@/components/settings/AppearanceSettings"

export default function SettingsPage() {
  const { user } = useUser()
  const { loading } = useSettings()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', icon: User, label: t("settings.profile"), component: ProfileSettings },
    { id: 'security', icon: Lock, label: t("settings.security"), component: SecuritySettings },
    { id: 'notifications', icon: Bell, label: t("settings.notifications"), component: NotificationSettings },
    { id: 'billing', icon: CreditCard, label: t("settings.billing"), component: BillingSettings },
    { id: 'appearance', icon: Palette, label: t("settings.appearance"), component: AppearanceSettings },
  ]

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-10 animate-pulse pb-20">
        <div>
          <div className="h-12 w-80 bg-slate-100 rounded-2xl mb-4"></div>
          <div className="h-4 w-[500px] bg-slate-50 rounded-full"></div>
        </div>
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-72 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-slate-50 rounded-2xl w-full"></div>)}
          </div>
          <div className="flex-1 h-[600px] bg-white border-2 border-slate-50 rounded-[40px]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-32 font-sans selection:bg-[#1B5E20]/30 selection:text-[#1B5E20]">
      <div>
        <h1 className="text-4xl font-extrabold font-poppins text-slate-900 tracking-tight">
          {t("settings.accountPreferences")} ⚙️
        </h1>
        <p className="text-slate-500 mt-2 font-medium">{t("settings.manageProfile")}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-start relative">
        {/* Settings Sidebar */}
        <div className="w-full md:w-72 shrink-0 space-y-2 md:sticky md:top-28">
           <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-4">Categories</div>
          {tabs.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 w-full px-5 py-4 rounded-[20px] text-sm font-black transition-all relative group ${
                  isActive ? "text-[#1B5E20]" : "text-slate-400 hover:text-slate-900"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeSettingsTab"
                    className="absolute inset-0 bg-[#F0FDF4] border-2 border-[#1B5E20]/5 rounded-[20px] shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon size={20} className={`relative z-10 transition-transform group-hover:scale-110 ${isActive ? 'text-[#1B5E20]' : 'text-slate-300'}`} /> 
                <span className="relative z-10 uppercase tracking-widest text-[11px]">{item.label}</span>
                {isActive && <motion.div layoutId="activeIndicator" className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#1B5E20] z-10" />}
              </button>
            )
          })}
        </div>

        {/* Settings View Container */}
        <div className="flex-1 min-w-0 w-full relative">
           <AnimatePresence mode="wait">
             {tabs.map(tab => tab.id === activeTab && (
               <motion.div 
                 key={tab.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.3, ease: "easeOut" }}
               >
                 <tab.component />
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
