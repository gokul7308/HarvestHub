import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemand } from '@/context/DemandContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Target, MapPin, Calendar } from 'lucide-react';

export default function MerchantDemandsPage() {
  const { demands } = useDemand();
  const [search, setSearch] = useState('');

  const filteredDemands = useMemo(() => {
    return demands.filter(d => 
      d.crop.toLowerCase().includes(search.toLowerCase()) || 
      (d.location && d.location.toLowerCase().includes(search.toLowerCase()))
    );
  }, [demands, search]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans selection:bg-blue-600/10 selection:text-blue-600">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold font-poppins text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            My Posted Demands <Target size={32} className="text-blue-600" />
          </h1>
          <p className="text-slate-500 dark:text-white/60 mt-1 font-medium">Manage your active sourcing requirements.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-2xl p-4 flex items-center shadow-sm">
        <Search className="text-slate-400 ml-4 hidden sm:block" size={20} />
        <Input 
          placeholder="Filter demands by crop name or location..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-none bg-transparent shadow-none focus:ring-0 text-base font-bold dark:text-white placeholder:text-slate-400 h-10 w-full"
        />
      </div>

      {filteredDemands.length === 0 ? (
        <Card className="rounded-[32px] border-dashed border-2 border-slate-200 dark:border-white/10 shadow-none bg-transparent">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <Target size={48} className="text-slate-300 dark:text-white/20 mb-4" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">No demands posted yet</h3>
            <p className="text-slate-500 dark:text-white/60 mt-2 font-medium max-w-md">You haven't broadcasted any crop requirements matching this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDemands.map((demand) => (
            <Card key={demand.id} className="rounded-[24px] border-2 border-slate-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#07122a]">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{demand.crop}</h3>
                      <Badge className={`font-black text-[9px] uppercase tracking-widest px-2.5 py-1 border-none shadow-none ${
                        demand.status === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-white/60'
                      }`}>
                        {demand.status === 'open' ? 'Active' : demand.status}
                      </Badge>
                    </div>
                    {demand.notes && <p className="text-sm font-medium text-slate-500 dark:text-white/60 line-clamp-1">{demand.notes}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full md:w-auto mt-4 md:mt-0">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity</div>
                      <div className="font-bold text-slate-900 dark:text-white">{demand.quantity} kg</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Budget</div>
                      <div className="font-bold text-blue-600">${demand.price}/kg</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 items-center flex gap-1"><MapPin size={10} /> Location</div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm truncate w-24" title={demand.location}>{demand.location || 'Any'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 items-center flex gap-1"><Calendar size={10} /> Posted</div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{new Date(demand.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
