import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { users, User } from "@/data/mock"
import { supabase } from "@/lib/supabase"

interface UserContextType {
  user: User | null
  loading: boolean
  login: (role: 'farmer' | 'merchant' | 'admin') => Promise<void>
  logout: () => Promise<void>
  updateUser: (profile: Partial<User>) => Promise<void>
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, token: string, name?: string, role?: string) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id, session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id, session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string, authUser?: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned

      if (data) {
        setUser(data as User)
      } else if (authUser) {
        // Create actual profile for new Google OAuth users
        const newProfile = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: 'farmer', // default role
          avatar: 'U'
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Fallback to setting user so they don't get stuck in a redirect loop
        }
        setUser(newProfile as User);
      }
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

  const sendOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  }

  const verifyOtp = async (email: string, token: string, name?: string, role?: string) => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) throw error;
    
    // Check if profile exists, if not, create it
    if (data?.session) {
      const userId = data.session.user.id;
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError && profileError.code === 'PGRST116') {
        const newProfile = {
          id: userId,
          name: name || email.split('@')[0],
          email: email,
          role: role || 'farmer',
          avatar: 'U'
        };
        await supabase.from('profiles').insert([newProfile]);
        setUser(newProfile as User);
      } else if (profileData) {
        setUser(profileData as User);
      }
    }
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
    <UserContext.Provider value={{ user, loading, login, logout, updateUser, sendOtp, verifyOtp }}>
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
