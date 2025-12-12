import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: Array<'admin' | 'institute' | 'student'>
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>
}
