import React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, Sprout, TrendingUp, CloudRain, 
  Store, ShieldCheck, CheckCircle2,
  Users, Bot, ShoppingCart, Activity, Globe, Check, ChevronDown
} from "lucide-react"
import { useTranslation } from "react-i18next"

const fadeInUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = React.useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'Tamil' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' }
  ];

  const currentLangName = languages.find(l => l.code === i18n.language.split('-')[0])?.name || 'English';

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
    setIsLangOpen(false);
  };
  return (
    <div className="min-h-screen bg-white selection:bg-[#00E676]/30 selection:text-[#1B5E20]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 lg:px-12 h-20 transition-all">
        <div className="flex items-center gap-2">
          <div className="bg-[#1B5E20] text-white p-2 rounded-xl shadow-sm">
            <Sprout size={24} />
          </div>
          <span className="text-2xl font-bold font-poppins tracking-tight text-[#1B5E20]">HarvestHub</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-[#1B5E20] transition-colors">{t("landing.features")}</a>
          <a href="#roles" className="hover:text-[#1B5E20] transition-colors">{t("landing.roles")}</a>
          <a href="#how-it-works" className="hover:text-[#1B5E20] transition-colors">{t("landing.howItWorks")}</a>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-xl transition-all group"
            >
              <Globe size={16} className="text-slate-400 group-hover:text-[#1B5E20]" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider hidden sm:inline">{currentLangName}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl border border-slate-100 shadow-xl py-1 z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => changeLanguage(l.code)}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1B5E20] flex items-center justify-between"
                  >
                    {l.name}
                    {i18n.language.startsWith(l.code) && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link to="/auth">
            <Button variant="ghost" className="font-semibold px-0 md:px-4">{t("auth.login")}</Button>
          </Link>
          <Link to="/auth">
            <Button className="shadow-[0_8px_16px_rgba(27,94,32,0.2)] hover:shadow-[0_12px_24px_rgba(27,94,32,0.3)] bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] border-0">
              {t("landing.getStarted")} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6 lg:px-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00E676]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1B5E20]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={fadeInUp} className="mb-6 flex items-center gap-2">
                <Badge variant="success" className="px-3 py-1 text-sm bg-[#00E676]/20">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#1B5E20] animate-pulse"></span>
                    {t("landing.v2Live")}
                  </span>
                </Badge>
              </motion.div>
              <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-bold font-poppins text-slate-900 leading-[1.1] mb-6">
                {t("landing.smarterFarming")} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B5E20] to-[#00E676]">{t("landing.betterTrading")}</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                {t("landing.heroDesc")}
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4">
                <Link to="/auth">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-[#1B5E20] hover:bg-[#144917] shadow-[0_8px_20px_rgba(27,94,32,0.25)] hover:-translate-y-1 transition-transform">
                    {t("landing.startNow")}
                  </Button>
                </Link>
                <Link to="#features">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-slate-50">
                    {t("landing.explore")}
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="mt-12 flex items-center gap-6 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2"><CheckCircle2 className="text-[#00E676] w-5 h-5"/> {t("landing.freeForFarmers")}</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="text-[#00E676] w-5 h-5"/> {t("landing.secureTrading")}</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="text-[#00E676] w-5 h-5"/> {t("landing.aiPriceForecasts")}</div>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative aspect-square md:aspect-video lg:aspect-square w-full max-w-lg mx-auto lg:max-w-none xl:scale-110 xl:-translate-y-8"
            >
              {/* Premium Dashboard Mockup Float */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1B5E20]/20 to-[#00E676]/20 rounded-3xl transform rotate-3 scale-105 blur-lg mix-blend-multiply opacity-50"></div>
              <div className="relative w-full h-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl overflow-hidden p-6 ring-1 ring-black/5 flex flex-col">
                {/* Mock UI Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B5E20] to-[#00E676]"></div>
                    <div>
                      <div className="w-24 h-3 bg-gray-200 rounded-full mb-2"></div>
                      <div className="w-16 h-2 bg-gray-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                  </div>
                </div>
                {/* Mock UI Body */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] rounded-2xl p-4 shadow-lg text-white">
                    <div className="w-8 h-8 rounded-full bg-white/20 mb-4 flex items-center justify-center">
                      <TrendingUp size={16} />
                    </div>
                    <div className="text-sm font-medium opacity-80 mb-1">{t("landing.liveProfit")}</div>
                    <div className="text-2xl font-bold">$12,450.00</div>
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-[#00E676]/20 text-[#1B5E20] mb-4 flex items-center justify-center">
                      <CloudRain size={16} />
                    </div>
                    <div className="text-sm font-medium text-slate-500 mb-1">{t("dashboard.localWeather")}</div>
                    <div className="text-xl font-bold text-slate-800">72°F <span className="text-sm font-normal text-slate-400">{t("landing.rainy")}</span></div>
                  </div>
                </div>
                {/* AI Demand Mock */}
                <div className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mt-auto relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#00E676]/10 rounded-full blur-xl"></div>
                  <div className="flex items-center gap-2 mb-3">
                    <Bot size={16} className="text-[#1B5E20]" />
                    <span className="text-sm font-semibold text-slate-700">{t("landing.aiMarketInsight")}</span>
                  </div>
                  <div className="space-y-3 relative z-10 text-sm">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                       {t("landing.wheatDemandSurge")}
                    </div>
                    <Button className="w-full text-xs h-8 bg-black hover:bg-gray-800 text-white rounded-lg">{t("landing.applyStrategy")}</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12 divide-x divide-gray-100/50">
            {[
              { label: t("landing.statFarmers"), value: "12K+" },
              { label: t("landing.statMerchants"), value: "4,200" },
              { label: t("landing.statTransactions"), value: "$8.5M" },
              { label: t("landing.statAiInsights"), value: "450K+" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center px-4"
              >
                <div className="text-4xl md:text-5xl font-bold font-poppins text-[#1B5E20] tracking-tight mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-slate-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-24 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold font-poppins text-slate-900 mb-4">{t("landing.intelligentAgri")}</h2>
            <p className="text-lg text-slate-600">{t("landing.discoverPowerful")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { title: t("landing.ftAiPrice"), desc: t("landing.ftAiPriceDesc"), icon: Activity },
              { title: t("landing.ftSmartContracts"), desc: t("landing.ftSmartContractsDesc"), icon: ShieldCheck },
              { title: t("landing.ftMerchantMarket"), desc: t("landing.ftMerchantMarketDesc"), icon: Store },
              { title: t("landing.ftWeather"), desc: t("landing.ftWeatherDesc"), icon: CloudRain },
              { title: t("landing.ftDemandMatching"), desc: t("landing.ftDemandMatchingDesc"), icon: Bot },
              { title: t("landing.ftLogistics"), desc: t("landing.ftLogisticsDesc"), icon: ShoppingCart },
            ].map((ft, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-transparent hover:border-[#00E676]/30 hover:shadow-xl hover:shadow-[#00E676]/5 transition-all bg-white overflow-hidden group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] text-[#1B5E20] flex items-center justify-center mb-4 group-hover:bg-[#1B5E20] group-hover:text-white transition-colors duration-300">
                      <ft.icon size={24} />
                    </div>
                    <CardTitle className="text-xl">{ft.title}</CardTitle>
                    <p className="text-slate-500 text-sm leading-relaxed mt-2">{ft.desc}</p>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden bg-[#1B5E20]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E676]/20 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold font-poppins text-white mb-8 tracking-tight"
          >
            {t("landing.digitizeAgri")}<br/>{t("landing.withCropdeck")}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-10 font-medium"
          >
            {t("landing.joinThousands")}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/auth">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-[#1B5E20] hover:bg-gray-50 hover:scale-105 transition-transform font-bold w-full sm:w-auto">
                {t("landing.joinNowFree")}
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-green-400 text-white hover:bg-white/10 w-full sm:w-auto">
                {t("landing.requestDemo")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Sprout size={20} className="text-[#1B5E20]" />
              <span className="text-xl font-bold font-poppins tracking-tight text-[#1B5E20]">HarvestHub</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Building the operating system for global agriculture.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">{t("landing.platform")}</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link to="/auth" className="hover:text-[#1B5E20] transition-colors">{t("landing.farmerDashboard")}</Link></li>
              <li><Link to="/auth" className="hover:text-[#1B5E20] transition-colors">{t("landing.merchantPortal")}</Link></li>
              <li><Link to="/auth" className="hover:text-[#1B5E20] transition-colors">{t("marketplace.exchangeMarketplace")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">{t("landing.company")}</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-[#1B5E20] transition-colors">{t("landing.aboutUs")}</a></li>
              <li><a href="#" className="hover:text-[#1B5E20] transition-colors">{t("landing.careers")}</a></li>
              <li><a href="#" className="hover:text-[#1B5E20] transition-colors">{t("landing.contact")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">{t("landing.legal")}</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-[#1B5E20] transition-colors">{t("landing.privacy")}</a></li>
              <li><a href="#" className="hover:text-[#1B5E20] transition-colors">{t("landing.terms")}</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>© 2026 HarvestHub. {t("landing.allRights")}</p>
        </div>
      </footer>
    </div>
  )
}
