import { supabase } from '@/lib/supabase'

export interface MasterCourse {
  master_course_id: string
  course_name: string
  course_code: string
  category: string
  description?: string
  required_documents?: any[]
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Course {
  courseid: string
  instid?: string
  title: string
  type: 'STCW' | 'Refresher' | 'Technical' | 'Other'
  duration: string
  mode: 'offline' | 'online' | 'hybrid'
  fees: number
  description?: string
  start_date?: string
  end_date?: string
  validity_months?: number
  accreditation_ref?: string
  status?: 'active' | 'inactive' | 'archived'
  master_course_id?: string
  commission_percent?: number
  created_at?: string
  institutes?: {
    name: string
    city?: string
    verified_status: string
  }
}

export const courseService = {
  async getMasterCourses() {
    const { data, error } = await supabase
      .from('master_courses')
      .select('*')
      .eq('is_active', true)
      .order('course_name')

    if (error) throw error
    return data as MasterCourse[]
  },

  async getCourses(filters?: {
    type?: string
    mode?: string
    search?: string
    limit?: number
  }) {
    let query = supabase
      .from('courses')
      .select(`
        *,
        institutes(name, city, verified_status)
      `)
      .eq('status', 'active')

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.mode) {
      query = query.eq('mode', filters.mode)
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data as Course[]
  },

  async getCourseById(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        institutes(name, city, state, verified_status, contact_email, contact_phone)
      `)
      .eq('courseid', id)
      .maybeSingle()

    if (error) throw error
    return data as Course | null
  },

  async getCourseBatches(courseId: string) {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('courseid', courseId)
      .in('batch_status', ['upcoming', 'ongoing'])
      .order('start_date')

    if (error) throw error
    return data
  }
}
