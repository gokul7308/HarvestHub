import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { User } from "@/data/mock"
import { supabase } from "@/lib/supabase"

interface UserContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, role: string) => Promise<void>
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, token: string, name: string, role: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (profile: Partial<User>) => Promise<void>
  signInWithGoogle: (role: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  setDemoUser: (role: 'farmer' | 'merchant' | 'admin') => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event, session?.user?.email)
      if (session) {
        // For OAuth users, we might need to ensure the profile exists
        const storedRole = localStorage.getItem('pending_role') || 'farmer'
        const fullNameFromMeta = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
        
        await ensureProfile(session.user.id, session.user.email || '', fullNameFromMeta, storedRole)
        localStorage.removeItem('pending_role') // Clean up
        
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (data) setUser(data as User)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const ensureProfile = async (userId: string, email: string, name: string, role: string) => {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existing) {
      await supabase.from('profiles').insert([
        { id: userId, email, name: name || email.split('@')[0], role: role || 'farmer' }
      ])
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoading(false)
      throw error
    }
  }

  const signup = async (email: string, password: string, name: string, role: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role
        }
      }
    })
    if (error) {
      setLoading(false)
      throw error
    }
  }

  const sendOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) throw error
  }

  const verifyOtp = async (email: string, token: string, name: string, role: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'magiclink' })
    if (error) {
      setLoading(false)
      throw error
    }
    if (data.user) {
      await ensureProfile(data.user.id, email, name, role)
      await fetchProfile(data.user.id)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateUser = async (profile: Partial<User>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id)

      if (error) throw error
      setUser(prev => prev ? { ...prev, ...profile } : null)
    } catch (error) {
      // Fallback for mock state
      setUser(prev => prev ? { ...prev, ...profile } : null)
    }
  }

  const signInWithGoogle = async (role: string) => {
    localStorage.setItem('pending_role', role)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: "https://harvest-hub-alpha.vercel.app",
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    })
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    })
    if (error) throw error
  }

  const setDemoUser = (role: 'farmer' | 'merchant' | 'admin') => {
    const mockProfiles = {
      farmer: { id: 'demo-farmer', email: 'farmer@demo.com', name: 'Demo Farmer', role: 'farmer' },
      merchant: { id: 'demo-merchant', email: 'merchant@demo.com', name: 'Demo Merchant', role: 'merchant' },
      admin: { id: 'demo-admin', email: 'admin@demo.com', name: 'Demo Admin', role: 'admin' }
    }
    setUser(mockProfiles[role] as User)
    setLoading(false)
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      sendOtp, 
      verifyOtp, 
      logout, 
      updateUser,
      signInWithGoogle,
      resetPassword,
      setDemoUser
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
