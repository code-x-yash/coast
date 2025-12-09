import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { mockApi } from '@/api/mockApi'
import { Course, Enrollment } from '@/data/mock'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react'

interface StudentDashboardProps {
  onNavigate: (page: string, courseId?: string) => void
}

export default function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const userEnrollments = await mockApi.getStudentEnrollments(user.id)
      setEnrollments(userEnrollments)

      const allCourses = await mockApi.listCourses()
      const enrolledCourseIds = userEnrollments.map(e => e.courseId)
      const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id))
      setCourses(enrolledCourses)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    enrolled: enrollments.length,
    completed: enrollments.filter(e => e.progress === 100).length,
    inProgress: enrollments.filter(e => e.progress > 0 && e.progress < 100).length,
    avgProgress: enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
      : 0
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">My Learning Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress and continue your maritime education journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enrolled}</div>
              <p className="text-xs text-muted-foreground">
                Active enrollments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                Courses in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Courses completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProgress}%</div>
              <p className="text-xs text-muted-foreground">
                Overall progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Courses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Continue where you left off</CardDescription>
              </div>
              <Button onClick={() => onNavigate('catalog')} variant="outline">
                Browse Catalog
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No enrolled courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your learning journey by enrolling in a course
                </p>
                <Button onClick={() => onNavigate('catalog')}>
                  Browse Courses
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map(enrollment => {
                  const course = courses.find(c => c.id === enrollment.courseId)
                  if (!course) return null

                  return (
                    <div
                      key={enrollment.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{course.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {course.instructorName}
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress value={enrollment.progress} className="flex-1" />
                          <span className="text-sm font-medium">{enrollment.progress}%</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => onNavigate('learn', enrollment.courseId)}
                      >
                        {enrollment.progress === 0 ? 'Start' : 'Continue'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
