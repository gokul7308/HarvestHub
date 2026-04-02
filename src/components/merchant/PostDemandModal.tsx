import React, { useState } from 'react';
import { Target, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/context/UserContext';
import { useDemand } from '@/context/DemandContext';

interface PostDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostDemandModal({ isOpen, onClose }: PostDemandModalProps) {
  const { user } = useUser();
  const { addDemand } = useDemand();

  const [demandForm, setDemandForm] = useState({
    crop: '',
    quantity: '',
    price: '',
    location: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demandForm.crop || !demandForm.quantity || !demandForm.price) {
      import('sonner').then(({ toast }) => toast.error("Please fill all required fields"));
      return;
    }

    addDemand({
      crop: demandForm.crop,
      quantity: demandForm.quantity,
      price: demandForm.price,
      location: demandForm.location,
      notes: demandForm.notes,
      buyerName: user?.name || "Global Merchant"
    });

    setDemandForm({ crop: '', quantity: '', price: '', location: '', notes: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm pt-20">
      <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden bg-white dark:bg-[#07122a] animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 px-6 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
             <Target size={20} className="text-blue-600" /> Post New Demand
          </CardTitle>
          <button onClick={onClose} className="p-2 bg-slate-100/50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-slate-400">
            <X size={18} />
          </button>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-white/60 uppercase tracking-widest mb-1 block">Crop Name *</label>
              <Input required placeholder="E.g., Organic Wheat" value={demandForm.crop} onChange={e => setDemandForm({...demandForm, crop: e.target.value})} className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 rounded-xl text-slate-900 dark:text-white font-bold" />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-500 dark:text-white/60 uppercase tracking-widest mb-1 block">Quantity (kg) *</label>
                <Input required type="number" placeholder="500" value={demandForm.quantity} onChange={e => setDemandForm({...demandForm, quantity: e.target.value})} className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 rounded-xl text-slate-900 dark:text-white font-bold" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-500 dark:text-white/60 uppercase tracking-widest mb-1 block">Budget ($/kg) *</label>
                <Input required type="number" step="0.01" placeholder="2.50" value={demandForm.price} onChange={e => setDemandForm({...demandForm, price: e.target.value})} className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 rounded-xl text-slate-900 dark:text-white font-bold" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-white/60 uppercase tracking-widest mb-1 block">Location / Delivery Area</label>
              <Input placeholder="E.g., Texas, USA" value={demandForm.location} onChange={e => setDemandForm({...demandForm, location: e.target.value})} className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 rounded-xl text-slate-900 dark:text-white font-bold" />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-white/60 uppercase tracking-widest mb-1 block">Additional Notes</label>
              <Input placeholder="Any specific requirements..." value={demandForm.notes} onChange={e => setDemandForm({...demandForm, notes: e.target.value})} className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 rounded-xl text-slate-900 dark:text-white font-bold" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10 mt-6 !mb-2">
              <Button type="button" variant="outline" onClick={onClose} className="border-slate-200 dark:border-white/10 dark:text-white font-bold h-12 px-6 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5">Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest h-12 px-8 rounded-xl shadow-lg shadow-blue-600/20">Submit Demand</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
