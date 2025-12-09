import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HomePage from '@/pages/HomePage'
import CourseCatalog from '@/pages/CourseCatalog'
import CourseDetail from '@/pages/CourseDetail'
import LearningInterface from '@/pages/LearningInterface'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import RegisterInstitute from '@/pages/RegisterInstitute'
import { Toaster } from '@/components/ui/toaster'

type Page = 'home' | 'catalog' | 'course' | 'learn' | 'dashboard' | 'login' | 'signup' | 'register-institute'

type User = { id: string; email: string; name?: string } | null

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [user, setUser] = useState<User>(() => {
    try {
      const raw = localStorage.getItem('app_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

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
          <CourseDetail courseId={selectedCourseId} onNavigate={handleNavigate} user={user} />
        ) : (
          <CourseCatalog onNavigate={handleNavigate} />
        )
      case 'learn':
        return selectedCourseId ? (
          <LearningInterface courseId={selectedCourseId} onNavigate={handleNavigate} user={user} />
        ) : (
          <Dashboard onNavigate={handleNavigate} user={user} />
        )
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} user={user} />
      case 'login':
        return <Login onNavigate={handleNavigate} onAuthSuccess={(u) => setUser(u)} />
      case 'signup':
            return <Signup onNavigate={handleNavigate} onAuthSuccess={(u) => setUser(u)} />
      case 'register-institute':
        return <RegisterInstitute onNavigate={handleNavigate} onAuthSuccess={(u) => setUser(u)} />
      default:
        return <HomePage onNavigate={handleNavigate} />
    }
  }

  const showLayout = currentPage !== 'learn'

  return (
    <div className="flex flex-col min-h-screen">
      {showLayout && <Navbar onNavigate={handleNavigate} currentPage={currentPage} user={user} onLogout={() => { localStorage.removeItem('app_user'); setUser(null); }} />}
      <main className={showLayout ? 'flex-1' : ''}>
        {renderPage()}
      </main>
      {showLayout && <Footer />}
      <Toaster />
    </div>
  )
}

export default App 
