import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface User {
  id: string
  email: string
  name?: string
}

interface SignupProps {
  onNavigate: (page: string) => void
  onAuthSuccess: (user: User) => void
}

export default function Signup({ onNavigate, onAuthSuccess }: SignupProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirm) {
      setError('Please fill in all fields')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    const user: User = { id: `user-${Date.now()}`, email, name }
    localStorage.setItem('app_user', JSON.stringify(user))
    onAuthSuccess(user)
    onNavigate('dashboard')
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Create Account</Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account? <button type="button" className="underline" onClick={() => onNavigate('login')}>Sign in</button>
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Are you an institute? <button type="button" className="underline" onClick={() => onNavigate('register-institute')}>Register here</button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

