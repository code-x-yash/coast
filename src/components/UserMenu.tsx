import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, LogOut } from 'lucide-react'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleDashboard = () => {
    switch (user.role) {
      case 'admin':
        return '/admin'
      case 'institute':
        return '/institutes'
      case 'student':
        return '/student'
      default:
        return '/'
    }
  }

  const getRoleLabel = () => {
    switch (user.role) {
      case 'admin':
        return 'Platform Admin'
      case 'institute':
        return 'Training Institute'
      case 'student':
        return 'Seafarer/Student'
      default:
        return user.role
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-primary font-medium">
              {getRoleLabel()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate(getRoleDashboard())}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
