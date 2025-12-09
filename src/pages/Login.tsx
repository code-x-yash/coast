import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface User {
  id: string
  email: string
  name?: string
}

interface LoginProps {
  onNavigate: (page: string) => void
  onAuthSuccess: (user: User) => void
}

export default function Login({ onNavigate, onAuthSuccess }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }

    const user: User = { id: `user-${Date.now()}`, email }
    localStorage.setItem('app_user', JSON.stringify(user))
    onAuthSuccess(user)
    onNavigate('dashboard')
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Sign In</Button>
              <p className="text-sm text-muted-foreground text-center">
                Don't have an account? <button type="button" className="underline" onClick={() => onNavigate('signup')}>Create one</button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

