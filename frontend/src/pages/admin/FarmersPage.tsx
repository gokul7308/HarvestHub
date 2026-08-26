import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Search, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const initialFarmers = [
  { id: "F-1001", name: "Alex Johnson", location: "California, USA", crops: "Wheat, Corn", status: "Active", joined: "2023-01-15" },
  { id: "F-1002", name: "Maria Garcia", location: "Texas, USA", crops: "Tomatoes, Peppers", status: "Active", joined: "2023-03-22" },
  { id: "F-1003", name: "John Doe", location: "Iowa, USA", crops: "Soybeans", status: "Pending", joined: "2023-08-10" },
  { id: "F-1004", name: "Robert Smith", location: "Illinois, USA", crops: "Corn, Wheat", status: "Active", joined: "2022-11-05" },
  { id: "F-1005", name: "Li Wei", location: "Washington, USA", crops: "Apples", status: "Suspended", joined: "2023-05-18" },
]

export default function FarmersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const filteredFarmers = useMemo(() => {
    return initialFarmers.filter(f => 
      f.name.toLowerCase().includes(search.toLowerCase()) || 
      f.id.toLowerCase().includes(search.toLowerCase()) ||
      f.location.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans selection:bg-emerald-600/10 selection:text-emerald-600 dark:text-slate-100">
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
              All Farmers <Users size={32} className="text-emerald-600" />
            </h1>
            <p className="text-slate-500 dark:text-white/60 mt-1 font-medium">Directory of registered agricultural producers.</p>
          </div>
        </div>
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            type="text"
            placeholder="Search farmers by name, ID, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 pr-4 py-6 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-slate-900 dark:text-slate-100 dark:placeholder-slate-500 shadow-sm"
          />
        </div>
      </div>

      <Card className="rounded-[32px] overflow-hidden border-2 border-slate-100 dark:border-white/10 shadow-[0_10px_50px_rgb(0,0,0,0.04)] bg-white dark:bg-white/5 dark:backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black text-slate-400 dark:text-white/60 uppercase tracking-widest bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="px-8 py-6">ID</th>
                <th className="px-8 py-6">Name</th>
                <th className="px-8 py-6">Location</th>
                <th className="px-8 py-6">Crops</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {filteredFarmers.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-all group">
                   <td className="px-8 py-5">
                     <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/80 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-md">{f.id}</span>
                   </td>
                   <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={`https://i.pravatar.cc/150?u=${f.id}`} className="w-10 h-10 rounded-xl shadow-sm" alt="avatar" />
                        <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{f.name}</span>
                      </div>
                   </td>
                   <td className="px-8 py-5 text-slate-600 dark:text-white/80 font-medium">
                     {f.location}
                   </td>
                   <td className="px-8 py-5 text-slate-600 dark:text-white/80 font-medium">
                     {f.crops}
                   </td>
                   <td className="px-8 py-5">
                     <Badge className={`font-black text-[9px] uppercase tracking-widest px-2.5 py-1 border-none shadow-sm ${
                        f.status === 'Active' ? 'bg-[#F0FDF4] text-[#1B5E20] dark:bg-green-500/20 dark:text-green-400' : 
                        f.status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                        'bg-red-50 text-red-500 dark:bg-red-500/20 dark:text-red-400'
                      }`}>{f.status}</Badge>
                   </td>
                   <td className="px-8 py-5 text-slate-500 dark:text-white/60 font-bold text-xs uppercase tracking-wider">
                     {f.joined}
                   </td>
                </tr>
              ))}
              {filteredFarmers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-500 dark:text-white/60 font-medium">
                    No farmers matched your search.
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
