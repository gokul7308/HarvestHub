import React, { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@/context/UserContext"
import { Sprout, Mail, ArrowRight, Loader2, ShieldCheck, ChevronLeft, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const ROLES = ['farmer', 'merchant', 'admin'] as const
type Role = typeof ROLES[number]

const ROLE_META: Record<Role, { icon: string; label: string; desc: string; color: string }> = {
  farmer: { icon: '🌾', label: 'Farmer', desc: 'Manage crops & listings', color: 'from-green-600 to-green-400' },
  merchant: { icon: '🏪', label: 'Merchant', desc: 'Source & trade crops', color: 'from-blue-600 to-cyan-400' },
  admin:    { icon: '🛡️', label: 'Admin',    desc: 'Full platform access', color: 'from-purple-600 to-violet-400' },
}

type Step = 'email' | 'otp'

export default function OTPLogin() {
  const { sendOtp, verifyOtp, user } = useUser()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('farmer')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isNewUser, setIsNewUser] = useState(true)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // If already logged in, redirect
  useEffect(() => {
    if (user) navigate(`/${user.role}`, { replace: true })
  }, [user, navigate])

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendCooldown])

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 300)
    }
  }, [step])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await sendOtp(email)
      setStep('otp')
      setSuccess('OTP sent! Check your inbox.')
      setResendCooldown(60)
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return          // digits only
    const next = [...otp]
    next[index] = value
    setOtp(next)
    // Auto-advance
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
    // Auto-submit when all filled
    if (next.every(d => d) && next.join('').length === 6) {
      handleVerifyOtp(next.join(''))
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const next = pasted.split('')
      setOtp(next)
      otpRefs.current[5]?.focus()
      handleVerifyOtp(pasted)
    }
  }

  const handleVerifyOtp = async (token: string) => {
    setError('')
    setLoading(true)
    try {
      await verifyOtp(email, token, name, role)
      // Navigation handled by the useEffect watching `user`
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyClick = () => {
    const token = otp.join('')
    if (token.length < 6) { setError('Enter all 6 digits.'); return }
    handleVerifyOtp(token)
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError('')
    setLoading(true)
    try {
      await sendOtp(email)
      setSuccess('OTP resent!')
      setOtp(['', '', '', '', '', ''])
      setResendCooldown(60)
      otpRefs.current[0]?.focus()
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.')
    } finally {
      setLoading(false)
    }
  }

  const masked = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : ''

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-[#1B5E20]/30 selection:text-[#1B5E20]">

      {/* ── Left hero panel ── */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a2d14] via-[#1B5E20] to-[#2e7d32]" />

        {/* Animated blobs */}
        {[...Array(5)].map((_, i) => (
          <motion.div key={i}
            animate={{ y: [0, -24, 0], opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
            className="absolute w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"
            style={{ top: `${12 + i * 16}%`, left: `${8 + (i % 3) * 28}%` }}
          />
        ))}

        <div className="relative z-10 flex flex-col justify-between p-16 h-full w-full">
          <Link to="/" className="flex items-center gap-4 group w-fit">
            <div className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-2xl text-white group-hover:bg-white group-hover:text-[#1B5E20] transition-all">
              <Sprout size={28} className="transition-transform group-hover:rotate-12" />
            </div>
            <span className="text-3xl font-black font-poppins tracking-tighter text-white drop-shadow">HARVESTHUB</span>
          </Link>

          <div>
            <h1 className="text-5xl font-black font-poppins text-white leading-tight tracking-tight mb-6 drop-shadow-2xl">
              One OTP.<br />Infinite Access.
            </h1>
            <p className="text-white/70 text-base font-medium leading-relaxed max-w-sm border-l-2 border-green-400/30 pl-4">
              No password to remember. We send a secure 6-digit code directly to your email.
            </p>

            <div className="mt-10 space-y-4">
              {(['✅ No password needed', '🔐 Secured by Supabase Auth', '🌾 Role-based dashboard access'] as const).map((f, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className="flex items-center gap-3 text-white/90 font-semibold text-sm"
                >
                  <span>{f}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {[['🌾 15K+', 'Farmers'], ['📦 50K+', 'Trades'], ['🤖 1M+', 'Predictions']].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <div className="text-xl font-black text-white tracking-tighter mb-1">{val}</div>
                <div className="text-[9px] font-black text-green-300 uppercase tracking-widest">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 relative overflow-y-auto">

        {/* Mobile logo */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-[#1B5E20] p-2 rounded-xl"><Sprout size={24} className="text-white" /></div>
            <span className="text-2xl font-black font-poppins text-[#1B5E20] tracking-tighter">HARVESTHUB</span>
          </Link>
        </div>

        <div className="w-full max-w-[440px]">

          <AnimatePresence mode="wait">

            {/* ── STEP 1 : EMAIL ── */}
            {step === 'email' && (
              <motion.div key="email-step"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
              >
                <div className="mb-10">
                  <h2 className="text-4xl font-black font-poppins text-slate-900 tracking-tighter mb-2">
                    Sign In with OTP
                  </h2>
                  <p className="text-slate-500 font-medium">Enter your email and we'll send a one-time code.</p>
                </div>

                {/* Role selector */}
                <div className="mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">I am a…</p>
                  <div className="grid grid-cols-3 gap-3">
                    {ROLES.map(r => (
                      <button key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-[20px] border-2 transition-all font-bold text-sm ${
                          role === r
                            ? 'border-[#1B5E20] bg-[#F0FDF4] text-[#1B5E20] shadow-lg shadow-[#1B5E20]/10'
                            : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        {role === r && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-[#1B5E20] rounded-full flex items-center justify-center">
                            <Check size={10} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                        <span className="text-2xl">{ROLE_META[r].icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider">{ROLE_META[r].label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* New/returning toggle */}
                <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl">
                  {([true, false] as const).map(nu => (
                    <button key={String(nu)} type="button"
                      onClick={() => setIsNewUser(nu)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        isNewUser === nu ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {nu ? 'New Account' : 'Returning User'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendOtp} className="space-y-5">
                  {isNewUser && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                      <Input
                        type="text"
                        placeholder="Alex Johnson"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required={isNewUser}
                        className="h-14 rounded-2xl bg-white border-2 border-slate-100 focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/10 transition-all pl-5 font-medium"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="h-14 pl-11 rounded-2xl bg-white border-2 border-slate-100 focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/10 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-red-500 text-xs font-bold bg-red-50 border border-red-100 rounded-2xl px-4 py-3"
                    >{error}</motion.p>
                  )}

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Button type="submit" disabled={loading}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[#1B5E20]/20 hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 size={22} className="animate-spin" /> : <><Mail size={18} /> Send OTP <ArrowRight size={16} /></>}
                    </Button>
                  </motion.div>

                  <div className="text-center">
                    <span className="text-xs text-slate-400 font-medium">Already have password? </span>
                    <Link to="/auth" className="text-xs font-black text-[#1B5E20] hover:underline underline-offset-4">Sign in with password</Link>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2 : OTP ── */}
            {step === 'otp' && (
              <motion.div key="otp-step"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
              >
                {/* Back */}
                <button onClick={() => { setStep('email'); setError(''); setSuccess(''); setOtp(['','','','','','']) }}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-xs font-black uppercase tracking-widest mb-8 transition-colors"
                >
                  <ChevronLeft size={16} /> Change Email
                </button>

                <div className="mb-8">
                  <div className="w-14 h-14 bg-green-50 border-2 border-green-100 rounded-3xl flex items-center justify-center mb-6">
                    <Mail size={26} className="text-[#1B5E20]" />
                  </div>
                  <h2 className="text-4xl font-black font-poppins text-slate-900 tracking-tighter mb-2">Check Your Email</h2>
                  <p className="text-slate-500 font-medium">
                    We sent a 6-digit OTP to<br />
                    <span className="font-black text-slate-800">{masked}</span>
                  </p>
                </div>

                {/* OTP boxes */}
                <div className="flex gap-3 justify-center mb-8" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      disabled={loading}
                      className={`w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 transition-all outline-none bg-white
                        ${digit ? 'border-[#1B5E20] bg-[#F0FDF4] text-[#1B5E20]' : 'border-slate-200 text-slate-900'}
                        focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/10
                        disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                  ))}
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs font-bold bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4 text-center"
                  >{error}</motion.p>
                )}

                {success && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-green-700 text-xs font-bold bg-green-50 border border-green-100 rounded-2xl px-4 py-3 mb-4 text-center"
                  >✅ {success}</motion.p>
                )}

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="mb-5">
                  <Button onClick={handleVerifyClick} disabled={loading || otp.join('').length < 6}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[#1B5E20]/20 hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 size={22} className="animate-spin" /> : <><ShieldCheck size={18} /> Verify OTP <ArrowRight size={16} /></>}
                  </Button>
                </motion.div>

                {/* Resend */}
                <div className="text-center">
                  <button onClick={handleResend} disabled={resendCooldown > 0 || loading}
                    className="flex items-center gap-2 mx-auto text-xs font-black text-slate-400 hover:text-[#1B5E20] uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={12} className={resendCooldown > 0 ? '' : 'group-hover:rotate-180'} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] bg-white px-5 py-3 rounded-2xl border border-slate-50 shadow-sm">
                  <ShieldCheck size={12} className="text-emerald-500" /> 256-bit encrypted · Secured by Supabase
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
