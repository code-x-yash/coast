import { supabase } from './supabase'

export interface UserProfile {
  userid: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'institute' | 'student'
  created_at?: string
  updated_at?: string
}

export interface StudentProfile {
  studid: string
  userid: string
  dgshipping_id?: string
  rank?: string
  coc_number?: string
  date_of_birth?: string
  nationality?: string
  profile_image?: string
}

export interface InstituteProfile {
  instid: string
  userid: string
  name: string
  accreditation_no: string
  valid_from: string
  valid_to: string
  contact_email: string
  contact_phone?: string
  address?: string
  city?: string
  state?: string
  verified_status: 'pending' | 'verified' | 'rejected'
  documents?: any[]
}

export const authService = {
  async signUp(email: string, password: string, userData: {
    name: string
    phone?: string
    role: 'admin' | 'institute' | 'student'
  }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role
        }
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('User creation failed')

    const { error: userError } = await supabase
      .from('users')
      .insert({
        userid: authData.user.id,
        name: userData.name,
        email: email,
        phone: userData.phone,
        role: userData.role,
        password_hash: 'supabase_managed'
      })

    if (userError) throw userError

    return authData
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!user) return null

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('userid', user.id)
      .maybeSingle()

    if (profileError) throw profileError
    return profile as UserProfile | null
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
