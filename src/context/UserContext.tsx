import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { users, User } from "@/data/mock"
import { supabase } from "@/lib/supabase"

interface UserContextType {
  user: User | null
  loading: boolean
  login: (role: 'farmer' | 'merchant' | 'admin') => Promise<void>
  logout: () => Promise<void>
  updateUser: (profile: Partial<User>) => Promise<void>
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
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

      if (error) throw error
      if (data) setUser(data as User)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (role: 'farmer' | 'merchant' | 'admin') => {
    const demoUsers = {
      farmer: { id: 'demo-farmer', email: 'farmer@demo.com', name: 'Demo Farmer', role: 'farmer' as const, avatar: 'DF' },
      merchant: { id: 'demo-merchant', email: 'merchant@demo.com', name: 'Demo Merchant', role: 'merchant' as const, avatar: 'DM' },
      admin: { id: 'demo-admin', email: 'admin@demo.com', name: 'Demo Admin', role: 'admin' as const, avatar: 'DA' }
    };
    setUser(demoUsers[role]);
    setLoading(false)
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

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateUser }}>
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
