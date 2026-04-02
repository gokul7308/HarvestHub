import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useUser } from "@/context/UserContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { adminData } from "@/data/mock"
import { Users, Building2, List, DollarSign, Activity, AlertTriangle, CheckCircle2, MoreVertical, XCircle, ShieldCheck } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTranslation } from "react-i18next"

const growthData = [
  { name: 'Jan', users: 12000, tx: 400000 },
  { name: 'Feb', users: 13500, tx: 550000 },
  { name: 'Mar', users: 15200, tx: 800000 },
  { name: 'Apr', users: 16400, tx: 1100000 },
  { name: 'May', users: 17800, tx: 1200000 },
]

export default function AdminDashboard() {
  const { user } = useUser()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleExport = () => {
    const data = [
      { name: "Farmers", value: adminData.totalFarmers },
      { name: "Merchants", value: adminData.totalMerchants },
      { name: "Listings", value: adminData.activeListings },
      { name: "Revenue", value: adminData.revenue }
    ];
    const csvContent = "data:text/csv;charset=utf-8," + data.map(e => `${e.name},${e.value}`).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "cropdeck_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    import('sonner').then(({ toast }) => toast.success("Report downloaded"));
  }

  const stats = [
    { title: t("admin.totalFarmers"), value: adminData.totalFarmers, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12%" },
    { title: t("admin.totalMerchants"), value: adminData.totalMerchants, icon: Building2, color: "text-blue-600", bg: "bg-blue-50", trend: "+8%" },
    { title: t("admin.activeListings"), value: adminData.activeListings, icon: List, color: "text-amber-600", bg: "bg-amber-50", trend: "+24%" },
    { title: t("admin.platformRevenue"), value: adminData.revenue, icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50", trend: "+18%" },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans selection:bg-purple-600/10 selection:text-purple-600">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold font-poppins text-slate-900 tracking-tight flex items-center gap-3">
            {t("admin.systemOverseer")} <ShieldCheck size={32} className="text-purple-600" />
          </h1>
          <p className="text-slate-500 mt-1 font-medium">{t("admin.platformActivity")}</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleExport} variant="outline" className="h-14 rounded-2xl border-2 border-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 text-slate-500 font-black text-[10px] uppercase tracking-widest px-8 hover:bg-slate-50 transition-all">
            {t("admin.exportReport")}
          </Button>
          <Button onClick={() => navigate('/admin/system-settings')} className="h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-xl shadow-purple-600/20 font-black text-[10px] uppercase tracking-widest px-8 transition-all hover:scale-105 active:scale-95">
            {t("admin.systemSettings")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all bg-white group border-2 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                  <stat.icon size={24} />
                </div>
                <Badge className="bg-[#00E676]/10 text-[#1B5E20] border-0 font-black text-[10px] truncate max-w-[60px]">{stat.trend}</Badge>
              </div>
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.title}</h3>
              <p className="text-4xl font-black mt-2 text-slate-900 font-poppins tracking-tighter">{stat.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] bg-white border-2">
          <CardHeader className="p-8 border-b border-slate-50">
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-none">{t("admin.ecosystemGrowth")}</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                    itemStyle={{ color: '#8b5cf6', fontWeight: '900', fontSize: '12px' }}
                    labelStyle={{ fontWeight: '900', color: '#94a3b8', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                  <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={4} dot={{r: 6, strokeWidth: 3, fill: '#fff'}} activeDot={{r: 8, strokeWidth: 0, fill: '#8b5cf6'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Action Panel */}
        <div className="space-y-8">
          <Card className="rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] bg-white border-2">
            <CardHeader className="p-8 border-b border-slate-50 overflow-hidden">
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-3">
                <Activity size={22} className="text-purple-600" /> {t("admin.pendingApprovals")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border-2 border-transparent hover:border-slate-100 hover:bg-white transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0 object-cover overflow-hidden">
                       <img src={`https://i.pravatar.cc/80?u=admin_task_${i}`} alt="avatar" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{t(`admin.${i % 2 === 0 ? 'merchant' : 'farmer'}Kyc`)}</p>
                      <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest mt-0.5">{t("admin.awaitingVerification")}</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-10 w-10 text-purple-600 hover:bg-purple-50 shrink-0 transition-colors">
                    <CheckCircle2 size={18} />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[40px] border-amber-200/50 bg-amber-50/20 border-2 overflow-hidden">
            <CardHeader className="p-6 border-b border-amber-100">
              <CardTitle className="text-sm font-black text-amber-900 flex items-center gap-3 uppercase tracking-widest overflow-hidden">
                <AlertTriangle size={20} className="text-amber-500" /> {t("admin.systemAlerts")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
               <div className="text-xs font-bold text-amber-800/80 bg-white p-5 rounded-3xl shadow-sm border-2 border-amber-100/50 leading-relaxed">
                 {t("admin.latencyAlertText")}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Table */}
      <div className="pt-10">
        <h2 className="text-2xl font-black font-poppins text-slate-900 tracking-tight mb-8">{t("admin.userManagement")}</h2>
        <Card className="rounded-[40px] border-slate-100 border-2 shadow-[0_10px_50px_rgb(0,0,0,0.04)] overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-6">{t("admin.userDetails")}</th>
                  <th className="px-8 py-6">{t("admin.role")}</th>
                  <th className="px-8 py-6">{t("admin.status")}</th>
                  <th className="px-8 py-6 font-center">{t("admin.verification")}</th>
                  <th className="px-8 py-6 text-right">{t("admin.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {adminData.users.map((u, i) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={`https://i.pravatar.cc/150?u=${u.id}`} className="w-10 h-10 rounded-xl shadow-md" alt="avatar" />
                        <span className="text-sm font-black text-slate-900 tracking-tight">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{u.role}</span>
                    </td>
                    <td className="px-8 py-5">
                      <Badge className={`font-black text-[9px] uppercase tracking-widest px-2.5 py-1 border-none shadow-sm ${
                        u.status === 'Active' ? 'bg-[#F0FDF4] text-[#1B5E20]' : 'bg-red-50 text-red-500'
                      }`}>{u.status}</Badge>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center w-fit">
                        {u.verified ? <CheckCircle2 size={20} className="text-[#00E676]" /> : <XCircle size={20} className="text-slate-200" />}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm"><MoreVertical size={18} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
