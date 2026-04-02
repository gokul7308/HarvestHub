import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Search, Building2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const initialMerchants = [
  { id: "M-2001", name: "Global Agri Co", location: "New York, USA", orders: 142, status: "Active" },
  { id: "M-2002", name: "Fresh Foods Ltd", location: "Chicago, USA", orders: 86, status: "Active" },
  { id: "M-2003", name: "Grain Traders Inc", location: "Kansas, USA", orders: 310, status: "Pending" },
  { id: "M-2004", name: "Local Organics", location: "Austin, USA", orders: 12, status: "Suspended" },
]

export default function MerchantsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const filteredMerchants = useMemo(() => {
    return initialMerchants.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans selection:bg-blue-600/10 selection:text-blue-600 dark:text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 dark:border-white/10 pb-6 sticky top-20 z-10 bg-slate-50/80 dark:bg-[#020617]/80 backdrop-blur-xl -mx-4 px-4 pt-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 mt-1 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:scale-105 hover:shadow-md transition-all text-slate-500 dark:text-white shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-extrabold font-poppins text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              All Merchants <Building2 size={32} className="text-blue-600" />
            </h1>
            <p className="text-slate-500 dark:text-white/60 mt-1 font-medium">Directory of registered commercial buyers.</p>
          </div>
        </div>
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            type="text"
            placeholder="Search merchants by company name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 pr-4 py-6 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 dark:text-slate-100 dark:placeholder-slate-500 shadow-sm"
          />
        </div>
      </div>

      <Card className="rounded-[32px] overflow-hidden border-2 border-slate-100 dark:border-white/10 shadow-[0_10px_50px_rgb(0,0,0,0.04)] bg-white dark:bg-white/5 dark:backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black text-slate-400 dark:text-white/60 uppercase tracking-widest bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="px-8 py-6">ID</th>
                <th className="px-8 py-6">Company Name</th>
                <th className="px-8 py-6">Location</th>
                <th className="px-8 py-6 text-center">Total Orders</th>
                <th className="px-8 py-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {filteredMerchants.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-all group">
                   <td className="px-8 py-5">
                     <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/80 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-md">{m.id}</span>
                   </td>
                   <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={`https://i.pravatar.cc/150?u=${m.id}`} className="w-10 h-10 rounded-xl shadow-sm" alt="company logo" />
                        <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{m.name}</span>
                      </div>
                   </td>
                   <td className="px-8 py-5 text-slate-600 dark:text-white/80 font-medium">
                     {m.location}
                   </td>
                   <td className="px-8 py-5 text-slate-600 dark:text-white/80 font-black text-center font-poppins text-lg text-slate-900 dark:text-white">
                     {m.orders}
                   </td>
                   <td className="px-8 py-5 text-right">
                     <Badge className={`font-black text-[9px] uppercase tracking-widest px-2.5 py-1 border-none shadow-sm ${
                        m.status === 'Active' ? 'bg-[#F0FDF4] text-[#1B5E20] dark:bg-green-500/20 dark:text-green-400' : 
                        m.status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                        'bg-red-50 text-red-500 dark:bg-red-500/20 dark:text-red-400'
                      }`}>{m.status}</Badge>
                   </td>
                </tr>
              ))}
              {filteredMerchants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-500 dark:text-white/60 font-medium">
                    No merchants matched your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
