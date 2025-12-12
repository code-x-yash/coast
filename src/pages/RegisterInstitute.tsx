import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { Building2, GraduationCap } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface MasterCourse {
  master_course_id: string
  course_name: string
  course_code: string
  category: string
  description: string
}

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
  const [masterCourses, setMasterCourses] = useState<MasterCourse[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [coursesError, setCoursesError] = useState('')

  useEffect(() => {
    loadMasterCourses()
  }, [])

  const loadMasterCourses = async () => {
    try {
      setCoursesError('')
      const { data, error } = await supabase
        .from('master_courses')
        .select('master_course_id, course_name, course_code, category, description')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('course_name', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      setMasterCourses(data || [])
    } catch (err: any) {
      console.error('Failed to load master courses:', err)
      setCoursesError(err.message || 'Failed to load courses. Please refresh the page.')
    } finally {
      setLoadingCourses(false)
    }
  }

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

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const groupedCourses = masterCourses.reduce((acc, course) => {
    if (!acc[course.category]) {
      acc[course.category] = []
    }
    acc[course.category].push(course)
    return acc
  }, {} as Record<string, MasterCourse[]>)

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

    if (selectedCourses.length === 0) {
      setError('Please select at least one course you want to offer')
      return
    }

    setLoading(true)

    try {
      await registerInstitute({
        ...formData,
        selectedCourses
      })
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
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-sm">Select Courses to Offer</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose which maritime training courses your institute would like to offer. Your applications will be reviewed by admin.
                  </p>

                  {loadingCourses ? (
                    <div className="py-8 text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading courses...</p>
                    </div>
                  ) : coursesError ? (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {coursesError}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadMasterCourses}
                          className="ml-2"
                        >
                          Retry
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
                      {Object.keys(groupedCourses).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No courses available at the moment
                        </p>
                      ) : (
                        Object.entries(groupedCourses).map(([category, courses]) => (
                          <div key={category} className="space-y-3">
                            <h4 className="font-medium text-sm text-primary border-b pb-2">
                              {category}
                            </h4>
                            <div className="space-y-2">
                              {courses.map((course) => (
                                <div
                                  key={course.master_course_id}
                                  className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 transition-colors"
                                >
                                  <Checkbox
                                    id={course.master_course_id}
                                    checked={selectedCourses.includes(course.master_course_id)}
                                    onCheckedChange={() => handleCourseToggle(course.master_course_id)}
                                  />
                                  <div className="flex-1">
                                    <Label
                                      htmlFor={course.master_course_id}
                                      className="cursor-pointer font-medium text-sm"
                                    >
                                      {course.course_name}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      {course.course_code}
                                      {course.description && ` • ${course.description}`}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {selectedCourses.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Selected {selectedCourses.length} {selectedCourses.length === 1 ? 'course' : 'courses'}
                    </p>
                  )}
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
