import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import CourseCatalog from '@/pages/CourseCatalog'
import CourseDetail from '@/pages/CourseDetail'
import LearningInterface from '@/pages/LearningInterface'
import SignIn from '@/pages/SignIn'
import SignUpSeafarer from '@/pages/SignUpSeafarer'
import RegisterInstitute from '@/pages/RegisterInstitute'
import SeafarerDashboard from '@/pages/seafarer/SeafarerDashboard'
import InstructorDashboard from '@/pages/instructor/InstructorDashboard'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import NotFound from '@/pages/NotFound'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="courses" element={<CourseCatalog />} />
            <Route path="course/:courseId" element={<CourseDetail />} />
          </Route>

          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUpSeafarer />} />
          <Route path="/register-institute" element={<RegisterInstitute />} />

          <Route path="/seafarer" element={<Layout />}>
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SeafarerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="learn/:courseId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <LearningInterface />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/institutes" element={<Layout />}>
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={['institute']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/admin" element={<Layout />}>
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
