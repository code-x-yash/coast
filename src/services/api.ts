import { supabase } from '@/lib/supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
  logo_url?: string
  banner_url?: string
  customer_care_email?: string
  customer_care_phone?: string
  admin_contact_person?: string
  house_number?: string
  street_name?: string
  landmark?: string
  country?: string
  postcode?: string
  license_number?: string
  issuing_authority?: string
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
  course_code?: string
  instructor_name?: string
  thumbnail_url?: string
  category?: string
  target_audience?: string
  entry_requirements?: string
  course_overview?: string
  additional_notes?: string
  currency?: 'INR' | 'USD' | 'EUR' | 'AED'
  approval_date?: string
  approved_by?: string
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
  instructor_name?: string
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
  currency?: 'INR' | 'USD' | 'EUR' | 'AED'
}

export interface Certificate {
  certid: string
  studid: string
  courseid: string
  cert_number: string
  issue_date: string
  expiry_date: string
  status: 'valid' | 'expired' | 'revoked'
  dgshipping_uploaded: boolean
  created_at?: string
}

export interface Seafarer {
  studid: string
  userid: string
  dgshipping_id?: string
  rank?: string
  coc_number?: string
  date_of_birth?: string
  nationality?: string
  profile_image?: string
  created_at?: string
  username?: string
  house_number?: string
  street_name?: string
  city?: string
  country?: string
  postcode?: string
  position?: string
  education_details?: string
  company_name?: string
}

export interface User {
  userid: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'institute' | 'student'
  created_at?: string
  email_verified?: boolean
  phone_verified?: boolean
  last_login?: string
  account_status?: 'active' | 'suspended' | 'deleted'
}

export interface CourseWithDetails extends Course {
  institute?: Institute
  batches?: Batch[]
}

export interface ReactivationRequest {
  requestid: string
  instid: string
  accreditation_no: string
  valid_from: string
  valid_to: string
  contact_email?: string
  contact_phone?: string
  address?: string
  city?: string
  state?: string
  reason?: string
  documents?: any[]
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  reviewer_notes?: string
}

export const courseTypes = ['STCW', 'Refresher', 'Technical', 'Other'] as const
export const courseModes = ['offline', 'online', 'hybrid'] as const

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession()

  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
  }
}

