import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface SignInProps {
  onNavigate: (page: string) => void
}

const demoCredentials = [
  { email: 'admin@maritimetraining.in', password: 'hashed_password', role: 'Super Admin', description: 'Platform administration & institute verification' },
  { email: 'admin@mumbaimaritime.edu.in', password: 'hashed_password', role: 'Institute', description: 'Mumbai Maritime Institute' },
  { email: 'contact@chennaiacademy.in', password: 'hashed_password', role: 'Institute', description: 'Chennai Maritime Academy' },
  { email: 'rajesh.sharma@seafarer.in', password: 'hashed_password', role: 'Seafarer', description: 'Third Officer - Browse & book courses' },
  { email: 'priya.singh@seafarer.in', password: 'hashed_password', role: 'Seafarer', description: 'Second Officer - Browse & book courses' },
]

export default function SignIn({ onNavigate }: SignInProps) {
  const { signIn, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  if (user) {
    const dashboardMap = {
      admin: 'admin-dashboard',
      instructor: 'instructor-dashboard',
      student: 'student-dashboard'
    }
    onNavigate(dashboardMap[user.role as keyof typeof dashboardMap] || 'home')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
    toast({
      title: 'Copied!',
      description: 'Credential copied to clipboard',
    })
  }

  const quickLogin = (email: string, password: string) => {
    setEmail(email)
    setPassword(password)
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Maritime Training Platform</h1>
            <p className="text-muted-foreground">
              Sign in to access accredited maritime training courses
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Sign In Form */}
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <div className="text-center space-y-2 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate('sign-up-student')}
                        className="flex-1"
                      >
                        Student Signup
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate('register-institute')}
                        className="flex-1"
                      >
                        Institute Signup
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Demo Credentials */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Demo Credentials
                </CardTitle>
                <CardDescription>
                  Use these credentials to explore different roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoCredentials.map((cred, index) => (
                    <div
                      key={index}
                      className="p-3 bg-background rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => quickLogin(cred.email, cred.password)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{cred.role}</span>
                            <span className="text-xs text-muted-foreground">
                              {cred.description}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                                {cred.email}
                              </code>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyToClipboard(cred.email, index * 2)
                                }}
                              >
                                {copiedIndex === index * 2 ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                                {cred.password}
                              </code>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyToClipboard(cred.password, index * 2 + 1)
                                }}
                              >
                                {copiedIndex === index * 2 + 1 ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Alert className="mt-4">
                  <AlertDescription className="text-xs">
                    <strong>Tip:</strong> Click any credential card to auto-fill the form, or use the copy buttons to copy individual values.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
