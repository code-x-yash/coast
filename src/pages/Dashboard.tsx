import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { mockCourses } from '@/data/mock'
import { BookOpen, Clock, Award, TrendingUp, Play } from 'lucide-react'

interface EnrolledCourse {
  id: string
  courseId: string
  progress: number
  enrolledAt: number
  lastAccessed: number
}

interface Course {
  id: string
  title: string
  thumbnailUrl: string
  category: string
  durationHours: number
}

interface DashboardProps {
  onNavigate: (page: string, courseId?: string) => void
  user: { id: string; email: string } | null
}

export default function Dashboard({ onNavigate, user }: DashboardProps) {
  const [enrolledCourses, setEnrolledCourses] = useState<Array<EnrolledCourse & Course>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      const raw = localStorage.getItem('enrollments')
      const map = raw ? JSON.parse(raw) : {}
      const userEnrolls: EnrolledCourse[] = (map[user.id] || [])
      const detailed = userEnrolls.map((enr) => {
        const course = mockCourses.find(c => c.id === enr.courseId)
        return course ? { ...enr, ...course } : { ...enr, title: '', thumbnailUrl: '', category: '', durationHours: 0 }
      })
      setEnrolledCourses(detailed.filter(c => c.title))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign in to access your dashboard</h2>
          <p className="text-muted-foreground mb-6">
            Track your progress and continue learning
          </p>
          <Button onClick={() => onNavigate('login')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  const totalCourses = enrolledCourses.length
  const completedCourses = enrolledCourses.filter(c => c.progress === 100).length
  const inProgressCourses = enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length
  const avgProgress = totalCourses > 0
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / totalCourses)
    : 0

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Learning Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">{totalCourses}</div>
              <p className="text-sm text-muted-foreground">Enrolled Courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">{completedCourses}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">{inProgressCourses}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">{avgProgress}%</div>
              <p className="text-sm text-muted-foreground">Avg Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Courses</CardTitle>
              <Button variant="outline" onClick={() => onNavigate('catalog')}>
                Browse More Courses
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-4 border rounded-lg">
                    <div className="w-32 h-20 bg-muted animate-pulse rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your learning journey by enrolling in a course
                </p>
                <Button onClick={() => onNavigate('catalog')}>
                  Explore Courses
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => onNavigate('learn', course.courseId)}
                  >
                    <div className="md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80'}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg font-semibold line-clamp-2">{course.title}</h3>
                          <Badge variant="secondary">{course.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                      </div>

                      <Button size="sm" className="w-full md:w-auto">
                        <Play className="mr-2 h-4 w-4" />
                        {course.progress === 0 ? 'Start Course' : course.progress === 100 ? 'Review Course' : 'Continue Learning'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
