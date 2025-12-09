import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Role } from '@/data/mock'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: Role[]
  onNavigate?: (page: string) => void
}

export function RoleGuard({ children, allowedRoles, onNavigate }: RoleGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    if (onNavigate) {
      onNavigate('sign-in')
      return null
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-yellow-600" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You must be signed in to access this page.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!allowedRoles.includes(user.role)) {
    const dashboardMap: Record<Role, string> = {
      admin: 'admin-dashboard',
      instructor: 'instructor-dashboard',
      student: 'student-dashboard'
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page. This area is restricted to{' '}
              {allowedRoles.join(', ')} roles only.
            </p>
            <Button
              onClick={() => onNavigate ? onNavigate(dashboardMap[user.role]) : window.location.href = '/'}
              className="w-full"
            >
              Go to My Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
