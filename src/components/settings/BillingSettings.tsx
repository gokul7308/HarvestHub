import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '../ui/button';
import { SettingSection } from './SettingSection';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, Download, Plus, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const plans = [
  { name: 'Free', price: '$0', features: ['Basic Market Access', 'Standard AI Insights', 'Community Forum'] },
  { name: 'Pro', price: '$49/mo', features: ['Priority Market Access', 'Advanced AI Price Predictor', '24/7 Email Support'] },
  { name: 'Enterprise', price: '$199/mo', features: ['Unlimited Market Access', 'Machine Learning API', 'Dedicated Acc Manager'] },
];

export function BillingSettings() {
  const { settings, updateSettings } = useSettings();
  const { t } = useTranslation();
  const [upgrading, setUpgrading] = useState(false);

  if (!settings) return null;
  const billing = settings.billing;

  const handleUpgrade = async (plan: 'Free' | 'Pro' | 'Enterprise') => {
    if (billing.currentPlan === plan) return;
    setUpgrading(true);
    await updateSettings('billing', { currentPlan: plan });
    setUpgrading(false);
  };

  const removeCard = async (id: string) => {
    setUpgrading(true);
    const newCards = billing.paymentMethods.filter(s => s.id !== id);
    await updateSettings('billing', { paymentMethods: newCards });
    toast.success("Payment method removed");
    setUpgrading(false);
  }

  const handleDownload = () => {
    toast.info("Invoice downloaded successfully");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      
      <SettingSection title={t("settings.subPlan")} description={t("settings.manageBillingCycle")}>
        
        <div className="bg-gradient-to-br from-[var(--color-primary)] to-[#004D40] text-white p-6 rounded-3xl shadow-lg mb-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
             <div>
               <p className="text-white/80 font-medium text-sm mb-1 uppercase tracking-wider">{t("settings.currentPlan")}</p>
               <h3 className="text-3xl font-bold font-poppins">{billing.currentPlan} Tier</h3>
               <p className="text-white/70 text-sm mt-2">{t("settings.nextBilling")}</p>
             </div>
             <Button className="bg-white text-[var(--color-primary)] hover:bg-gray-100 font-bold rounded-xl shadow-md h-12 px-6">{t("settings.manageSub")}</Button>
           </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
           {plans.map((p) => {
             const isCurrent = p.name === billing.currentPlan;
             return (
               <div key={p.name} className={`rounded-2xl border-2 p-5 transition-all ${isCurrent ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-gray-100 hover:border-gray-300'}`}>
                 <div className="flex justify-between items-start mb-4">
                   <h4 className="font-bold text-slate-900 text-lg">{p.name}</h4>
                   {isCurrent && <span className="bg-[var(--color-primary)] text-white text-[10px] uppercase font-bold px-2 py-1 rounded-md">Active</span>}
                 </div>
                 <div className="text-2xl font-bold mb-4 font-poppins text-slate-900">{p.price}</div>
                 <ul className="space-y-2 mb-6">
                   {p.features.map((f, i) => (
                     <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                       <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${isCurrent ? 'text-[var(--color-primary)]' : 'text-slate-400'}`} />
                       <span>{f}</span>
                     </li>
                   ))}
                 </ul>
                 {!isCurrent && (
                   <Button variant="outline" className={`w-full rounded-xl ${p.name === 'Pro' || p.name === 'Enterprise' ? 'bg-slate-900 text-white hover:bg-black border-transparent' : 'border-gray-200'}`} onClick={() => handleUpgrade(p.name as 'Free' | 'Pro' | 'Enterprise')} disabled={upgrading}>
                     {p.price === '$0' ? t("settings.downgrade") : t("settings.upgrade")}
                   </Button>
                 )}
               </div>
             )
           })}
        </div>
      </SettingSection>

      <SettingSection title={t("settings.paymentMethods")} description={t("settings.updateBillingSaved")}>
        <div className="space-y-4">
           {billing.paymentMethods.length > 0 ? billing.paymentMethods.map((pm, i) => (
             <div key={pm.id} className="flex flex-col sm:flex-row flex-start sm:items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 gap-4">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white text-slate-600 border border-gray-200 rounded-lg shadow-sm">
                     <CreditCard size={24} />
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        {pm.brand} ending in {pm.last4} {pm.isDefault && <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full border border-[var(--color-primary)]/20">{t("settings.default")}</span>}
                     </p>
                     <p className="text-xs text-slate-500 mt-1">{t("settings.expires")} {pm.expiry}</p>
                   </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeCard(pm.id)} disabled={upgrading} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  Remove
                </Button>
             </div>
           )) : (
             <div className="text-sm text-slate-500 bg-gray-50 p-4 rounded-xl text-center">No payment methods saved.</div>
           )}
           <Button variant="outline" className="w-full flex items-center gap-2 border-dashed border-gray-300 text-slate-600 hover:bg-gray-50 rounded-2xl h-12">
             <Plus size={16} /> {t("settings.addPayment")}
           </Button>
        </div>
      </SettingSection>

      <SettingSection title={t("settings.billingHistory")} description={t("settings.downloadReceipts")}>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
           <table className="w-full text-sm text-left">
             <thead className="text-xs text-slate-500 bg-gray-50/50 border-b border-gray-100">
               <tr>
                 <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t("settings.date")}</th>
                 <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t("settings.amount")}</th>
                 <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t("admin.status")}</th>
                 <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider">{t("admin.actions")}</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 bg-white">
                {billing.billingHistory.map((invoice, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-6 py-4 font-medium text-slate-900">{invoice.date}</td>
                     <td className="px-6 py-4 text-slate-600">${invoice.amount.toFixed(2)}</td>
                     <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${invoice.status === 'paid' ? 'bg-[#F0FDF4] text-[#1B5E20]' : invoice.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                         {t(`settings.${invoice.status}`)}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                       <Button variant="ghost" size="sm" onClick={handleDownload} className="text-slate-600 border border-gray-200 hover:bg-white h-8 w-8 p-0 ml-auto flex items-center justify-center">
                         <Download size={14} />
                       </Button>
                     </td>
                  </tr>
                ))}
             </tbody>
           </table>
        </div>
      </SettingSection>

    </motion.div>
  );
}
