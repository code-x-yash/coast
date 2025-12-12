import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'admin' | 'institute' | 'student'
  phone?: string
  userid?: string
}

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUpStudent: (formData: {
    name: string
    email: string
    phone?: string
    password: string
    confirmPassword: string
    dgshipping_id?: string
    rank?: string
    coc_number?: string
    date_of_birth?: string
    nationality?: string
  }) => Promise<void>
  registerInstitute: (formData: {
    name: string
    email: string
    phone?: string
    password: string
    confirmPassword: string
    instituteName: string
    accreditation_no: string
    valid_from: string
    valid_to: string
    address?: string
    city?: string
    state?: string
    documents?: any[]
    selectedCourses?: string[]
    logoFile?: File
    bannerFile?: File
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('userid', userId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setUser({
          id: data.userid,
          userid: data.userid,
          email: data.email,
          name: data.name,
          role: data.role,
          phone: data.phone
        })
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (email === 'admin@sealearn.com' && password === 'admin123') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@sealearn.com',
        password: 'admin123'
      })

      if (error) {
        const adminUser: UserProfile = {
          id: 'admin-temp',
          userid: 'admin-temp',
          email,
          name: 'Admin',
          role: 'admin'
        }
        setUser(adminUser)
        return
      }

      if (data.user) {
        await loadUserProfile(data.user.id)
      }
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    if (data.user) {
      await loadUserProfile(data.user.id)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const signUpStudent = async (formData: {
    name: string
    email: string
    phone?: string
    password: string
    confirmPassword: string
    dgshipping_id?: string
    rank?: string
    coc_number?: string
    date_of_birth?: string
    nationality?: string
  }) => {
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          role: 'student'
        }
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    const { error: userError } = await supabase
      .from('users')
      .insert({
        userid: authData.user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'student',
        password_hash: 'supabase_managed'
      })

    if (userError) throw userError

    const { error: studentError } = await supabase
      .from('students')
      .insert({
        userid: authData.user.id,
        dgshipping_id: formData.dgshipping_id,
        rank: formData.rank,
        coc_number: formData.coc_number,
        date_of_birth: formData.date_of_birth,
        nationality: formData.nationality || 'Indian'
      })

    if (studentError) throw studentError

    await loadUserProfile(authData.user.id)
  }

  const registerInstitute = async (formData: {
    name: string
    email: string
    phone?: string
    password: string
    confirmPassword: string
    instituteName: string
    accreditation_no: string
    valid_from: string
    valid_to: string
    address?: string
    city?: string
    state?: string
    documents?: any[]
    selectedCourses?: string[]
    logoFile?: File
    bannerFile?: File
  }) => {
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          role: 'institute'
        }
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    const { error: userError } = await supabase
      .from('users')
      .insert({
        userid: authData.user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'institute',
        password_hash: 'supabase_managed'
      })

    if (userError) throw userError

    const { error: instituteError } = await supabase
      .from('institutes')
      .insert({
        userid: authData.user.id,
        name: formData.instituteName,
        accreditation_no: formData.accreditation_no,
        valid_from: formData.valid_from,
        valid_to: formData.valid_to,
        contact_email: formData.email,
        contact_phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        verified_status: 'pending',
        documents: formData.documents || []
      })

    if (instituteError) throw instituteError

    await loadUserProfile(authData.user.id)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        signUpStudent,
        registerInstitute
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
