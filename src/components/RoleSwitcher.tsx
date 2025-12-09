import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { maritimeApi, User } from '@/api/maritimeMockApi'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserCog, Building2, GraduationCap, Shield } from 'lucide-react'

export function RoleSwitcher() {
  const { user, switchUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const loadUsers = async () => {
    const allUsers = await maritimeApi.listAllUsers()
    setUsers(allUsers)
  }

  const handleSwitch = async (userId: string) => {
    await switchUser(userId)
    setIsOpen(false)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-primary" />
      case 'institute':
        return <Building2 className="h-4 w-4 text-blue-600" />
      case 'student':
        return <GraduationCap className="h-4 w-4 text-green-600" />
      default:
        return <UserCog className="h-4 w-4" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary text-primary-foreground'
      case 'institute':
        return 'bg-blue-100 text-blue-700'
      case 'student':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Platform Admin'
      case 'institute':
        return 'Training Institute'
      case 'student':
        return 'Seafarer/Student'
      default:
        return role
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (open) loadUsers()
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-white/90 hover:bg-white hover:text-dark border-white/30">
          <UserCog className="h-4 w-4" />
          <span className="hidden sm:inline">Switch Role</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Demo Mode: Quick Role Switching
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-1">
          {users.map((u) => (
            <DropdownMenuItem
              key={u.userid}
              onClick={() => handleSwitch(u.userid)}
              disabled={user?.userid === u.userid}
                  className="cursor-pointer p-3 focus:bg-muted focus:text-dark"
            >
              <div className="flex items-start gap-3 w-full">
                <div className="mt-0.5">
                  {getRoleIcon(u.role)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{u.name}</span>
                    {user?.userid === u.userid && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mb-1.5">
                    {u.email}
                  </div>
                  <Badge className={`text-xs ${getRoleBadgeColor(u.role)}`}>
                    {getRoleLabel(u.role)}
                  </Badge>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
