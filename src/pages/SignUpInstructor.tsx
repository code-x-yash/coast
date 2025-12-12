import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'

interface SignUpInstructorProps {
  onNavigate: (page: string) => void
}

export default function SignUpInstructor({ onNavigate }: SignUpInstructorProps) {
  const { signUpInstructor, user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    instructorTitle: '',
    bio: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    onNavigate('instructor-dashboard')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    const hasUpperCase = /[A-Z]/.test(formData.password)
    const hasLowerCase = /[a-z]/.test(formData.password)
    const hasNumber = /[0-9]/.test(formData.password)

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number')
      return
    }

    setLoading(true)

    try {
      await signUpInstructor(formData)
      toast({
        title: 'Welcome to SeaLearn!',
        description: 'Your instructor account has been created successfully.',
      })
      onNavigate('instructor-dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Instructor Registration</h1>
            <p className="text-muted-foreground">
              Share your expertise with maritime professionals worldwide
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Instructor Account</CardTitle>
              <CardDescription>
                Join our community of expert maritime educators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Capt. John Smith"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructorTitle">Professional Title</Label>
                  <Input
                    id="instructorTitle"
                    name="instructorTitle"
                    type="text"
                    value={formData.instructorTitle}
                    onChange={handleChange}
                    placeholder="Master Mariner, Chief Engineer, etc."
                  />
                  <p className="text-xs text-muted-foreground">
                    Your rank or professional title
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Brief Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Share your experience and expertise..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tell students about your background
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Instructor Account'}
                </Button>

                <div className="text-center space-y-2 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('sign-in')}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Looking to learn?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('sign-up-student')}
                      className="text-primary hover:underline font-medium"
                    >
                      Student signup
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
