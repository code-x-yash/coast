import { useState } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { RoleGuard } from '@/components/RoleGuard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HomePage from '@/pages/HomePage'
import CourseCatalog from '@/pages/CourseCatalog'
import CourseDetail from '@/pages/CourseDetail'
import LearningInterface from '@/pages/LearningInterface'
import SignIn from '@/pages/SignIn'
import SignUpStudent from '@/pages/SignUpStudent'
import SignUpInstructor from '@/pages/SignUpInstructor'
import StudentDashboard from '@/pages/student/StudentDashboard'
import InstructorDashboard from '@/pages/instructor/InstructorDashboard'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import NotFound from '@/pages/NotFound'
import { Toaster } from '@/components/ui/toaster'

type Page =
  | 'home'
  | 'catalog'
  | 'course'
  | 'learn'
  | 'sign-in'
  | 'sign-up-student'
  | 'sign-up-instructor'
  | 'student-dashboard'
  | 'instructor-dashboard'
  | 'admin-dashboard'
  | 'user-management'
  | 'course-editor'
  | 'not-found'

function AppContent() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          return 'admin-dashboard'
        case 'instructor':
          return 'instructor-dashboard'
        case 'student':
          return 'student-dashboard'
        default:
          return 'home'
      }
    }
    return 'home'
  })
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  const handleNavigate = (page: string, courseId?: string) => {
    setCurrentPage(page as Page)
    if (courseId) {
      setSelectedCourseId(courseId)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />

      case 'catalog':
        return <CourseCatalog onNavigate={handleNavigate} />

      case 'course':
        return selectedCourseId ? (
          <CourseDetail courseId={selectedCourseId} onNavigate={handleNavigate} />
        ) : (
          <CourseCatalog onNavigate={handleNavigate} />
        )

      case 'learn':
        return selectedCourseId ? (
          <LearningInterface courseId={selectedCourseId} onNavigate={handleNavigate} />
        ) : (
          <StudentDashboard onNavigate={handleNavigate} />
        )

      case 'sign-in':
        return <SignIn onNavigate={handleNavigate} />

      case 'sign-up-student':
        return <SignUpStudent onNavigate={handleNavigate} />

      case 'sign-up-instructor':
        return <SignUpInstructor onNavigate={handleNavigate} />

      case 'student-dashboard':
        return (
          <RoleGuard allowedRoles={['student']} onNavigate={handleNavigate}>
            <StudentDashboard onNavigate={handleNavigate} />
          </RoleGuard>
        )

      case 'instructor-dashboard':
        return (
          <RoleGuard allowedRoles={['instructor']} onNavigate={handleNavigate}>
            <InstructorDashboard onNavigate={handleNavigate} />
          </RoleGuard>
        )

      case 'admin-dashboard':
        return (
          <RoleGuard allowedRoles={['admin']} onNavigate={handleNavigate}>
            <AdminDashboard onNavigate={handleNavigate} />
          </RoleGuard>
        )

      case 'user-management':
        return (
          <RoleGuard allowedRoles={['admin']} onNavigate={handleNavigate}>
            <AdminDashboard onNavigate={handleNavigate} />
          </RoleGuard>
        )

      case 'course-editor':
        return (
          <RoleGuard allowedRoles={['instructor', 'admin']} onNavigate={handleNavigate}>
            <InstructorDashboard onNavigate={handleNavigate} />
          </RoleGuard>
        )

      default:
        return <NotFound onNavigate={handleNavigate} />
    }
  }

  const showLayout = currentPage !== 'learn' && currentPage !== 'sign-in' && currentPage !== 'sign-up-student' && currentPage !== 'sign-up-instructor'

  return (
    <div className="flex flex-col min-h-screen">
      {showLayout && <Navbar onNavigate={handleNavigate} currentPage={currentPage} />}
      <main className={showLayout ? 'flex-1' : ''}>
        {renderPage()}
      </main>
      {showLayout && <Footer />}
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
