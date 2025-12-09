import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/api/maritimeMockApi'
import { maritimeAuth } from '@/api/maritimeAuth'

interface AuthContextType {
  user: User | null
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
  switchUser: (userid: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = maritimeAuth.getSession()
    if (session) {
      setUser(session.user)
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    const response = await maritimeAuth.signIn(email, password)
    setUser(response.user)
  }

  const signOut = async () => {
    await maritimeAuth.signOut()
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
    const response = await maritimeAuth.signUpStudent(formData)
    setUser(response.user)
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
    const response = await maritimeAuth.registerInstitute(formData)
    setUser(response.user)
  }

  const switchUser = async (userid: string) => {
    const response = await maritimeAuth.switchUser(userid)
    setUser(response.user)
    window.location.reload()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        signUpStudent,
        registerInstitute,
        switchUser
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
