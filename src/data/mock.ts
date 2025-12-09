export type Role = 'admin' | 'instructor' | 'student'

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: Role
  avatar?: string
  bio?: string
  createdAt: string
}

export interface Course {
  id: string
  title: string
  description: string
  instructorId: string
  instructorName: string
  instructorTitle?: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  durationHours: number
  price: number
  rating: number
  totalStudents: number
  thumbnailUrl: string
  isFeatured: boolean
  isPublished: boolean
  whatYouWillLearn: string[]
  requirements: string[]
  createdAt: string
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description: string
  orderIndex: number
  durationMinutes: number
  contentType: 'video' | 'text' | 'image'
  contentUrl?: string
  transcript?: string
  resources?: string[]
  createdAt: string
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  progress: number
  completedLessons: string[]
  enrolledAt: string
  lastAccessed: string
}

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@demo.test',
    password: 'password',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    bio: 'Platform Administrator',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'instructor-1',
    email: 'instructor@demo.test',
    password: 'password',
    name: 'Capt. A. Sharma',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    bio: 'Master Mariner, 20+ years bridge experience',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'instructor-2',
    email: 'instructor2@demo.test',
    password: 'password',
    name: 'E/O K. Patel',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    bio: 'Chief Electrical Officer, Marine Engineering Specialist',
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'student-1',
    email: 'student@demo.test',
    password: 'password',
    name: 'Rahul Verma',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    bio: 'Maritime Professional pursuing advanced certifications',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'student-2',
    email: 'student2@demo.test',
    password: 'password',
    name: 'Priya Singh',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    bio: 'Deck cadet, continuing maritime education',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Bridge Resource Management',
    description: 'Enhance watchkeeping, decision-making, and team coordination on the bridge. Learn best practices for bridge team management and communication protocols.',
    instructorId: 'instructor-1',
    instructorName: 'Capt. A. Sharma',
    instructorTitle: 'Master Mariner',
    category: 'Navigation',
    level: 'Intermediate',
    durationHours: 12,
    price: 149,
    rating: 4.7,
    totalStudents: 1200,
    thumbnailUrl: 'https://cdn.pixabay.com/photo/2019/11/30/13/45/oil-industry-4663282_1280.jpg',
    isFeatured: true,
    isPublished: true,
    whatYouWillLearn: [
      'Bridge team communication protocols',
      'Situational awareness techniques',
      'Standard operating procedures',
      'Emergency response coordination'
    ],
    requirements: [
      'Basic seamanship knowledge',
      'Familiarity with COLREGs',
      'Deck cadet or higher'
    ],
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'course-2',
    title: 'Marine Electrical Systems',
    description: 'Understand shipboard electrical systems and safe maintenance practices. Comprehensive coverage of power distribution, safety, and troubleshooting.',
    instructorId: 'instructor-2',
    instructorName: 'E/O K. Patel',
    instructorTitle: 'Chief Electrical Officer',
    category: 'Engineering',
    level: 'Advanced',
    durationHours: 16,
    price: 199,
    rating: 4.6,
    totalStudents: 950,
    thumbnailUrl: 'https://cdn.pixabay.com/photo/2019/11/30/13/45/oil-industry-4663282_1280.jpg',
    isFeatured: true,
    isPublished: true,
    whatYouWillLearn: [
      'Shipboard power distribution systems',
      'Safety practices and PPE',
      'Fault diagnosis and troubleshooting',
      'Maintenance procedures'
    ],
    requirements: [
      'Basic electrical knowledge',
      'Engineer officer rank or equivalent',
      'Experience with marine engines'
    ],
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'course-3',
    title: 'ISPS Code & Ship Security',
    description: 'Implement ship security plans and comply with ISPS requirements. Detailed guidance on security levels and effective procedures.',
    instructorId: 'instructor-1',
    instructorName: 'Capt. A. Sharma',
    category: 'Safety',
    level: 'Beginner',
    durationHours: 8,
    price: 99,
    rating: 4.4,
    totalStudents: 1500,
    thumbnailUrl: 'https://cdn.pixabay.com/photo/2019/11/30/13/45/oil-industry-4663282_1280.jpg',
    isFeatured: true,
    isPublished: true,
    whatYouWillLearn: [
      'ISPS Code overview and background',
      'Security levels 1-3 procedures',
      'Ship Security Plan implementation',
      'Drills and exercises'
    ],
    requirements: [
      'Basic maritime knowledge',
      'Any maritime role'
    ],
    createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'course-4',
    title: 'Advanced Fire Safety at Sea',
    description: 'Master fire prevention, detection, and response procedures for maritime vessels.',
    instructorId: 'instructor-2',
    instructorName: 'E/O K. Patel',
    category: 'Safety',
    level: 'Intermediate',
    durationHours: 10,
    price: 129,
    rating: 4.5,
    totalStudents: 800,
    thumbnailUrl: 'https://cdn.pixabay.com/photo/2019/11/30/13/45/oil-industry-4663282_1280.jpg',
    isFeatured: false,
    isPublished: true,
    whatYouWillLearn: [
      'Fire types and extinguishing agents',
      'Fire detection systems',
      'Emergency evacuation procedures',
      'Damage control'
    ],
    requirements: [
      'Basic fire safety knowledge',
      'Maritime professional certification'
    ],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'course-5',
    title: 'Cargo Operations Management (Draft)',
    description: 'Coming soon - Learn cargo handling, stowage, and documentation.',
    instructorId: 'instructor-1',
    instructorName: 'Capt. A. Sharma',
    category: 'Operations',
    level: 'Intermediate',
    durationHours: 14,
    price: 159,
    rating: 0,
    totalStudents: 0,
    thumbnailUrl: 'https://cdn.pixabay.com/photo/2019/11/30/13/45/oil-industry-4663282_1280.jpg',
    isFeatured: false,
    isPublished: false,
    whatYouWillLearn: [
      'Cargo stowage planning',
      'Weight distribution',
      'Documentation requirements'
    ],
    requirements: [
      'Navigation or engineering background'
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export const mockLessons: Lesson[] = [
  {
    id: 'lesson-1',
    courseId: 'course-1',
    title: 'Team Roles on Bridge',
    description: 'Define roles and responsibilities of each bridge team member.',
    orderIndex: 1,
    durationMinutes: 20,
    contentType: 'video',
    transcript: 'Team roles discussion...',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lesson-2',
    courseId: 'course-1',
    title: 'Situational Awareness',
    description: 'Maintain awareness under stress and complex conditions.',
    orderIndex: 2,
    durationMinutes: 25,
    contentType: 'video',
    createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lesson-3',
    courseId: 'course-1',
    title: 'Emergency Procedures',
    description: 'Coordinate during emergencies and critical situations.',
    orderIndex: 3,
    durationMinutes: 30,
    contentType: 'text',
    createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lesson-4',
    courseId: 'course-1',
    title: 'Communication Protocols',
    description: 'Standard bridge communication methods and best practices.',
    orderIndex: 4,
    durationMinutes: 22,
    contentType: 'video',
    createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lesson-5',
    courseId: 'course-2',
    title: 'Power Distribution Systems',
    description: 'Overview of shipboard power generation and distribution.',
    orderIndex: 1,
    durationMinutes: 30,
    contentType: 'video',
    createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lesson-6',
    courseId: 'course-2',
    title: 'Safety Practices',
    description: 'Lock-out tag-out and personal protective equipment.',
    orderIndex: 2,
    durationMinutes: 25,
    contentType: 'text',
    createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lesson-7',
    courseId: 'course-2',
    title: 'Troubleshooting',
    description: 'Diagnose common electrical faults.',
    orderIndex: 3,
    durationMinutes: 35,
    contentType: 'video',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lesson-8',
    courseId: 'course-3',
    title: 'ISPS Overview',
    description: 'Background and requirements of ISPS Code.',
    orderIndex: 1,
    durationMinutes: 20,
    contentType: 'video',
    createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lesson-9',
    courseId: 'course-3',
    title: 'Security Levels',
    description: 'Level 1–3 procedures and implementation.',
    orderIndex: 2,
    durationMinutes: 25,
    contentType: 'video',
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lesson-10',
    courseId: 'course-3',
    title: 'Ship Security Plan',
    description: 'Implementation and conducting drills.',
    orderIndex: 3,
    durationMinutes: 30,
    contentType: 'text',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lesson-11',
    courseId: 'course-4',
    title: 'Fire Types and Extinguishing',
    description: 'Classification and suppression techniques.',
    orderIndex: 1,
    durationMinutes: 28,
    contentType: 'video',
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lesson-12',
    courseId: 'course-4',
    title: 'Detection Systems',
    description: 'Fire alarm and detection systems.',
    orderIndex: 2,
    durationMinutes: 22,
    contentType: 'text',
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export const mockEnrollments: Enrollment[] = [
  {
    id: 'enrollment-1',
    userId: 'student-1',
    courseId: 'course-1',
    progress: 75,
    completedLessons: ['lesson-1', 'lesson-2', 'lesson-3'],
    enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'enrollment-2',
    userId: 'student-1',
    courseId: 'course-3',
    progress: 100,
    completedLessons: ['lesson-8', 'lesson-9', 'lesson-10'],
    enrolledAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'enrollment-3',
    userId: 'student-2',
    courseId: 'course-1',
    progress: 33,
    completedLessons: ['lesson-1'],
    enrolledAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'enrollment-4',
    userId: 'student-2',
    courseId: 'course-2',
    progress: 50,
    completedLessons: ['lesson-5', 'lesson-6'],
    enrolledAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export const getAllUsers = () => [...mockUsers]
export const getAllCourses = () => [...mockCourses]
export const getAllLessons = () => [...mockLessons]
export const getAllEnrollments = () => [...mockEnrollments]
export const findUser = (id: string) => mockUsers.find(u => u.id === id) || null
export const findCourse = (id: string) => mockCourses.find(c => c.id === id) || null
export const findLesson = (id: string) => mockLessons.find(l => l.id === id) || null
export const findEnrollment = (id: string) => mockEnrollments.find(e => e.id === id) || null
export const findUserByEmail = (email: string) => mockUsers.find(u => u.email === email) || null
export const listLessonsForCourse = (courseId: string) =>
  mockLessons.filter(l => l.courseId === courseId).sort((a, b) => a.orderIndex - b.orderIndex)
