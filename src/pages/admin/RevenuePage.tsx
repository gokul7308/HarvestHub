import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Search, DollarSign, Download, Filter } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const initialTransactions = [
  { id: "TX-901", amount: "$12,450.00", fee: "$249.00", entities: "Global Agri Co -> Alex Johnson", date: "2023-10-24", status: "Completed" },
  { id: "TX-902", amount: "$4,200.00", fee: "$84.00", entities: "Fresh Foods Ltd -> Maria Garcia", date: "2023-10-24", status: "Completed" },
  { id: "TX-903", amount: "$845.00", fee: "$16.90", entities: "Grain Traders Inc -> John Doe", date: "2023-10-25", status: "Processing" },
  { id: "TX-904", amount: "$3,100.00", fee: "$62.00", entities: "Local Organics -> Robert Smith", date: "2023-10-25", status: "Completed" },
]

export default function RevenuePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const filteredTxs = initialTransactions.filter(t => 
    t.id.toLowerCase().includes(search.toLowerCase()) || 
    t.entities.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans selection:bg-purple-600/10 selection:text-purple-600 dark:text-slate-100">
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
              Platform Revenue <DollarSign size={32} className="text-purple-600" />
            </h1>
            <p className="text-slate-500 dark:text-white/60 mt-1 font-medium">Financial tracking and transaction mapping.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="bg-purple-600 text-white border-0 shadow-2xl relative overflow-hidden rounded-[32px]">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
           <CardContent className="p-10 relative z-10 flex flex-col justify-center h-full">
             <h3 className="text-white/80 text-xs font-black uppercase tracking-[0.2em] mb-2">Total Platform Revenue</h3>
             <p className="text-6xl font-black font-poppins tracking-tighter">$1.2M <span className="text-base text-purple-200 tracking-normal font-sans uppercase">YTD</span></p>
           </CardContent>
         </Card>
         <Card className="rounded-[32px] border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-white/5">
           <CardContent className="p-10 flex flex-col justify-center h-full space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/10">
                 <span className="text-sm font-bold text-slate-500 dark:text-white/60 uppercase tracking-widest">Platform Fee</span>
                 <span className="text-2xl font-black text-slate-900 dark:text-white">2.0%</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/10">
                 <span className="text-sm font-bold text-slate-500 dark:text-white/60 uppercase tracking-widest">Volume (30d)</span>
                 <span className="text-2xl font-black text-slate-900 dark:text-white">$345,600</span>
              </div>
           </CardContent>
         </Card>
      </div>

      <Card className="rounded-[32px] overflow-hidden border-2 border-slate-100 dark:border-white/10 shadow-[0_10px_50px_rgb(0,0,0,0.04)] bg-white dark:bg-white/5 dark:backdrop-blur-xl">
        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-white/5">
           <div className="relative w-full md:w-96">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
             <Input 
               type="text"
               placeholder="Search by TX ID or Entities..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="pl-11 pr-4 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
             />
           </div>
           <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"><Filter size={16} className="mr-2"/> Filter</Button>
              <Button variant="outline" className="flex-1 md:flex-none border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"><Download size={16} className="mr-2"/> CSV</Button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black text-slate-400 dark:text-white/60 uppercase tracking-widest bg-slate-50/50 dark:bg-transparent border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="px-8 py-6">TX ID</th>
                <th className="px-8 py-6">Entities</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6 text-purple-600 dark:text-purple-400">Captured Fee</th>
                <th className="px-8 py-6">Date</th>
                <th className="px-8 py-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {filteredTxs.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-all group">
                   <td className="px-8 py-5">
                     <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/80 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-md">{t.id}</span>
                   </td>
                   <td className="px-8 py-5 font-bold text-slate-900 dark:text-white text-xs tracking-tight">
                      {t.entities}
                   </td>
                   <td className="px-8 py-5 text-slate-900 dark:text-white font-black text-lg">
                     {t.amount}
                   </td>
                   <td className="px-8 py-5 text-purple-600 dark:text-purple-400 font-extrabold text-base">
                     {t.fee}
                   </td>
                   <td className="px-8 py-5 text-slate-500 dark:text-white/60 font-bold text-xs uppercase tracking-wider">
                     {t.date}
                   </td>
                   <td className="px-8 py-5 text-right">
                     <Badge className={`font-black text-[9px] uppercase tracking-widest px-2.5 py-1 border-none shadow-sm ${
                        t.status === 'Completed' ? 'bg-[#F0FDF4] text-[#1B5E20] dark:bg-green-500/20 dark:text-green-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>{t.status}</Badge>
                   </td>
                </tr>
              ))}
              {filteredTxs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-500 dark:text-white/60 font-medium">
                    No transactions matched your search.
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