export const api = {
  async getSeafarerByUserId(userId: string): Promise<Seafarer | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('userid', userId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getInstituteByUserId(userId: string): Promise<Institute | null> {
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

  async listCourses(filters?: { instid?: string; type?: string; mode?: string; search?: string }): Promise<Course[]> {
    let query = supabase
      .from('courses')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (filters?.instid) {
      query = query.eq('instid', filters.instid)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.mode) {
      query = query.eq('mode', filters.mode)
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`)
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
    master_course_id?: string
    instructor_name?: string
    thumbnail_url?: string
    category?: string
    target_audience?: string
    entry_requirements?: string
    course_overview?: string
    additional_notes?: string
    currency?: 'INR' | 'USD' | 'EUR' | 'AED'
  }): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .insert({
        ...courseData,
        status: 'active',
        currency: courseData.currency || 'INR'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async listBatches(filters?: { courseid?: string }): Promise<Batch[]> {
    let query = supabase
      .from('batches')
      .select('*')
      .order('start_date', { ascending: false })

    if (filters?.courseid) {
      query = query.eq('courseid', filters.courseid)
    }

    const { data, error } = await query

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
    instructor_name?: string
  }): Promise<Batch> {
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

  async listBookings(filters?: { studid?: string; batchid?: string }): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: false })

    if (filters?.studid) {
      query = query.eq('studid', filters.studid)
    }

    if (filters?.batchid) {
      query = query.eq('batchid', filters.batchid)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async createBooking(bookingData: {
    studid: string
    batchid: string
    amount: number
    currency?: 'INR' | 'USD' | 'EUR' | 'AED'
  }): Promise<Booking> {
    const { data: batch } = await supabase
      .from('batches')
      .select('seats_total, seats_booked')
      .eq('batchid', bookingData.batchid)
      .single()

    if (batch && batch.seats_booked >= batch.seats_total) {
      throw new Error('Batch is full. No seats available.')
    }

    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('*')
      .eq('studid', bookingData.studid)
      .eq('batchid', bookingData.batchid)
      .maybeSingle()

    if (existingBooking) {
      throw new Error('You have already booked this batch')
    }

    const confirmationNumber = `BKG-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        confirmation_number: confirmationNumber,
        payment_status: 'pending',
        attendance_status: 'not_started',
        booking_date: new Date().toISOString(),
        currency: bookingData.currency || 'INR'
      })
      .select()
      .single()

    if (error) throw error

    const { error: batchError } = await supabase
      .from('batches')
      .update({ seats_booked: (batch?.seats_booked || 0) + 1 })
      .eq('batchid', bookingData.batchid)

    if (batchError) throw batchError

    return data
  },

  async updatePaymentStatus(bookid: string, status: 'pending' | 'completed' | 'failed' | 'refunded'): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: status })
      .eq('bookid', bookid)

    if (error) throw error
  },

  async listCertificates(studid?: string): Promise<Certificate[]> {
    let query = supabase
      .from('certificates')
      .select('*')
      .order('issue_date', { ascending: false })

    if (studid) {
      query = query.eq('studid', studid)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async createReactivationRequest(requestData: {
    instid: string
    accreditation_no: string
    valid_from: string
    valid_to: string
    contact_email?: string
    contact_phone?: string
    address?: string
    city?: string
    state?: string
    reason?: string
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
  },

  async listInstitutes(verifiedOnly: boolean = false): Promise<Institute[]> {
    let query = supabase
      .from('institutes')
      .select('*')
      .order('created_at', { ascending: false })

    if (verifiedOnly) {
      query = query.eq('verified_status', 'verified')
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async listAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async listReactivationRequests(): Promise<ReactivationRequest[]> {
    const { data, error } = await supabase
      .from('institute_reactivation_requests')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async updateInstituteStatus(instid: string, status: 'verified' | 'rejected'): Promise<void> {
    const { error } = await supabase
      .from('institutes')
      .update({ verified_status: status })
      .eq('instid', instid)

    if (error) throw error
  },

  async processReactivationRequest(requestid: string, action: 'approve' | 'reject', notes?: string): Promise<void> {
    const { error } = await supabase
      .from('institute_reactivation_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewer_notes: notes
      })
      .eq('requestid', requestid)

    if (error) throw error
  },

  async getAnalytics() {
    const [institutes, courses, seafarers, bookings, certificates] = await Promise.all([
      supabase.from('institutes').select('verified_status'),
      supabase.from('courses').select('status, fees'),
      supabase.from('students').select('studid'),
      supabase.from('bookings').select('payment_status, amount'),
      supabase.from('certificates').select('dgshipping_uploaded')
    ])

    const instituteData = institutes.data || []
    const courseData = courses.data || []
    const seafarerData = seafarers.data || []
    const bookingData = bookings.data || []
    const certificateData = certificates.data || []

    return {
      totalInstitutes: instituteData.length,
      verifiedInstitutes: instituteData.filter(i => i.verified_status === 'verified').length,
      pendingInstitutes: instituteData.filter(i => i.verified_status === 'pending').length,
      rejectedInstitutes: instituteData.filter(i => i.verified_status === 'rejected').length,
      totalCourses: courseData.length,
      activeCourses: courseData.filter(c => c.status === 'active').length,
      totalSeafarers: seafarerData.length,
      totalBookings: bookingData.length,
      completedBookings: bookingData.filter(b => b.payment_status === 'completed').length,
      pendingBookings: bookingData.filter(b => b.payment_status === 'pending').length,
      totalRevenue: bookingData
        .filter(b => b.payment_status === 'completed')
        .reduce((sum, b) => sum + (b.amount || 0), 0),
      totalCertificates: certificateData.length,
      certificatesUploaded: certificateData.filter(c => c.dgshipping_uploaded).length,
      avgCourseFee: courseData.length > 0
        ? courseData.reduce((sum, c) => sum + (c.fees || 0), 0) / courseData.length
        : 0
    }
  }
}
