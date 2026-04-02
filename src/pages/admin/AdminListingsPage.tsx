import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Search, List } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const initialListings = [
  { id: "L-3001", cropName: "Organic Wheat", farmerName: "Alex Johnson", price: "$2.50", quantity: "500 kg", status: "Active" },
  { id: "L-3002", cropName: "Fresh Tomatoes", farmerName: "Maria Garcia", price: "$3.00", quantity: "200 kg", status: "Active" },
  { id: "L-3003", cropName: "Soybeans", farmerName: "John Doe", price: "$1.20", quantity: "1000 kg", status: "Sold" },
  { id: "L-3004", cropName: "Premium Coffee Beans", farmerName: "Luis Silva", price: "$15.00", quantity: "150 kg", status: "Pending" },
]

export default function AdminListingsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const filteredListings = useMemo(() => {
    return initialListings.filter(l => 
      l.cropName.toLowerCase().includes(search.toLowerCase()) || 
      l.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans selection:bg-amber-600/10 selection:text-amber-600 dark:text-slate-100">
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
              Platform Listings <List size={32} className="text-amber-600" />
            </h1>
            <p className="text-slate-500 dark:text-white/60 mt-1 font-medium">Global view of active agricultural listings.</p>
          </div>
        </div>
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            type="text"
            placeholder="Search listings by crop or farmer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 pr-4 py-6 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium text-slate-900 dark:text-slate-100 dark:placeholder-slate-500 shadow-sm"
          />
        </div>
      </div>

      <Card className="rounded-[32px] overflow-hidden border-2 border-slate-100 dark:border-white/10 shadow-[0_10px_50px_rgb(0,0,0,0.04)] bg-white dark:bg-white/5 dark:backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black text-slate-400 dark:text-white/60 uppercase tracking-widest bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="px-8 py-6">ID</th>
                <th className="px-8 py-6">Crop Name</th>
                <th className="px-8 py-6">Farmer</th>
                <th className="px-8 py-6">Quantity</th>
                <th className="px-8 py-6">Price Unit</th>
                <th className="px-8 py-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {filteredListings.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-all group">
                   <td className="px-8 py-5">
                     <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/80 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-md">{l.id}</span>
                   </td>
                   <td className="px-8 py-5 font-black text-slate-900 dark:text-white tracking-tight">
                      {l.cropName}
                   </td>
                   <td className="px-8 py-5 text-slate-600 dark:text-white/80 font-medium flex items-center gap-3">
                     <img src={`https://i.pravatar.cc/150?u=${l.farmerName}`} className="w-8 h-8 rounded-lg shadow-sm" alt="farmer" />
                     {l.farmerName}
                   </td>
                   <td className="px-8 py-5 text-slate-600 dark:text-white/80 font-black">
                     {l.quantity}
                   </td>
                   <td className="px-8 py-5 text-emerald-600 dark:text-green-400 font-extrabold text-lg flex items-center">
                     {l.price}
                   </td>
                   <td className="px-8 py-5 text-right">
                     <Badge className={`font-black text-[9px] uppercase tracking-widest px-2.5 py-1 border-none shadow-sm ${
                        l.status === 'Active' ? 'bg-[#F0FDF4] text-[#1B5E20] dark:bg-green-500/20 dark:text-green-400' : 
                        l.status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                        'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-white/60'
                      }`}>{l.status}</Badge>
                   </td>
                </tr>
              ))}
              {filteredListings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-500 dark:text-white/60 font-medium">
                    No listings matched your search.
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
