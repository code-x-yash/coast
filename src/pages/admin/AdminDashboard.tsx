import { useEffect, useState } from 'react'
import { mockApi } from '@/api/mockApi'
import { User, Course, Enrollment } from '@/data/mock'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react'

interface AdminDashboardProps {
  onNavigate: (page: string) => void
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [allUsers, allCourses, allEnrollments] = await Promise.all([
        mockApi.listUsers(),
        mockApi.listCourses(),
        mockApi.listEnrollments()
      ])
      setUsers(allUsers)
      setCourses(allCourses)
      setEnrollments(allEnrollments)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalUsers: users.length,
    instructors: users.filter(u => u.role === 'instructor').length,
    students: users.filter(u => u.role === 'student').length,
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.isPublished).length,
    draftCourses: courses.filter(c => !c.isPublished).length,
    totalEnrollments: enrollments.length,
    completedEnrollments: enrollments.filter(e => e.progress === 100).length
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
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and management tools
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.instructors} instructors, {stats.students} students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedCourses} published, {stats.draftCourses} draft
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedEnrollments} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalEnrollments > 0
                  ? Math.round((stats.completedEnrollments / stats.totalEnrollments) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall platform rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {stats.totalUsers} total users registered on the platform
                </p>
                <Button onClick={() => onNavigate('user-management')} className="w-full">
                  Manage Users
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
              <CardDescription>View and manage all courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {stats.totalCourses} courses available on the platform
                </p>
                <Button onClick={() => onNavigate('catalog')} className="w-full">
                  View All Courses
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
            <CardDescription>Latest courses on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.slice(0, 5).map(course => (
                <div
                  key={course.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-20 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{course.title}</h4>
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
                    <p className="text-xs text-muted-foreground">
                      by {course.instructorName} • {course.totalStudents} students
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('course', course.id)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
