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
    licenseFiles?: File[]
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      })()
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
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
    licenseFiles?: File[]
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

    const { data: instituteData, error: instituteError } = await supabase
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
        documents: []
      })
      .select()
      .single()

    if (instituteError) throw instituteError
    if (!instituteData) throw new Error('Failed to create institute')

    const uploadedDocuments: any[] = []

    if (formData.licenseFiles && formData.licenseFiles.length > 0) {
      for (let i = 0; i < formData.licenseFiles.length; i++) {
        const file = formData.licenseFiles[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${instituteData.instid}/${Date.now()}_${i}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('institute-documents')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Error uploading license file:', uploadError)
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('institute-documents')
            .getPublicUrl(fileName)

          uploadedDocuments.push({
            name: file.name,
            url: fileName,
            type: file.type,
            size: file.size
          })
        }
      }
    }

    if (formData.logoFile) {
      const fileExt = formData.logoFile.name.split('.').pop()
      const fileName = `${instituteData.instid}/logo.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('institute-logos')
        .upload(fileName, formData.logoFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('institute-logos')
          .getPublicUrl(fileName)

        await supabase
          .from('institutes')
          .update({ logo_url: publicUrl })
          .eq('instid', instituteData.instid)
      }
    }

    if (formData.bannerFile) {
      const fileExt = formData.bannerFile.name.split('.').pop()
      const fileName = `${instituteData.instid}/banner.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('institute-banners')
        .upload(fileName, formData.bannerFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('institute-banners')
          .getPublicUrl(fileName)

        await supabase
          .from('institutes')
          .update({ banner_url: publicUrl })
          .eq('instid', instituteData.instid)
      }
    }

    if (uploadedDocuments.length > 0) {
      await supabase
        .from('institutes')
        .update({ documents: uploadedDocuments })
        .eq('instid', instituteData.instid)
    }

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
