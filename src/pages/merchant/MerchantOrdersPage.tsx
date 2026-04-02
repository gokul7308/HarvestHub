import React, { useState, useMemo } from 'react';
import { useOrders } from '@/context/OrderContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ShoppingBag } from 'lucide-react';

export default function MerchantOrdersPage() {
  const { orders } = useOrders();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'Active' | 'Completed'>('Active');

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const isTabMatch = activeTab === 'Active' ? o.status !== 'Delivered' : o.status === 'Delivered';
      const isSearchMatch = o.crop.toLowerCase().includes(search.toLowerCase()) || 
                            (o.seller_name || '').toLowerCase().includes(search.toLowerCase()) ||
                            o.id.toLowerCase().includes(search.toLowerCase());
      return isTabMatch && isSearchMatch;
    });
  }, [orders, search, activeTab]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans selection:bg-blue-600/10 selection:text-blue-600">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold font-poppins text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Active Orders <ShoppingBag size={32} className="text-blue-600" />
          </h1>
          <p className="text-slate-500 dark:text-white/60 mt-1 font-medium">Track your sourcing shipments and procurements.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-2xl p-4 flex items-center shadow-sm">
        <Search className="text-slate-400 ml-4 hidden sm:block" size={20} />
        <Input 
          placeholder="Filter orders by crop, ID, or seller name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-none bg-transparent shadow-none focus:ring-0 text-base font-bold dark:text-white placeholder:text-slate-400 h-10 w-full"
        />
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('Active')}
          className={`px-6 py-2.5 rounded-xl text-sm font-black tracking-widest uppercase transition-all ${activeTab === 'Active' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
           Active Orders
        </button>
        <button 
          onClick={() => setActiveTab('Completed')}
          className={`px-6 py-2.5 rounded-xl text-sm font-black tracking-widest uppercase transition-all ${activeTab === 'Completed' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
           Completed
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="rounded-[32px] border-dashed border-2 border-slate-200 dark:border-white/10 shadow-none bg-transparent">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <ShoppingBag size={48} className="text-slate-300 dark:text-white/20 mb-4" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">No orders found</h3>
            <p className="text-slate-500 dark:text-white/60 mt-2 font-medium max-w-md">Looks like there are no orders matching exactly this criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="rounded-[24px] border-2 border-slate-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#07122a]">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 dark:border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-4">
                     <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/80 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-md">{order.id}</span>
                     <Badge className={`font-black text-[9px] uppercase tracking-widest px-2.5 py-1 border-none shadow-none ${
                        order.status === 'In Transit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 
                        order.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 
                        'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-white/60'
                      }`}>
                        {order.status}
                      </Badge>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     Date: <span className="text-slate-900 dark:text-white font-bold ml-1">{order.date}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                   <div>
                     <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{order.crop}</h3>
                     <p className="text-sm font-medium text-slate-500 dark:text-white/60 flex items-center gap-2 mt-1">
                        Seller: <span className="font-bold text-slate-900 dark:text-white">{order.seller_name || 'Verified Seller'}</span>
                     </p>
                   </div>
                   <div className="text-right w-full sm:w-auto">
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume Quantity</div>
                     <div className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter leading-none">{order.quantity}</div>
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
