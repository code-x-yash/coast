import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { authService, UserProfile } from '@/lib/auth'

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
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await authService.getSession()
        if (session?.user) {
          const profile = await authService.getCurrentUser()
          setUser(profile)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await authService.getCurrentUser()
          setUser(profile)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password)
      const profile = await authService.getCurrentUser()
      setUser(profile)
    } catch (error: any) {
      throw new Error(error.message || 'Sign in failed')
    }
  }

  const signOut = async () => {
    await authService.signOut()
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

    const authData = await authService.signUp(formData.email, formData.password, {
      name: formData.name,
      phone: formData.phone,
      role: 'student'
    })

    if (authData.user) {
      await supabase.from('students').insert({
        userid: authData.user.id,
        dgshipping_id: formData.dgshipping_id,
        rank: formData.rank,
        coc_number: formData.coc_number,
        date_of_birth: formData.date_of_birth,
        nationality: formData.nationality || 'Indian'
      })

      const profile = await authService.getCurrentUser()
      setUser(profile)
    }
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
  }) => {
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    const authData = await authService.signUp(formData.email, formData.password, {
      name: formData.name,
      phone: formData.phone,
      role: 'institute'
    })

    if (authData.user) {
      await supabase.from('institutes').insert({
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

      const profile = await authService.getCurrentUser()
      setUser(profile)
    }
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
