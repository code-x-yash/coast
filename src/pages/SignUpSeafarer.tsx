import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Anchor } from 'lucide-react'

const maritimeRanks = [
  'Deck Cadet', 'Third Officer', 'Second Officer', 'Chief Officer', 'Captain',
  'Engine Cadet', 'Fourth Engineer', 'Third Engineer', 'Second Engineer', 'Chief Engineer'
]

export default function SignUpSeafarer() {
  const navigate = useNavigate()
  const { signUpStudent, user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dgshipping_id: '',
    rank: '',
    coc_number: '',
    date_of_birth: '',
    nationality: 'Indian'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate('/seafarer')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
        debugger;
        await signUpStudent(formData)
      toast({
        title: 'Welcome to Maritime Training Platform!',
        description: 'Your seafarer account has been created successfully.',
      })
      navigate('/seafarer')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 via-slate-50 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Seafarer Registration</h1>
            <p className="text-muted-foreground">
              Create your account to access maritime training courses
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Seafarer Account</CardTitle>
              <CardDescription>
                Register to browse and book accredited maritime training courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Rajesh Kumar Sharma"
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
                        placeholder="rajesh@seafarer.in"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Maritime Credentials</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dgshipping_id">DGShipping ID</Label>
                      <Input
                        id="dgshipping_id"
                        name="dgshipping_id"
                        type="text"
                        value={formData.dgshipping_id}
                        onChange={handleChange}
                        placeholder="IND-2020-JAN-0089456"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your DGShipping registration ID
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rank">Rank / Position</Label>
                      <Select value={formData.rank} onValueChange={(value) => handleSelectChange('rank', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your rank" />
                        </SelectTrigger>
                        <SelectContent>
                          {maritimeRanks.map((rank) => (
                            <SelectItem key={rank} value={rank}>
                              {rank}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coc_number">Certificate of Competency (COC) Number</Label>
                      <Input
                        id="coc_number"
                        name="coc_number"
                        type="text"
                        value={formData.coc_number}
                        onChange={handleChange}
                        placeholder="COC-II-0089456"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        name="nationality"
                        type="text"
                        value={formData.nationality}
                        onChange={handleChange}
                        placeholder="Indian"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Account Security</h3>
                  <div className="grid md:grid-cols-2 gap-4">
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
                        Must be at least 6 characters
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
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Seafarer Account'}
                </Button>

                <div className="text-center space-y-2 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/sign-in')}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Representing a training institute?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/register-institute')}
                      className="text-primary hover:underline font-medium"
                    >
                      Register your institute
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
