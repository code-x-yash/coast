import { supabase } from '@/lib/supabase'

export interface Institute {
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
  created_at?: string
}

export interface Course {
  courseid: string
  instid: string
  title: string
  type: 'STCW' | 'Refresher' | 'Technical' | 'Other'
  duration: string
  mode: 'offline' | 'online' | 'hybrid'
  fees: number
  description?: string
  validity_months?: number
  accreditation_ref?: string
  status: 'active' | 'inactive' | 'archived'
  master_course_id?: string
  application_id?: string
  created_at?: string
}

export interface Batch {
  batchid: string
  courseid: string
  batch_name: string
  start_date: string
  end_date: string
  seats_total: number
  seats_booked: number
  trainer?: string
  location?: string
  batch_status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_at?: string
}

export interface Booking {
  bookid: string
  studid: string
  batchid: string
  confirmation_number: string
  amount: number
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  attendance_status: 'not_started' | 'present' | 'absent' | 'completed'
  booking_date: string
  created_at?: string
}

export interface Certificate {
  certid: string
  studid: string
  courseid: string
  cert_number: string
  issue_date: string
  expiry_date: string
  dgshipping_uploaded: boolean
  created_at?: string
}

export interface ReactivationRequest {
  request_id: string
  instid: string
  new_accreditation_no: string
  new_valid_from: string
  new_valid_to: string
  documents?: any[]
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  reviewer_notes?: string
}

export const courseTypes = ['STCW', 'Refresher', 'Technical', 'Other'] as const
export const courseModes = ['offline', 'online', 'hybrid'] as const

export const maritimeApi = {
  async getInstituteByUserId(userId: string): Promise<Institute | null> {
    const instituteData = localStorage.getItem('institute_data')
    const userData = localStorage.getItem('maritime_user')

    if (instituteData && userData) {
      const institute = JSON.parse(instituteData)
      const user = JSON.parse(userData)

      if (user.id === userId && user.role === 'institute') {
        return {
          instid: userId,
          userid: userId,
          name: institute.instituteName || 'My Institute',
          accreditation_no: 'DGS-2024-001',
          valid_from: '2024-01-01',
          valid_to: '2026-12-31',
          contact_email: user.email,
          contact_phone: user.phone,
          address: 'Institute Address',
          city: 'Mumbai',
          state: 'Maharashtra',
          verified_status: 'verified',
          documents: [],
          created_at: new Date().toISOString()
        }
      }
    }

    const { data, error } = await supabase
      .from('institutes')
      .select('*')
      .eq('userid', userId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  isInstituteExpired(institute: Institute): boolean {
    const today = new Date()
    const validTo = new Date(institute.valid_to)
    return validTo < today
  },

  async getReactivationRequestByInstId(instId: string): Promise<ReactivationRequest | null> {
    const { data, error } = await supabase
      .from('institute_reactivation_requests')
      .select('*')
      .eq('instid', instId)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false })
      .maybeSingle()

    if (error) throw error
    return data
  },

  async listCourses(filters?: { instid?: string }): Promise<Course[]> {
    const mockCourses = localStorage.getItem('mock_courses')
    if (mockCourses && filters?.instid) {
      const courses = JSON.parse(mockCourses)
      return courses.filter((c: Course) => c.instid === filters.instid)
    }

    let query = supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.instid) {
      query = query.eq('instid', filters.instid)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async createCourse(courseData: {
    instid: string
    title: string
    type: 'STCW' | 'Refresher' | 'Technical' | 'Other'
    duration: string
    mode: 'offline' | 'online' | 'hybrid'
    fees: number
    description?: string
    validity_months?: number
    accreditation_ref?: string
  }): Promise<Course> {
    const userData = localStorage.getItem('maritime_user')
    if (userData) {
      const user = JSON.parse(userData)
      if (user.role === 'institute') {
        const newCourse: Course = {
          courseid: Math.random().toString(36).substring(7),
          ...courseData,
          status: 'active',
          created_at: new Date().toISOString()
        }

        const mockCourses = localStorage.getItem('mock_courses')
        const courses = mockCourses ? JSON.parse(mockCourses) : []
        courses.push(newCourse)
        localStorage.setItem('mock_courses', JSON.stringify(courses))

        return newCourse
      }
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        ...courseData,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async listBatches(): Promise<Batch[]> {
    const mockBatches = localStorage.getItem('mock_batches')
    if (mockBatches) {
      return JSON.parse(mockBatches)
    }

    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .order('start_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createBatch(batchData: {
    courseid: string
    batch_name: string
    start_date: string
    end_date: string
    seats_total: number
    trainer?: string
    location?: string
  }): Promise<Batch> {
    const userData = localStorage.getItem('maritime_user')
    if (userData) {
      const user = JSON.parse(userData)
      if (user.role === 'institute') {
        const newBatch: Batch = {
          batchid: Math.random().toString(36).substring(7),
          ...batchData,
          seats_booked: 0,
          batch_status: 'upcoming',
          created_at: new Date().toISOString()
        }

        const mockBatches = localStorage.getItem('mock_batches')
        const batches = mockBatches ? JSON.parse(mockBatches) : []
        batches.push(newBatch)
        localStorage.setItem('mock_batches', JSON.stringify(batches))

        return newBatch
      }
    }

    const { data, error } = await supabase
      .from('batches')
      .insert({
        ...batchData,
        seats_booked: 0,
        batch_status: 'upcoming'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async listBookings(): Promise<Booking[]> {
    const mockBookings = localStorage.getItem('mock_bookings')
    if (mockBookings) {
      return JSON.parse(mockBookings)
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async listCertificates(): Promise<Certificate[]> {
    const mockCertificates = localStorage.getItem('mock_certificates')
    if (mockCertificates) {
      return JSON.parse(mockCertificates)
    }

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('issue_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createReactivationRequest(requestData: {
    instid: string
    new_accreditation_no: string
    new_valid_from: string
    new_valid_to: string
    documents?: any[]
  }): Promise<ReactivationRequest> {
    const { data, error } = await supabase
      .from('institute_reactivation_requests')
      .insert({
        ...requestData,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}
