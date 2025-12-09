import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { mockApi } from '@/api/mockApi'
import { User } from '@/data/mock'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { UserCog } from 'lucide-react'

export function RoleSwitcher() {
  const { user, switchUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const loadUsers = async () => {
    const allUsers = await mockApi.listUsers()
    setUsers(allUsers)
  }

  const handleSwitch = async (userId: string) => {
    await switchUser(userId)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (open) loadUsers()
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserCog className="h-4 w-4" />
          <span className="hidden sm:inline">Switch Role</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          DEV: Quick Role Switcher
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {users.map((u) => (
          <DropdownMenuItem
            key={u.id}
            onClick={() => handleSwitch(u.id)}
            disabled={user?.id === u.id}
            className="cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{u.name}</span>
                {user?.id === u.id && (
                  <span className="text-xs text-primary">(current)</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {u.email} • {u.role}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
