import React, { useState } from "react"
import { useUser } from "@/context/UserContext"
import { useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { adminData } from "@/data/mock"
import { Users, Building2, List, DollarSign, ShieldCheck, CheckCircle2, XCircle, Search, Activity, ArrowUpRight, ArrowLeft } from "lucide-react"

export default function SystemSettings() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [pendings, setPendings] = useState([
    { id: 1, name: "Arjun Reddy", role: "Farmer", status: "Pending", avatar: "https://i.pravatar.cc/80?u=a1" },
    { id: 2, name: "Global Agri Co", role: "Merchant", status: "Pending", avatar: "https://i.pravatar.cc/80?u=a2" }
  ])

  const handleApprove = (id: number) => {
    setPendings(prev => prev.filter(p => p.id !== id))
    import('sonner').then(({ toast }) => toast.success("User Approved Successfully"))
  }

  const handleReject = (id: number) => {
    setPendings(prev => prev.filter(p => p.id !== id))
    import('sonner').then(({ toast }) => toast.info("User Application Rejected"))
  }

  const stats = [
    { title: "Total Farmers", value: adminData.totalFarmers, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50 text-emerald-600", trend: "+12.4%", href: "/admin/farmers" },
    { title: "Total Merchants", value: adminData.totalMerchants, icon: Building2, color: "text-blue-600", bg: "bg-blue-50 text-blue-600", trend: "+8.1%", href: "/admin/merchants" },
    { title: "Active Listings", value: adminData.activeListings, icon: List, color: "text-amber-600", bg: "bg-amber-50 text-amber-600", trend: "+24.5%", href: "/admin/listings" },
    { title: "Platform Revenue", value: adminData.revenue, icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50 text-purple-600", trend: "+18.2%", href: "/admin/revenue" },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans selection:bg-purple-600/10 selection:text-purple-600 dark:text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 dark:border-white/10 pb-6">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 mt-1 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:scale-105 hover:shadow-md transition-all text-slate-500 dark:text-white shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-extrabold font-poppins text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              System Settings <ShieldCheck size={32} className="text-purple-600" />
            </h1>
            <p className="text-slate-500 dark:text-white/60 mt-1 font-medium">Detailed administrative controls and platform oversight.</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <Card key={i} onClick={() => navigate(stat.href)} className="group cursor-pointer hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all dark:hover:border-purple-500/30">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${stat.bg} transition-transform group-hover:scale-110`}>
                  <stat.icon size={24} />
                </div>
                <Badge className="bg-purple-50 text-purple-600 border-0 font-black text-[10px] truncate max-w-[60px] dark:bg-purple-500/20 dark:text-purple-400">{stat.trend}</Badge>
              </div>
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.title}</h3>
              <p className="text-4xl font-black mt-2 text-slate-900 font-poppins tracking-tighter dark:text-white">{stat.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* SECTION 2: PENDING APPROVALS */}
        <Card className="lg:col-span-2">
           <CardHeader className="p-8 border-b border-slate-50 dark:border-white/10">
             <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
               <Users size={20} className="text-purple-600" /> Pending KYC Approvals
             </CardTitle>
           </CardHeader>
           <CardContent className="p-8 space-y-4">
              {pendings.length > 0 ? pendings.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-4 rounded-3xl border border-transparent hover:border-purple-200 dark:hover:border-purple-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-white/60 uppercase tracking-widest">{p.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleApprove(p.id)} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold border-none shadow-none rounded-xl dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30">
                       Approve
                    </Button>
                    <Button size="sm" onClick={() => handleReject(p.id)} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold border-none shadow-none rounded-xl dark:bg-red-500/20 dark:hover:bg-red-500/30">
                       Reject
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400 dark:text-white/60 font-medium">No pending approvals!</div>
              )}
           </CardContent>
        </Card>

        {/* SECTION 3: SYSTEM INSIGHTS */}
        <Card>
           <CardHeader className="p-8 border-b border-slate-50 dark:border-white/10">
             <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
               <Activity size={20} className="text-purple-600" /> System Insights
             </CardTitle>
           </CardHeader>
           <CardContent className="p-8 space-y-6">
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/60">New Users This Week</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-poppins text-slate-900 dark:text-white">842</span>
                  <span className="text-xs font-bold text-emerald-500 flex items-center"><ArrowUpRight size={14}/> 4.2%</span>
               </div>
             </div>
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/60">Active Transactions</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-poppins text-slate-900 dark:text-white">1,204</span>
                  <span className="text-xs font-bold text-emerald-500 flex items-center"><ArrowUpRight size={14}/> 12.1%</span>
               </div>
             </div>
             <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-white/10">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/60">Platform Growth YoY</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black font-poppins text-purple-600">32.8%</span>
               </div>
             </div>
           </CardContent>
        </Card>
      </div>

      {/* SECTION 4: TABLE VIEW */}
      <h2 className="text-2xl font-black font-poppins text-slate-900 dark:text-white tracking-tight pt-4">User Registry</h2>
      <Card className="rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black text-slate-400 dark:text-white/60 uppercase tracking-widest bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="px-8 py-6">User Name</th>
                <th className="px-8 py-6">Role</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Date Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {adminData.users.map((u, i) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={`https://i.pravatar.cc/150?u=${u.id}`} className="w-10 h-10 rounded-xl shadow-sm" alt="avatar" />
                      <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/80 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-md">{u.role}</span>
                  </td>
                  <td className="px-8 py-5">
                    <Badge className={`font-black text-[9px] uppercase tracking-widest px-2.5 py-1 border-none shadow-sm ${
                      u.status === 'Active' ? 'bg-[#F0FDF4] text-[#1B5E20] dark:bg-green-500/20 dark:text-green-400' : 'bg-red-50 text-red-500 dark:bg-red-500/20 dark:text-red-400'
                    }`}>{u.status}</Badge>
                  </td>
                  <td className="px-8 py-5 text-slate-500 dark:text-white/60 font-bold text-xs uppercase tracking-wider">
                     {new Date(Date.now() - i * 86400000 * 3).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
