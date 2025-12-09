import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { mockApi } from '@/api/mockApi'
import { Course, Enrollment } from '@/data/mock'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Users, TrendingUp, PlusCircle } from 'lucide-react'

interface InstructorDashboardProps {
  onNavigate: (page: string, courseId?: string) => void
}

export default function InstructorDashboard({ onNavigate }: InstructorDashboardProps) {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const allCourses = await mockApi.listCourses()
      const instructorCourses = allCourses.filter(c => c.instructorId === user.id)
      setCourses(instructorCourses)

      const allEnrollments = await mockApi.getInstructorEnrollments(user.id)
      setEnrollments(allEnrollments)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.isPublished).length,
    totalStudents: new Set(enrollments.map(e => e.userId)).size,
    totalEnrollments: enrollments.length
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your courses and track student progress
            </p>
          </div>
          <Button onClick={() => onNavigate('course-editor')} size="lg">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedCourses} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Unique learners
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                Total enrollments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {enrollments.length > 0
                  ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Student progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Courses */}
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Manage and edit your courses</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first course and start teaching
                </p>
                <Button onClick={() => onNavigate('course-editor')}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map(course => {
                  const courseEnrollments = enrollments.filter(e => e.courseId === course.id)

                  return (
                    <div
                      key={course.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{course.title}</h4>
                          {course.isPublished ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                              Draft
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {courseEnrollments.length} students enrolled • ${course.price}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => onNavigate('course', course.id)}
                        >
                          View
                        </Button>
                        <Button
                          onClick={() => onNavigate('course-editor', course.id)}
                        >
                          Edit
                        </Button>
                      </div>
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
