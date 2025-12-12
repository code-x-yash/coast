import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'admin' | 'institute' | 'student'
  phone?: string
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

const STORAGE_KEY = 'maritime_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY)
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (email === 'admin@sealarn.com' && password === 'admin123') {
      const adminUser: UserProfile = {
        id: 'admin-001',
        email,
        name: 'Admin',
        role: 'admin'
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser))
      setUser(adminUser)
      return
    }

    const savedUser = localStorage.getItem(STORAGE_KEY)
    if (savedUser) {
      const existingUser = JSON.parse(savedUser)
      if (existingUser.email === email) {
        setUser(existingUser)
        return
      }
    }

    const mockUser: UserProfile = {
      id: Math.random().toString(36).substring(7),
      email,
      name: email.split('@')[0],
      role: 'student'
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser))
    setUser(mockUser)
  }

  const signOut = async () => {
    localStorage.removeItem(STORAGE_KEY)
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

    const mockUser: UserProfile = {
      id: Math.random().toString(36).substring(7),
      email: formData.email,
      name: formData.name,
      role: 'student',
      phone: formData.phone
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser))
    setUser(mockUser)
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

    const mockUser: UserProfile = {
      id: Math.random().toString(36).substring(7),
      email: formData.email,
      name: formData.name,
      role: 'institute',
      phone: formData.phone
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser))
    localStorage.setItem('institute_data', JSON.stringify({
      instituteName: formData.instituteName,
      selectedCourses: formData.selectedCourses
    }))
    setUser(mockUser)
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
