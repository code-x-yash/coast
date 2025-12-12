import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { Building2 } from 'lucide-react'

export default function RegisterInstitute() {
  const navigate = useNavigate()
  const { registerInstitute, user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    instituteName: '',
    accreditation_no: '',
    valid_from: '',
    valid_to: '',
    address: '',
    city: '',
    state: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate('/institutes')
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

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!formData.accreditation_no) {
      setError('Accreditation number is required')
      return
    }

    if (!formData.valid_from || !formData.valid_to) {
      setError('Accreditation validity dates are required')
      return
    }

    setLoading(true)

    try {
      await registerInstitute(formData)
      toast({
        title: 'Registration Successful!',
        description: 'Your institute has been registered. Awaiting admin verification.',
      })
      navigate('/institutes')
    } catch (err: any) {
      setError(err.message || 'Failed to register institute')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 via-slate-50 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Institute Registration</h1>
            <p className="text-muted-foreground">
              Register your maritime training institute on our platform
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Register Training Institute</CardTitle>
              <CardDescription>
                Complete this form to register your institute. Your application will be reviewed by our admin team for verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Contact Person Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Contact Person Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Dr. Rajesh Kumar"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Contact Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@maritimeinstitute.edu.in"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">Contact Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 22 2345 6789"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Institute Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="instituteName">Institute Name *</Label>
                      <Input
                        id="instituteName"
                        name="instituteName"
                        type="text"
                        value={formData.instituteName}
                        onChange={handleChange}
                        placeholder="Mumbai Maritime Training Institute"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accreditation_no">DGShipping Accreditation Number *</Label>
                        <Input
                          id="accreditation_no"
                          name="accreditation_no"
                          type="text"
                          value={formData.accreditation_no}
                          onChange={handleChange}
                          placeholder="DGS-MMI-2019-001"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Your official DGShipping accreditation number
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="valid_from">Valid From *</Label>
                            <Input
                              id="valid_from"
                              name="valid_from"
                              type="date"
                              value={formData.valid_from}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="valid_to">Valid To *</Label>
                            <Input
                              id="valid_to"
                              name="valid_to"
                              type="date"
                              value={formData.valid_to}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Accreditation validity period
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Institute Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Plot 45, Wadala Port Trust, Reay Road"
                        rows={2}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Mumbai"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          type="text"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="Maharashtra"
                        />
                      </div>
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

                <Alert>
                  <AlertDescription>
                    <strong>Note:</strong> Your institute registration will be reviewed by our admin team. You will be notified once your institute is verified and approved.
                  </AlertDescription>
                </Alert>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Submitting Registration...' : 'Register Institute'}
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
                    Are you a seafarer?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/sign-up')}
                      className="text-primary hover:underline font-medium"
                    >
                      Register as seafarer
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
