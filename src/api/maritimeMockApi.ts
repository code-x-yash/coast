import {
  mockUsers,
  mockInstitutes,
  mockCourses,
  mockBatches,
  mockStudents,
  mockBookings,
  mockCertificates,
  mockPayments,
} from '@/data/maritimeMockData';

const DB_KEY = 'maritime_training_platform_v1';

export interface User {
  userid: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'institute' | 'student';
  password_hash: string;
  created_at?: string;
  updated_at?: string;
}

export interface Institute {
  instid: string;
  userid: string;
  name: string;
  accreditation_no: string;
  valid_from: string;
  valid_to: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  verified_status: 'pending' | 'verified' | 'rejected';
  documents?: any[];
  created_at?: string;
}

export interface Course {
  courseid: string;
  instid: string;
  title: string;
  type: 'STCW' | 'Refresher' | 'Technical' | 'Other';
  duration: string;
  mode: 'offline' | 'online' | 'hybrid';
  fees: number;
  description?: string;
  start_date?: string;
  end_date?: string;
  validity_months?: number;
  accreditation_ref?: string;
  status: 'active' | 'inactive' | 'archived';
  created_at?: string;
}

export interface Batch {
  batchid: string;
  courseid: string;
  batch_name: string;
  seats_total: number;
  seats_booked: number;
  trainer?: string;
  start_date: string;
  end_date: string;
  location?: string;
  batch_status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at?: string;
}

export interface Student {
  studid: string;
  userid: string;
  dgshipping_id?: string;
  rank?: string;
  coc_number?: string;
  date_of_birth?: string;
  nationality?: string;
  profile_image?: string;
  created_at?: string;
}

export interface Booking {
  bookid: string;
  studid: string;
  batchid: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  booking_date: string;
  amount: number;
  confirmation_number?: string;
  attendance_status?: 'not_started' | 'attending' | 'completed' | 'absent';
  completion_status?: 'incomplete' | 'completed' | 'failed';
  created_at?: string;
}

export interface Certificate {
  certid: string;
  studid: string;
  courseid: string;
  batchid: string;
  cert_number: string;
  issue_date: string;
  expiry_date: string;
  dgshipping_uploaded: boolean;
  dgshipping_upload_date?: string;
  certificate_url?: string;
  status: 'valid' | 'expired' | 'revoked';
  created_at?: string;
}

export interface Payment {
  payid: string;
  bookid: string;
  amount: number;
  method: 'wallet' | 'card' | 'upi' | 'netbanking' | 'cash';
  txn_ref?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  payment_date: string;
  created_at?: string;
}

interface MaritimeDatabase {
  users: User[];
  institutes: Institute[];
  courses: Course[];
  batches: Batch[];
  students: Student[];
  bookings: Booking[];
  certificates: Certificate[];
  payments: Payment[];
}

const getDatabase = (): MaritimeDatabase => {
  try {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.warn('Failed to load from localStorage, using defaults');
  }
  return {
    users: [...mockUsers],
    institutes: [...mockInstitutes],
    courses: [...mockCourses],
    batches: [...mockBatches],
    students: [...mockStudents],
    bookings: [...mockBookings],
    certificates: [...mockCertificates],
    payments: [...mockPayments],
  };
};

const saveDatabase = (db: MaritimeDatabase) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const getRandomDelay = () => Math.random() * 600 + 200;

