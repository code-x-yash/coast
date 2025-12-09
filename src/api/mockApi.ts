import {
  User,
  Course,
  Lesson,
  Enrollment,
  mockUsers,
  getAllCourses,
  getAllLessons,
  getAllEnrollments
} from '@/data/mock'

const DB_KEY = 'demo_mvp_data_v1'

interface AppDatabase {
  users: User[]
  courses: Course[]
  lessons: Lesson[]
  enrollments: Enrollment[]
}

const getDatabase = (): AppDatabase => {
  try {
    const stored = localStorage.getItem(DB_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    console.warn('Failed to load from localStorage, using defaults')
  }
  return {
    users: [...mockUsers],
    courses: getAllCourses(),
    lessons: getAllLessons(),
    enrollments: getAllEnrollments()
  }
}

const saveDatabase = (db: AppDatabase) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const getRandomDelay = () => Math.random() * 600 + 200

export const mockApi = {
  async listUsers(): Promise<User[]> {
    await delay(getRandomDelay())
    const db = getDatabase()
    return db.users
  },

  async findUserById(userId: string): Promise<User | null> {
    await delay(getRandomDelay())
    const db = getDatabase()
    return db.users.find(u => u.id === userId) || null
  },

  async findUserByEmail(email: string): Promise<User | null> {
    await delay(getRandomDelay())
    const db = getDatabase()
    return db.users.find(u => u.email === email) || null
  },

  async createUser(userData: Partial<User>): Promise<User> {
    await delay(getRandomDelay())
    const db = getDatabase()

    if (db.users.some(u => u.email === userData.email)) {
      throw new Error('Email already exists')
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email || '',
      password: userData.password || '',
      name: userData.name || '',
      role: userData.role || 'student',
      avatar: userData.avatar,
      bio: userData.bio,
      createdAt: new Date().toISOString()
    }

    db.users.push(newUser)
    saveDatabase(db)
    return newUser
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    await delay(getRandomDelay())
    const db = getDatabase()
    const user = db.users.find(u => u.id === userId)
    if (!user) throw new Error('User not found')

    Object.assign(user, updates)
    saveDatabase(db)
    return user
  },

  async updateUserRole(userId: string, role: string): Promise<User> {
    await delay(getRandomDelay())
    const db = getDatabase()
    const user = db.users.find(u => u.id === userId)
    if (!user) throw new Error('User not found')

    user.role = role as any
    saveDatabase(db)
    return user
  },

  async listCourses(): Promise<Course[]> {
    await delay(getRandomDelay())
    const db = getDatabase()
    return db.courses
  },

  async findCourse(courseId: string): Promise<Course | null> {
    await delay(getRandomDelay())
    const db = getDatabase()
    return db.courses.find(c => c.id === courseId) || null
  },

  async searchCourses(query: string): Promise<Course[]> {
    await delay(getRandomDelay())
    const db = getDatabase()
    const lower = query.toLowerCase()
    return db.courses.filter(c =>
      c.title.toLowerCase().includes(lower) ||
      c.description.toLowerCase().includes(lower) ||
      c.category.toLowerCase().includes(lower)
    )
  },

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    await delay(getRandomDelay())
    const db = getDatabase()

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: courseData.title || 'Untitled Course',
      description: courseData.description || '',
      instructorId: courseData.instructorId || '',
      instructorName: courseData.instructorName || '',
      instructorTitle: courseData.instructorTitle,
      category: courseData.category || 'General',
      level: courseData.level || 'Beginner',
      durationHours: courseData.durationHours || 0,
      price: courseData.price || 0,
      rating: 0,
      totalStudents: 0,
      thumbnailUrl: courseData.thumbnailUrl || 'https://images.unsplash.com/photo-1501504905252-473c47e1f1c9?w=500&h=300&fit=crop',
      isFeatured: courseData.isFeatured || false,
      isPublished: courseData.isPublished || false,
      whatYouWillLearn: courseData.whatYouWillLearn || [],
      requirements: courseData.requirements || [],
      createdAt: new Date().toISOString()
    }

    db.courses.push(newCourse)
    saveDatabase(db)
    return newCourse
  },

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<Course> {
    await delay(getRandomDelay())
    const db = getDatabase()
    const course = db.courses.find(c => c.id === courseId)
    if (!course) throw new Error('Course not found')

    Object.assign(course, updates)
    saveDatabase(db)
    return course
  },

  async deleteCourse(courseId: string): Promise<void> {
    await delay(getRandomDelay())
    const db = getDatabase()
    const index = db.courses.findIndex(c => c.id === courseId)
    if (index === -1) throw new Error('Course not found')

    db.courses.splice(index, 1)
    db.lessons = db.lessons.filter(l => l.courseId !== courseId)
    db.enrollments = db.enrollments.filter(e => e.courseId !== courseId)
    saveDatabase(db)
  },

  async listLessonsForCourse(courseId: string): Promise<Lesson[]> {
    await delay(getRandomDelay())
    const db = getDatabase()
    return db.lessons
      .filter(l => l.courseId === courseId)
      .sort((a, b) => a.orderIndex - b.orderIndex)
  },

  async findLesson(lessonId: string): Promise<Lesson | null> {
    await delay(getRandomDelay())
    const db = getDatabase()
    return db.lessons.find(l => l.id === lessonId) || null
  },

  async createLesson(courseId: string, lessonData: Partial<Lesson>): Promise<Lesson> {
    await delay(getRandomDelay())
    const db = getDatabase()

    const course = db.courses.find(c => c.id === courseId)
    if (!course) throw new Error('Course not found')

    const maxOrder = Math.max(...(db.lessons.filter(l => l.courseId === courseId).map(l => l.orderIndex) || [0]), 0)

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      courseId,
      title: lessonData.title || 'Untitled Lesson',
      description: lessonData.description || '',
      orderIndex: lessonData.orderIndex || maxOrder + 1,
      durationMinutes: lessonData.durationMinutes || 0,
      contentType: lessonData.contentType || 'video',
      contentUrl: lessonData.contentUrl,
      transcript: lessonData.transcript,
      resources: lessonData.resources,
      createdAt: new Date().toISOString()
    }

    db.lessons.push(newLesson)
    saveDatabase(db)
    return newLesson
  },

  async updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<Lesson> {
    await delay(getRandomDelay())
    const db = getDatabase()
    const lesson = db.lessons.find(l => l.id === lessonId)
    if (!lesson) throw new Error('Lesson not found')

    Object.assign(lesson, updates)
    saveDatabase(db)
    return lesson
  },

  async deleteLesson(lessonId: string): Promise<void> {
    await delay(getRandomDelay())
    const db = getDatabase()
    const index = db.lessons.findIndex(l => l.id === lessonId)
    if (index === -1) throw new Error('Lesson not found')

    db.lessons.splice(index, 1)
    saveDatabase(db)
  },

  async listEnrollments(courseId?: string): Promise<Enrollment[]> {
    await delay(getRandomDelay())
    const db = getDatabase()
    if (courseId) {
      return db.enrollments.filter(e => e.courseId === courseId)
    }
    return db.enrollments
  },

  async findEnrollment(enrollmentId: string): Promise<Enrollment | null> {
    await delay(getRandomDelay())
    const db = getDatabase()
    return db.enrollments.find(e => e.id === enrollmentId) || null
  },

  async findEnrollmentByUserCourse(userId: string, courseId: string): Promise<Enrollment | null> {
    await delay(getRandomDelay())
    const db = getDatabase()
    return db.enrollments.find(e => e.userId === userId && e.courseId === courseId) || null
  },

  async enrollStudent(studentId: string, courseId: string): Promise<Enrollment> {
    await delay(getRandomDelay())
    const db = getDatabase()

    if (db.enrollments.some(e => e.userId === studentId && e.courseId === courseId)) {
      throw new Error('Already enrolled in this course')
    }

    const course = db.courses.find(c => c.id === courseId)
    if (!course) throw new Error('Course not found')

    const newEnrollment: Enrollment = {
      id: `enrollment-${Date.now()}`,
      userId: studentId,
      courseId,
      progress: 0,
      completedLessons: [],
      enrolledAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    }

    db.enrollments.push(newEnrollment)
    saveDatabase(db)
    return newEnrollment
  },

  async markLessonComplete(enrollmentId: string, lessonId: string): Promise<Enrollment> {
    await delay(getRandomDelay())
    const db = getDatabase()
    const enrollment = db.enrollments.find(e => e.id === enrollmentId)
    if (!enrollment) throw new Error('Enrollment not found')

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId)
    }

    const lessonsInCourse = db.lessons.filter(l => l.courseId === enrollment.courseId)
    if (lessonsInCourse.length > 0) {
      enrollment.progress = Math.round((enrollment.completedLessons.length / lessonsInCourse.length) * 100)
    }

    enrollment.lastAccessed = new Date().toISOString()
    saveDatabase(db)
    return enrollment
  },

  async updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<Enrollment> {
    await delay(getRandomDelay())
    const db = getDatabase()
    const enrollment = db.enrollments.find(e => e.id === enrollmentId)
    if (!enrollment) throw new Error('Enrollment not found')

    enrollment.progress = Math.min(100, Math.max(0, progress))
    enrollment.lastAccessed = new Date().toISOString()
    saveDatabase(db)
    return enrollment
  },

  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    await delay(getRandomDelay())
    const db = getDatabase()
    return db.enrollments.filter(e => e.userId === studentId)
  },

  async getInstructorEnrollments(instructorId: string): Promise<Enrollment[]> {
    await delay(getRandomDelay())
    const db = getDatabase()
    const instructorCourses = db.courses.filter(c => c.instructorId === instructorId)
    const courseIds = instructorCourses.map(c => c.id)
    return db.enrollments.filter(e => courseIds.includes(e.courseId))
  }
}
