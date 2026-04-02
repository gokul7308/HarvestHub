import React, { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { Download, CalendarDays, TrendingUp, TrendingDown, Target } from "lucide-react"
import { useTranslation } from "react-i18next"

const fullYearData = [
  { name: 'Jan', wheat: 400, corn: 240, soy: 240 },
  { name: 'Feb', wheat: 300, corn: 139, soy: 221 },
  { name: 'Mar', wheat: 550, corn: 380, soy: 229 },
  { name: 'Apr', wheat: 450, corn: 308, soy: 200 },
  { name: 'May', wheat: 600, corn: 480, soy: 218 },
  { name: 'Jun', wheat: 700, corn: 580, soy: 250 },
  { name: 'Jul', wheat: 650, corn: 540, soy: 310 },
  { name: 'Aug', wheat: 660, corn: 550, soy: 320 },
  { name: 'Sep', wheat: 680, corn: 560, soy: 300 },
  { name: 'Oct', wheat: 690, corn: 580, soy: 310 },
  { name: 'Nov', wheat: 710, corn: 590, soy: 330 },
  { name: 'Dec', wheat: 730, corn: 610, soy: 350 },
]

const regionalData = [
  { name: 'North America', value: 400, color: '#1B5E20' },
  { name: 'South America', value: 300, color: '#00E676' },
  { name: 'Europe', value: 300, color: '#2563eb' },
  { name: 'Asia Pacific', value: 200, color: '#eab308' },
]

export default function AnalyticsPage() {
  const { t } = useTranslation()

  const [range, setRange] = useState("6m")
  const [currency, setCurrency] = useState("$ / kg")

  const filteredData = useMemo(() => {
    switch (range) {
      case "3m": return fullYearData.slice(-3);
      case "6m": return fullYearData.slice(-6);
      case "1y": return fullYearData;
      default: return fullYearData.slice(-6);
    }
  }, [range])

  const formatPrice = (pricePerTon: number) => {
    const perKg = pricePerTon / 1000;
    if (currency === "₹ / kg") {
      return `₹${(perKg * 83).toFixed(2)}`;
    }
    return `$${perKg.toFixed(2)}`;
  }

  const formatCurrencyRaw = (pricePerTon: number) => {
    const perKg = pricePerTon / 1000;
    return currency === "₹ / kg" ? `₹${(perKg * 83).toFixed(2)}` : `$${perKg.toFixed(2)}`;
  }

  const formatTooltip = (value: any, name: any) => {
     return [`${formatCurrencyRaw(value)} per kg`, name.charAt(0).toUpperCase() + name.slice(1)]
  }

  const kpis = [
    { title: t("analytics.avgWheatPrice") + " (per kg)", current: formatPrice(450), prior: formatPrice(420), rawCurrent: 450, rawPrior: 420, trend: "up" },
    { title: t("analytics.avgCornPrice") + " (per kg)", current: formatPrice(310), prior: formatPrice(325), rawCurrent: 310, rawPrior: 325, trend: "down" },
    { title: t("analytics.globalDemandIndex"), current: "84.5", prior: "81.2", rawCurrent: 84.5, rawPrior: 81.2, trend: "up" },
    { title: t("analytics.logisticsCostIndex"), current: "112.4", prior: "115.1", rawCurrent: 112.4, rawPrior: 115.1, trend: "down" },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans selection:bg-[#1B5E20]/30 selection:text-[#1B5E20]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold font-poppins text-slate-900 tracking-tight">{t("analytics.advancedAnalytics")} 📊</h1>
          <p className="text-slate-500 mt-1 font-medium">{t("analytics.deepDive")}</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            className="h-14 rounded-2xl border-2 border-slate-100 bg-white text-slate-500 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 transition-all outline-none"
          >
            <option value="$ / kg">$ / kg</option>
            <option value="₹ / kg">₹ / kg</option>
          </select>
          <select 
            value={range} 
            onChange={(e) => setRange(e.target.value)}
            className="h-14 rounded-2xl border-2 border-slate-100 bg-white text-slate-500 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 transition-all outline-none"
          >
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">1 Year</option>
          </select>
          <Button className="h-14 bg-[#1B5E20] hover:bg-[#144917] rounded-2xl shadow-xl shadow-[#1B5E20]/20 text-white font-black text-[10px] uppercase tracking-widest px-8 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            <Download size={16} /> {t("analytics.exportCsv")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((kpi, i) => (
          <Card key={i} className="rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all bg-white group border-2">
            <CardContent className="p-8">
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{kpi.title}</h3>
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-black text-slate-900 font-poppins tracking-tighter">{kpi.current}</p>
                <div className={`flex items-center text-[10px] font-black uppercase tracking-widest ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {kpi.trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                  {Math.abs(Math.round((kpi.rawCurrent - kpi.rawPrior) / kpi.rawPrior * 100))}%
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-4 flex justify-between border-t border-slate-50 pt-4">
                <span>{t("analytics.vsLastPeriod")}</span>
                <span className="text-slate-400">{kpi.prior}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Area Chart */}
        <Card className="lg:col-span-2 rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] bg-white border-2">
          <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-slate-50">
            <div>
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-none">{t("analytics.cropPriceTrends")}</CardTitle>
              <p className="text-sm text-slate-400 mt-2 font-medium">{t("analytics.multiCommodityComp")}</p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-[#1B5E20]/5 text-[#1B5E20] border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5">{t("crops.wheat")}</Badge>
              <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5">{t("crops.corn")}</Badge>
              <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5">{t("crops.soy")}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Price per kilogram</p>
            <div style={{ height: "300px", width: "100%" }} className="mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWheat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1B5E20" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCorn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSoy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={formatCurrencyRaw} width={60} />
                  <Tooltip 
                    formatter={formatTooltip}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                    itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                    labelStyle={{ fontWeight: '900', color: '#94a3b8', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                  <Area type="monotone" dataKey="wheat" stroke="#1B5E20" strokeWidth={4} fillOpacity={1} fill="url(#colorWheat)" />
                  <Area type="monotone" dataKey="corn" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorCorn)" />
                  <Area type="monotone" dataKey="soy" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorSoy)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Regional Demand Pie */}
        <Card className="rounded-[32px] border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] bg-white border-2 flex flex-col h-full">
          <CardHeader className="p-8 border-b border-slate-50 shrink-0">
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-none">{t("analytics.regionalTradeVolume")}</CardTitle>
            <p className="text-sm text-slate-400 mt-2 font-medium">{t("analytics.continentalPlatformActivity")}</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
            <div style={{ height: "300px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={130}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {regionalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                   itemStyle={{ fontWeight: '900', color: '#1E293B', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
          <div className="grid grid-cols-2 gap-4 p-8 pt-0 mt-auto">
            {regionalData.map((region, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: region.color }}></div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{region.name}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Market Forecast Box */}
      <div className="bg-slate-900 rounded-[48px] p-12 relative overflow-hidden shadow-2xl group border-4 border-slate-800/50">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200')] bg-cover opacity-10 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E676]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12 text-white text-center xl:text-left">
          <div className="max-w-3xl">
            <div className="flex items-center justify-center xl:justify-start gap-3 text-[#00E676] mb-6">
              <Target size={24} /> <span className="font-black tracking-[0.3em] uppercase text-xs">{t("analytics.quarterOutlook")}</span>
            </div>
            <h3 className="text-4xl font-black font-poppins mb-6 leading-tight tracking-tight">{t("analytics.shortageExpectedText")}</h3>
            <p className="text-slate-400 text-xl font-medium max-w-xl">{t("analytics.surplusHedgeText")}</p>
          </div>
          <div className="shrink-0">
             <Button className="h-20 px-12 bg-[#00E676] hover:bg-[#00C853] text-[#1B5E20] font-black text-xs uppercase tracking-widest rounded-3xl shadow-2xl shadow-[#00E676]/20 transition-all hover:scale-105 active:scale-95">
                {t("analytics.executeStrategy")}
             </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
