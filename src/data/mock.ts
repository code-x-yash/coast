export type Course = {
  id: string
  title: string
  description: string
  instructorName: string
  instructorTitle?: string
  category: string
  level: string
  durationHours: number
  price: number
  rating: number
  totalStudents: number
  thumbnailUrl: string
  isFeatured?: string
  whatYouWillLearn?: string
  requirements?: string
}

export type Lesson = {
  id: string
  courseId: string
  title: string
  description: string
  orderIndex: number
  durationMinutes: number
  content?: string
  isPreview?: string
}

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Bridge Resource Management',
    description: 'Enhance watchkeeping, decision-making, and team coordination on the bridge.',
    instructorName: 'Capt. A. Sharma',
    instructorTitle: 'Master Mariner',
    category: 'Navigation',
    level: 'Intermediate',
    durationHours: 12,
    price: 149,
    rating: 4.7,
    totalStudents: 1200,
    thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80&auto=format&fit=crop',
    isFeatured: '1',
    whatYouWillLearn: JSON.stringify([
      'Bridge team communication',
      'Situational awareness',
      'Standard operating procedures'
    ]),
    requirements: JSON.stringify([
      'Basic seamanship knowledge',
      'Familiarity with COLREGs'
    ])
  },
  {
    id: 'course-2',
    title: 'Marine Electrical Systems',
    description: 'Understand shipboard electrical systems and safe maintenance practices.',
    instructorName: 'E/O K. Patel',
    instructorTitle: 'Chief Electrical Officer',
    category: 'Engineering',
    level: 'Advanced',
    durationHours: 16,
    price: 199,
    rating: 4.6,
    totalStudents: 950,
    thumbnailUrl: 'https://images.unsplash.com/photo-1540960149653-14e2f2f1e5ad?w=800&q=80&auto=format&fit=crop',
    isFeatured: '1'
  },
  {
    id: 'course-3',
    title: 'ISPS Code & Ship Security',
    description: 'Implement ship security plans and comply with ISPS requirements.',
    instructorName: 'SSO R. Menon',
    category: 'Safety',
    level: 'Beginner',
    durationHours: 8,
    price: 99,
    rating: 4.4,
    totalStudents: 1500,
    thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-9844b1e5d5d3?w=800&q=80&auto=format&fit=crop',
    isFeatured: '1'
  }
]

export const mockLessons: Lesson[] = [
  { id: 'lesson-1', courseId: 'course-1', title: 'Team Roles on Bridge', description: 'Define roles and responsibilities.', orderIndex: 1, durationMinutes: 20 },
  { id: 'lesson-2', courseId: 'course-1', title: 'Situational Awareness', description: 'Maintain awareness under stress.', orderIndex: 2, durationMinutes: 25 },
  { id: 'lesson-3', courseId: 'course-1', title: 'Emergency Procedures', description: 'Coordinate during emergencies.', orderIndex: 3, durationMinutes: 30 },

  { id: 'lesson-4', courseId: 'course-2', title: 'Power Distribution', description: 'Shipboard power systems overview.', orderIndex: 1, durationMinutes: 30 },
  { id: 'lesson-5', courseId: 'course-2', title: 'Safety Practices', description: 'Lock-out tag-out and PPE.', orderIndex: 2, durationMinutes: 25 },
  { id: 'lesson-6', courseId: 'course-2', title: 'Troubleshooting', description: 'Diagnose common faults.', orderIndex: 3, durationMinutes: 35 },

  { id: 'lesson-7', courseId: 'course-3', title: 'ISPS Overview', description: 'Background and requirements.', orderIndex: 1, durationMinutes: 20 },
  { id: 'lesson-8', courseId: 'course-3', title: 'Security Levels', description: 'Level 1–3 procedures.', orderIndex: 2, durationMinutes: 25 },
  { id: 'lesson-9', courseId: 'course-3', title: 'Ship Security Plan', description: 'Implementation and drills.', orderIndex: 3, durationMinutes: 30 }
]

export const findCourse = (id: string) => mockCourses.find(c => c.id === id) || null
export const listLessonsForCourse = (courseId: string) => mockLessons.filter(l => l.courseId === courseId).sort((a,b) => a.orderIndex - b.orderIndex)

