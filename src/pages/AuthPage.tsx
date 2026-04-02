import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@/context/UserContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sprout, Briefcase, ShieldCheck, Mail, Lock, LogIn, UserPlus, Globe, Check, Loader2, ArrowRight, ChevronDown, TrendingUp, CloudRain } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState<'farmer' | 'merchant' | 'admin'>('farmer')
  const [isLoading, setIsLoading] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const { login, signup } = useUser()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(email, password, name, role)
        alert("Verification email sent! Please check your inbox.")
        setIsLogin(true)
      }
      // Redirection will happen automatically via UserContext/App protection if session is detected,
      // but for immediate ux:
      if (isLogin) {
         // Wait for profile fetch in context
         setTimeout(() => navigate('/'), 500)
      }
    } catch (error: any) {
      alert(error.message || "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoRole: 'farmer' | 'merchant' | 'admin') => {
    // Demo login is now restricted to real accounts or I can keep a shortcut for devs
    setEmail(`${demoRole}@harvest.com`)
    setPassword('password123')
    setIsLoading(true)
    try {
      await login(`${demoRole}@harvest.com`, 'password123')
      navigate(`/${demoRole}`)
    } catch (error) {
       alert("Demo account not found. Please sign up first.")
    } finally {
      setIsLoading(false)
    }
  }

  const roleConfig = {
    farmer: { bg: "from-[#1B5E20] to-[#2E7D32]", shadow: "shadow-[#1B5E20]/20" },
    merchant: { bg: "from-[#1B5E20] to-[#2E7D32]", shadow: "shadow-[#1B5E20]/20" },
    admin: { bg: "from-[#1B5E20] to-[#2E7D32]", shadow: "shadow-[#1B5E20]/20" }
  }

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'Tamil' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' }
  ]

  const currentLangName = languages.find(l => l.code === i18n.language.split('-')[0])?.name || 'English'

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    setIsLangOpen(false)
  }

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-[#1B5E20]/30 selection:text-[#1B5E20] overflow-hidden">
      
      {/* Premium Language Selector (Top Right) */}
      <div className="absolute top-8 right-8 z-50">
        <div className="relative">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <Globe size={16} className="text-slate-400 group-hover:text-[#1B5E20] transition-colors" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{currentLangName}</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isLangOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-40 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden py-1 z-50"
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => changeLanguage(l.code)}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1B5E20] transition-colors flex items-center justify-between"
                  >
                    {l.name}
                    {i18n.language.startsWith(l.code) && <Check size={12} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hero Section (Left) */}
      <div className="hidden lg:flex w-[48%] relative overflow-hidden bg-slate-100">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-700 to-green-400 z-0"></div>
        
        {/* Animated Light Particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div 
            key={i}
            animate={{ 
              y: [0, -30, 0], 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1] 
            }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i }}
            className={`absolute w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none`}
            style={{ 
              top: `${20 + (i * 15)}%`, 
              left: `${10 + (Math.random() * 60)}%` 
            }}
          />
        ))}

        <div className="relative z-30 flex flex-col justify-between p-16 h-full w-full">
          {/* Logo & Headline */}
          <div>
            <Link to="/" className="flex items-center gap-4 group transition-transform hover:scale-105 w-fit mb-10">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-2xl flex items-center justify-center transition-all group-hover:bg-white group-hover:text-green-800 text-white">
                <Sprout size={32} className="transition-transform group-hover:rotate-12" />
              </div>
              <span className="text-3xl font-black font-poppins tracking-tighter text-white drop-shadow-md">HARVESTHUB</span>
            </Link>
            
            <h1 className="text-5xl font-black font-poppins text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
               Smarter Farming.<br />Better Trading.
            </h1>
            
            {/* Feature Highlights */}
            <div className="space-y-4 mb-4">
              {['AI Price Prediction', 'Secure Trading', 'Real-Time Insights'].map((feature, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  key={idx} 
                  className="flex items-center gap-3 text-white/90 font-bold"
                >
                  <div className="bg-green-500/20 p-1.5 rounded-full border border-green-400/30">
                    <Check size={14} className="text-green-300" strokeWidth={3} />
                  </div>
                  {feature}
                </motion.div>
              ))}
            </div>
            
            {/* Micro Feature Text */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-white/70 text-sm font-medium leading-relaxed max-w-sm mt-6 border-l-2 border-green-400/30 pl-4"
            >
              Empowering farmers with data-driven decisions, real-time market access, and intelligent insights.
            </motion.p>
          </div>

          {/* Floating UI Cards */}
          <div className="flex flex-col gap-4 relative my-8 max-w-md ml-auto mr-4 group perspective-1000">
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: [-4, 4, -4] }}
                transition={{ opacity: { delay: 0.5 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
                whileHover={{ scale: 1.03 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-xl ml-4"
             >
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={18} className="text-green-300" />
                  <h3 className="text-white font-bold text-sm tracking-wide">AI Price Prediction</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed font-medium">Forecast crop prices using intelligent data models</p>
             </motion.div>

             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: [4, -4, 4] }}
                transition={{ opacity: { delay: 0.7 }, y: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
                whileHover={{ scale: 1.03 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-xl w-11/12"
             >
                <div className="flex items-center gap-3 mb-2">
                  <Globe size={18} className="text-blue-300" />
                  <h3 className="text-white font-bold text-sm tracking-wide">Smart Marketplace</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed font-medium">Connect directly with verified merchants</p>
             </motion.div>

             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: [-4, 4, -4] }}
                transition={{ opacity: { delay: 0.9 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
                whileHover={{ scale: 1.03 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-xl ml-8 w-10/12"
             >
                <div className="flex items-center gap-3 mb-2">
                  <CloudRain size={18} className="text-amber-300" />
                  <h3 className="text-white font-bold text-sm tracking-wide">Weather Intelligence</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed font-medium">Plan farming with real-time weather insights</p>
             </motion.div>
          </div>

          {/* Live Metric Strip (Bottom) */}
          <div className="border-t border-white/10 pt-8 mt-auto">
             <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-black text-white tracking-tighter mb-1">🌾 15,000+</div>
                  <div className="text-[9px] font-bold text-green-300 uppercase tracking-widest">Farmers</div>
                </div>
                <div className="text-center border-l border-white/10">
                  <div className="text-xl font-black text-white tracking-tighter mb-1">📦 50,000+</div>
                  <div className="text-[9px] font-bold text-green-300 uppercase tracking-widest">Trades</div>
                </div>
                <div className="text-center border-l border-white/10">
                  <div className="text-xl font-black text-white tracking-tighter mb-1">🤖 1M+</div>
                  <div className="text-[9px] font-bold text-green-300 uppercase tracking-widest">Predictions</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Authentication Interface (Right) */}
      <div className="w-full lg:w-[52%] flex items-center justify-center p-8 relative overflow-y-auto bg-slate-50">
        
        {/* Mobile Navbar */}
        <div className="absolute top-8 left-10 lg:hidden group">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-100">
               <Sprout size={28} className="text-[#1B5E20]" />
            </div>
            <span className="text-3xl font-black font-poppins tracking-tighter text-[#1B5E20]">HARVESTHUB</span>
          </Link>
        </div>

        <div className="w-full max-w-[460px]">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-5xl font-black font-poppins text-slate-900 mb-3 tracking-tighter">
               {isLogin ? t("auth.welcome") : t("auth.createAccount")}
            </h2>
            <p className="text-slate-500 text-xl font-medium tracking-tight">
               {isLogin ? t("auth.signInAssets") : t("auth.joinEcosystem")}
            </p>
          </motion.div>

          {/* Unified Role Toggle (Pill Style) */}
          <div className="relative flex p-1.5 bg-slate-200/40 rounded-[22px] mb-8 border border-slate-200/30">
             <motion.div 
                className="absolute inset-y-1.5 bg-white rounded-[18px] shadow-xl shadow-slate-300/40 border border-slate-100"
                initial={false}
                animate={{
                   x: role === 'farmer' ? '0%' : role === 'merchant' ? '100%' : '200%',
                   width: 'calc(33.333% - 4px)'
                }}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                style={{ left: '4px' }}
             />
             {(['farmer', 'merchant', 'admin'] as const).map((r) => (
               <button
                 key={r}
                 onClick={() => setRole(r)}
                 className={`flex-1 relative z-10 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${role === r ? 'text-[#1B5E20]' : 'text-slate-500 hover:text-slate-900 group'}`}
               >
                 <span className="opacity-70 group-hover:opacity-100">{t(`auth.${r}`)}</span>
               </button>
             ))}
          </div>

          <motion.div 
            className="relative"
            layout
          >
            {/* Soft Glow Behind Form */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#1B5E20]/5 to-transparent blur-3xl opacity-50 rounded-full" />
            
            <AnimatePresence mode="wait">
              <motion.form 
                key={`${isLogin}-${role}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleAuth} 
                className="relative bg-white/70 backdrop-blur-2xl rounded-[32px] border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-12 space-y-7"
              >
                {!isLogin && (
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t("auth.fullName")}</label>
                    <div className="relative group">
                       <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Johnathan Miller" required className="pl-14 h-16 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#1B5E20]/5 focus:border-[#1B5E20] transition-all duration-300 border-2" />
                       <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1B5E20] transition-colors" size={20} />
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t("auth.email")}</label>
                  <div className="relative group">
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="identity@enterprise.com" required className="pl-14 h-16 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#1B5E20]/5 focus:border-[#1B5E20] transition-all duration-300 border-2" />
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1B5E20] transition-colors" size={20} />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("auth.password")}</label>
                    {isLogin && <a href="#" className="text-[10px] font-black text-[#1B5E20] uppercase tracking-widest hover:opacity-60 transition-opacity">{t("auth.forgotPassword")}</a>}
                  </div>
                  <div className="relative group">
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="pl-14 h-16 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#1B5E20]/5 focus:border-[#1B5E20] transition-all duration-300 border-2" />
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1B5E20] transition-colors" size={20} />
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className={`w-full h-16 rounded-2xl text-xs font-black uppercase tracking-[0.3em] text-white shadow-2xl bg-gradient-to-r ${roleConfig[role].bg} ${roleConfig[role].shadow} hover:brightness-110 flex items-center justify-center transition-all disabled:opacity-70`}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        {isLogin ? t("auth.signin") : t("auth.signup")}
                        <ArrowRight size={20} className="ml-3" />
                      </>
                    )}
                  </Button>
                </motion.div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t-[3px] border-slate-50"></span>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-200 tracking-widest">
                    <span className="bg-white px-6">{t("auth.social")}</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full h-16 rounded-2xl border-2 border-slate-100 bg-white hover:bg-slate-50/50 text-slate-700 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                  {t("auth.continueWithGoogle")}
                </Button>

                {/* Quick Demo Access */}
                <div className="pt-6 mt-4 border-t border-slate-100">
                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest text-center mb-4">Quick Demo Access</p>
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => handleDemoLogin('farmer')} className="flex-1 h-12 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase text-slate-600 hover:bg-slate-50 hover:text-green-700 transition-all shadow-sm hover:shadow-md">
                      👨‍🌾 Farmer
                    </Button>
                    <Button type="button" onClick={() => handleDemoLogin('merchant')} className="flex-1 h-12 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase text-slate-600 hover:bg-slate-50 hover:text-green-700 transition-all shadow-sm hover:shadow-md">
                      🏪 Merchant
                    </Button>
                    <Button type="button" onClick={() => handleDemoLogin('admin')} className="flex-1 h-12 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase text-slate-600 hover:bg-slate-50 hover:text-green-700 transition-all shadow-sm hover:shadow-md">
                      🛠️ Admin
                    </Button>
                  </div>
                  {/* OTP Option */}
                  <div className="mt-4 pt-4 border-t border-slate-50 text-center">
                    <Link
                      to="/auth/otp"
                      className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1B5E20] hover:opacity-70 transition-opacity"
                    >
                      🔐 Sign in with Email OTP instead
                    </Link>
                  </div>
                </div>
              </motion.form>
            </AnimatePresence>
          </motion.div>

          <footer className="mt-12 flex flex-col items-center gap-10">
            <div className="text-xs font-bold text-slate-400">
               {isLogin ? t("auth.dontHaveAccount") + " " : t("auth.alreadyHaveAccount") + " "}
               <button 
                 onClick={() => setIsLogin(!isLogin)} 
                 className="font-black text-[#1B5E20] hover:underline underline-offset-8 decoration-[3px]"
               >
                 {isLogin ? t("auth.join") : t("auth.login")}
               </button>
            </div>
            
            <div className="flex items-center gap-3 text-[9px] uppercase font-black text-slate-300 tracking-[0.4em] bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-50">
              <ShieldCheck size={14} className="text-emerald-500" />
              {t("auth.encryption")}
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
