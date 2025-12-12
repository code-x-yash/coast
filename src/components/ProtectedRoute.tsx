import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: Array<'admin' | 'institute' | 'student'>
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    } else if (user.role === 'institute') {
      return <Navigate to="/institutes" replace />
    } else {
      return <Navigate to="/student" replace />
    }
  }

  return <>{children}</>
}
