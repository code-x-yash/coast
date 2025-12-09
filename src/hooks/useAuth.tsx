import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/data/mock'
import { mockAuth, AuthResponse } from '@/api/mockAuth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUpStudent: (formData: {
    name: string
    email: string
    password: string
    confirmPassword: string
  }) => Promise<void>
  signUpInstructor: (formData: {
    name: string
    email: string
    password: string
    confirmPassword: string
    instructorTitle?: string
    bio?: string
  }) => Promise<void>
  switchUser: (userId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = mockAuth.getSession()
    if (session) {
      setUser(session.user)
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    const response = await mockAuth.signIn(email, password)
    setUser(response.user)
  }

  const signOut = async () => {
    await mockAuth.signOut()
    setUser(null)
  }

  const signUpStudent = async (formData: {
    name: string
    email: string
    password: string
    confirmPassword: string
  }) => {
    const response = await mockAuth.signUpStudent(formData)
    setUser(response.user)
  }

  const signUpInstructor = async (formData: {
    name: string
    email: string
    password: string
    confirmPassword: string
    instructorTitle?: string
    bio?: string
  }) => {
    const response = await mockAuth.signUpInstructor(formData)
    setUser(response.user)
  }

  const switchUser = async (userId: string) => {
    const response = await mockAuth.switchUser(userId)
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
        signUpInstructor,
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