export const maritimeApi = {
  async findUserByEmail(email: string): Promise<User | null> {
    await delay(getRandomDelay());
    const db = getDatabase();
    return db.users.find(u => u.email === email) || null;
  },

  async findUserById(userid: string): Promise<User | null> {
    await delay(getRandomDelay());
    const db = getDatabase();
    return db.users.find(u => u.userid === userid) || null;
  },

  async createUser(userData: Partial<User>): Promise<User> {
    await delay(getRandomDelay());
    const db = getDatabase();

    if (db.users.some(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      userid: `user-${Date.now()}`,
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone,
      role: userData.role || 'student',
      password_hash: userData.password_hash || 'hashed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDatabase(db);
    return newUser;
  },

  async listAllUsers(): Promise<User[]> {
    await delay(getRandomDelay());
    const db = getDatabase();
    return db.users;
  },

  async listInstitutes(verifiedOnly = false): Promise<Institute[]> {
    await delay(getRandomDelay());
    const db = getDatabase();
    if (verifiedOnly) {
      return db.institutes.filter(i => i.verified_status === 'verified');
    }
    return db.institutes;
  },

  async getInstituteById(instid: string): Promise<Institute | null> {
    await delay(getRandomDelay());
    const db = getDatabase();
    return db.institutes.find(i => i.instid === instid) || null;
  },

  async getInstituteByUserId(userid: string): Promise<Institute | null> {
    await delay(getRandomDelay());
    const db = getDatabase();
    return db.institutes.find(i => i.userid === userid) || null;
  },

  async createInstitute(instituteData: Partial<Institute>): Promise<Institute> {
    await delay(getRandomDelay());
    const db = getDatabase();

    const newInstitute: Institute = {
      instid: `inst-${Date.now()}`,
      userid: instituteData.userid || '',
      name: instituteData.name || '',
      accreditation_no: instituteData.accreditation_no || '',
      valid_from: instituteData.valid_from || '',
      valid_to: instituteData.valid_to || '',
      contact_email: instituteData.contact_email || '',
      contact_phone: instituteData.contact_phone,
      address: instituteData.address,
      city: instituteData.city,
      state: instituteData.state,
      verified_status: 'pending',
      documents: instituteData.documents || [],
      created_at: new Date().toISOString(),
    };

    db.institutes.push(newInstitute);
    saveDatabase(db);
    return newInstitute;
  },

  async updateInstituteStatus(instid: string, status: 'pending' | 'verified' | 'rejected'): Promise<Institute> {
    await delay(getRandomDelay());
    const db = getDatabase();
    const institute = db.institutes.find(i => i.instid === instid);
    if (!institute) throw new Error('Institute not found');

    institute.verified_status = status;
    saveDatabase(db);
    return institute;
  },

  async listCourses(filters?: { instid?: string; type?: string; mode?: string; city?: string }): Promise<Course[]> {
    await delay(getRandomDelay());
    const db = getDatabase();
    let courses = db.courses.filter(c => c.status === 'active');

    if (filters?.instid) {
      courses = courses.filter(c => c.instid === filters.instid);
    }
    if (filters?.type) {
      courses = courses.filter(c => c.type === filters.type);
    }
    if (filters?.mode) {
      courses = courses.filter(c => c.mode === filters.mode);
    }
    if (filters?.city) {
      const institutes = db.institutes.filter(i => i.city === filters.city);
      const instIds = institutes.map(i => i.instid);
      courses = courses.filter(c => instIds.includes(c.instid));
    }

    return courses;
  },

  async getCourseById(courseid: string): Promise<Course | null> {
    await delay(getRandomDelay());
    const db = getDatabase();
    return db.courses.find(c => c.courseid === courseid) || null;
  },

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    await delay(getRandomDelay());
    const db = getDatabase();

    const newCourse: Course = {
      courseid: `course-${Date.now()}`,
      instid: courseData.instid || '',
      title: courseData.title || '',
      type: courseData.type || 'Other',
      duration: courseData.duration || '',
      mode: courseData.mode || 'offline',
      fees: courseData.fees || 0,
      description: courseData.description,
      start_date: courseData.start_date,
      end_date: courseData.end_date,
      validity_months: courseData.validity_months || 60,
      accreditation_ref: courseData.accreditation_ref,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    db.courses.push(newCourse);
    saveDatabase(db);
    return newCourse;
  },

  async updateCourse(courseid: string, updates: Partial<Course>): Promise<Course> {
    await delay(getRandomDelay());
    const db = getDatabase();
    const course = db.courses.find(c => c.courseid === courseid);
    if (!course) throw new Error('Course not found');

    Object.assign(course, updates);
    saveDatabase(db);
    return course;
  },

  async listBatches(courseid?: string): Promise<Batch[]> {
    await delay(getRandomDelay());
    const db = getDatabase();
    if (courseid) {
      return db.batches.filter(b => b.courseid === courseid);
    }
    return db.batches;
  },

  async getBatchById(batchid: string): Promise<Batch | null> {
    await delay(getRandomDelay());
    const db = getDatabase();
    return db.batches.find(b => b.batchid === batchid) || null;
  },

  async createBatch(batchData: Partial<Batch>): Promise<Batch> {
    await delay(getRandomDelay());
    const db = getDatabase();

    const newBatch: Batch = {
      batchid: `batch-${Date.now()}`,
      courseid: batchData.courseid || '',
      batch_name: batchData.batch_name || '',
      seats_total: batchData.seats_total || 30,
      seats_booked: 0,
      trainer: batchData.trainer,
      start_date: batchData.start_date || '',
      end_date: batchData.end_date || '',
      location: batchData.location,
      batch_status: 'upcoming',
      created_at: new Date().toISOString(),
    };

    db.batches.push(newBatch);
    saveDatabase(db);
    return newBatch;
  },

  async updateBatch(batchid: string, updates: Partial<Batch>): Promise<Batch> {
    await delay(getRandomDelay());
    const db = getDatabase();
    const batch = db.batches.find(b => b.batchid === batchid);
    if (!batch) throw new Error('Batch not found');

    Object.assign(batch, updates);
    saveDatabase(db);
    return batch;
  },

  async getStudentByUserId(userid: string): Promise<Student | null> {
    await delay(getRandomDelay());
    const db = getDatabase();
    return db.students.find(s => s.userid === userid) || null;
  },

  async getStudentById(studid: string): Promise<Student | null> {
    await delay(getRandomDelay());
    const db = getDatabase();
    return db.students.find(s => s.studid === studid) || null;
  },

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    await delay(getRandomDelay());
    const db = getDatabase();

    const newStudent: Student = {
      studid: `stud-${Date.now()}`,
      userid: studentData.userid || '',
      dgshipping_id: studentData.dgshipping_id,
      rank: studentData.rank,
      coc_number: studentData.coc_number,
      date_of_birth: studentData.date_of_birth,
      nationality: studentData.nationality || 'Indian',
      profile_image: studentData.profile_image,
      created_at: new Date().toISOString(),
    };

    db.students.push(newStudent);
    saveDatabase(db);
    return newStudent;
  },

  async updateStudent(studid: string, updates: Partial<Student>): Promise<Student> {
    await delay(getRandomDelay());
    const db = getDatabase();
    const student = db.students.find(s => s.studid === studid);
    if (!student) throw new Error('Student not found');

    Object.assign(student, updates);
    saveDatabase(db);
    return student;
  },

  async listBookings(filters?: { studid?: string; batchid?: string }): Promise<Booking[]> {
    await delay(getRandomDelay());
    const db = getDatabase();
    let bookings = db.bookings;

    if (filters?.studid) {
      bookings = bookings.filter(b => b.studid === filters.studid);
    }
    if (filters?.batchid) {
      bookings = bookings.filter(b => b.batchid === filters.batchid);
    }

    return bookings;
  },

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    await delay(getRandomDelay());
    const db = getDatabase();

    const batch = db.batches.find(b => b.batchid === bookingData.batchid);
    if (!batch) throw new Error('Batch not found');
    if (batch.seats_booked >= batch.seats_total) {
      throw new Error('No seats available');
    }

    const newBooking: Booking = {
      bookid: `book-${Date.now()}`,
      studid: bookingData.studid || '',
      batchid: bookingData.batchid || '',
      payment_status: 'pending',
      booking_date: new Date().toISOString(),
      amount: bookingData.amount || 0,
      confirmation_number: `CONF-${Date.now()}`,
      attendance_status: 'not_started',
      completion_status: 'incomplete',
      created_at: new Date().toISOString(),
    };

    db.bookings.push(newBooking);
    batch.seats_booked += 1;
    saveDatabase(db);
    return newBooking;
  },

  async updateBooking(bookid: string, updates: Partial<Booking>): Promise<Booking> {
    await delay(getRandomDelay());
    const db = getDatabase();
    const booking = db.bookings.find(b => b.bookid === bookid);
    if (!booking) throw new Error('Booking not found');

    Object.assign(booking, updates);
    saveDatabase(db);
    return booking;
  },

  async listCertificates(studid?: string): Promise<Certificate[]> {
    await delay(getRandomDelay());
    const db = getDatabase();
    if (studid) {
      return db.certificates.filter(c => c.studid === studid);
    }
    return db.certificates;
  },

  async createCertificate(certData: Partial<Certificate>): Promise<Certificate> {
    await delay(getRandomDelay());
    const db = getDatabase();

    const newCert: Certificate = {
      certid: `cert-${Date.now()}`,
      studid: certData.studid || '',
      courseid: certData.courseid || '',
      batchid: certData.batchid || '',
      cert_number: certData.cert_number || `CERT-${Date.now()}`,
      issue_date: certData.issue_date || new Date().toISOString().split('T')[0],
      expiry_date: certData.expiry_date || '',
      dgshipping_uploaded: false,
      certificate_url: certData.certificate_url,
      status: 'valid',
      created_at: new Date().toISOString(),
    };

    db.certificates.push(newCert);
    saveDatabase(db);
    return newCert;
  },

  async updateCertificate(certid: string, updates: Partial<Certificate>): Promise<Certificate> {
    await delay(getRandomDelay());
    const db = getDatabase();
    const cert = db.certificates.find(c => c.certid === certid);
    if (!cert) throw new Error('Certificate not found');

    Object.assign(cert, updates);
    saveDatabase(db);
    return cert;
  },

  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    await delay(getRandomDelay());
    const db = getDatabase();

    const newPayment: Payment = {
      payid: `pay-${Date.now()}`,
      bookid: paymentData.bookid || '',
      amount: paymentData.amount || 0,
      method: paymentData.method || 'upi',
      txn_ref: paymentData.txn_ref || `TXN-${Date.now()}`,
      status: 'success',
      payment_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    db.payments.push(newPayment);

    const booking = db.bookings.find(b => b.bookid === newPayment.bookid);
    if (booking) {
      booking.payment_status = 'completed';
    }

    saveDatabase(db);
    return newPayment;
  },

  async getAnalytics() {
    await delay(getRandomDelay());
    const db = getDatabase();

    return {
      totalInstitutes: db.institutes.length,
      verifiedInstitutes: db.institutes.filter(i => i.verified_status === 'verified').length,
      pendingInstitutes: db.institutes.filter(i => i.verified_status === 'pending').length,
      totalCourses: db.courses.filter(c => c.status === 'active').length,
      totalStudents: db.students.length,
      totalBookings: db.bookings.length,
      completedBookings: db.bookings.filter(b => b.payment_status === 'completed').length,
      totalRevenue: db.payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0),
      certificatesIssued: db.certificates.length,
      certificatesUploaded: db.certificates.filter(c => c.dgshipping_uploaded).length,
    };
  },
};
