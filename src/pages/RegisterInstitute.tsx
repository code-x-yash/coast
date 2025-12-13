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
import { Building2, GraduationCap, Upload } from 'lucide-react'
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
  const { registerInstitute } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    instituteName: '',
    houseNumber: '',
    streetName: '',
    landmark: '',
    city: '',
    state: '',
    country: 'India',
    postcode: '',
    licenseNumber: '',
    issuingAuthority: 'DG Shipping',
    customerCareEmail: '',
    customerCarePhone: '',
    valid_from: '',
    valid_to: '',
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [licenseFiles, setLicenseFiles] = useState<File[]>([])
  const [masterCourses, setMasterCourses] = useState<MasterCourse[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selfDeclaration, setSelfDeclaration] = useState(false)
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

      if (data && data.length > 0) {
        setMasterCourses(data)
      } else {
        setCoursesError('No active courses available')
      }
    } catch (err: any) {
      console.error('Failed to load master courses:', err)
      setCoursesError(err.message || 'Failed to load courses. Please refresh the page.')
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 20 * 1024 * 1024) {
        setError('Logo file size must not exceed 20MB')
        return
      }
      setLogoFile(file)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 20 * 1024 * 1024) {
        setError('Banner file size must not exceed 20MB')
        return
      }
      setBannerFile(file)
    }
  }

  const handleLicenseFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024)

      if (oversizedFiles.length > 0) {
        setError('Each license document must not exceed 10MB')
        return
      }

      if (files.length > 5) {
        setError('Maximum 5 license documents allowed')
        return
      }

      setLicenseFiles(files)
      setError('')
    }
  }

  const removeLicenseFile = (index: number) => {
    setLicenseFiles(prev => prev.filter((_, i) => i !== index))
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

    if (!formData.licenseNumber) {
      setError('License/Resolution number is required')
      return
    }

    //if (!formData.valid_from || !formData.valid_to) {
    //  setError('Accreditation validity dates are required')
    //  return
    //}

    if (!logoFile) {
      setError('Institute logo is required')
      return
    }

    if (!bannerFile) {
      setError('Institute banner is required')
      return
    }

    if (licenseFiles.length === 0) {
      setError('Please upload at least one license document')
      return
    }

    if (selectedCourses.length === 0) {
      setError('Please select at least one course you want to offer')
      return
    }

    if (!selfDeclaration) {
      setError('Please accept the self declaration to proceed')
      return
    }

    setLoading(true)

    try {
      await registerInstitute({
        ...formData,
        selectedCourses,
        logoFile,
        bannerFile,
        licenseFiles
      })
      toast({
        title: 'Registration Successful!',
        description: 'Please check your email for account verification.',
      })
      navigate('/sign-in')
    } catch (err: any) {
      setError(err.message || 'Failed to register institute')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.instituteName &&
      formData.houseNumber &&
      formData.streetName &&
      formData.city &&
      formData.state &&
      formData.postcode &&
      formData.licenseNumber &&
      formData.valid_from &&
      formData.valid_to &&
      logoFile &&
      bannerFile &&
      licenseFiles.length > 0 &&
      selectedCourses.length > 0 &&
      selfDeclaration
    )
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 via-slate-50 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
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
                Complete all sections to register your institute. Your application will be reviewed by our admin team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Section 1: Institute Registration Fields */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">1. Institute Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="instituteName">Institute Name *</Label>
                    <Input
                      id="instituteName"
                      name="instituteName"
                      value={formData.instituteName}
                      onChange={handleChange}
                      placeholder="Mumbai Maritime Training Institute"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="houseNumber">House / Flat No. *</Label>
                      <Input
                        id="houseNumber"
                        name="houseNumber"
                        value={formData.houseNumber}
                        onChange={handleChange}
                        placeholder="Plot 45"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="streetName">Street Name *</Label>
                      <Input
                        id="streetName"
                        name="streetName"
                        value={formData.streetName}
                        onChange={handleChange}
                        placeholder="Wadala Port Trust, Reay Road"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark *</Label>
                    <Input
                      id="landmark"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="Near Port Trust Building"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Maharashtra"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="India">India</option>
                        <option value="UAE">UAE</option>
                        <option value="Singapore">Singapore</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode *</Label>
                      <Input
                        id="postcode"
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleChange}
                        placeholder="400037"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Logo & Banner */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">2. Institute Logo & Banner</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="logo">Institute Logo * (Max 20MB)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="logo"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleLogoChange}
                          required
                        />
                        {logoFile && (
                          <span className="text-sm text-green-600">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, JPEG only
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="banner">Institute Banner * (Max 20MB)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="banner"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleBannerChange}
                          required
                        />
                        {bannerFile && (
                          <span className="text-sm text-green-600">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, JPEG only
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Admin Contact */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">3. Admin Contact</h3>

                  <div className="space-y-2">
                    <Label htmlFor="name">Contact Person Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Dr. Rajesh Kumar"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 22 2345 6789"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        OTP verification will be required
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@maritimeinstitute.edu.in"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Email verification will be required
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Customer Care Contact */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">4. Customer Care Contact</h3>
                  <p className="text-sm text-muted-foreground">
                    Separate from admin contact. Students will use these for support queries.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerCarePhone">Phone Number</Label>
                      <Input
                        id="customerCarePhone"
                        name="customerCarePhone"
                        type="tel"
                        value={formData.customerCarePhone}
                        onChange={handleChange}
                        placeholder="+91 22 2345 6790"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerCareEmail">Email</Label>
                      <Input
                        id="customerCareEmail"
                        name="customerCareEmail"
                        type="email"
                        value={formData.customerCareEmail}
                        onChange={handleChange}
                        placeholder="support@maritimeinstitute.edu.in"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: License Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">5. License Details</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License / Resolution Number *</Label>
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="DGS-MMI-2019-001"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issuingAuthority">Issuing Authority *</Label>
                      <Input
                        id="issuingAuthority"
                        name="issuingAuthority"
                        value={formData.issuingAuthority}
                        onChange={handleChange}
                        required
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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
                </div>

                {/* Section 6: Course Offerings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg border-b pb-2 flex-1">6. Course Offerings</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select courses your institute wants to offer. Admin will review and approve.
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
                          No courses available
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
                                  className="flex items-start gap-3 p-2 rounded hover:bg-muted/50"
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
                    <p className="text-sm font-medium text-primary">
                      ✓ Selected {selectedCourses.length} {selectedCourses.length === 1 ? 'course' : 'courses'}
                    </p>
                  )}
                </div>

                {/* Section 7: License Documentation Upload */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">7. License Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your DG Shipping license documents. Supported formats: PDF, PNG, JPG, JPEG
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="licenseFiles">License Documents * (Max 5 files, 10MB each)</Label>
                    <Input
                      id="licenseFiles"
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/jpg"
                      onChange={handleLicenseFilesChange}
                      multiple
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload DG Shipping certificate, license documents, etc.
                    </p>
                  </div>

                  {licenseFiles.length > 0 && (
                    <div className="border rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium">Selected Documents ({licenseFiles.length}/5):</p>
                      {licenseFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-primary" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLicenseFile(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 8: Self Declaration */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">8. Self Declaration</h3>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Checkbox
                      id="selfDeclaration"
                      checked={selfDeclaration}
                      onCheckedChange={(checked) => setSelfDeclaration(checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="selfDeclaration"
                        className="cursor-pointer text-sm"
                      >
                        I hereby declare that all information provided is true and accurate to the best of my knowledge.
                        I understand that providing false information may result in rejection of this application and/or
                        termination of services.
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Section 9: Account Security */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">9. Account Security</h3>
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
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Admin Review:</strong> Your registration will be reviewed by our admin team.
                    You will receive notification via email and WhatsApp once verified.
                  </AlertDescription>
                </Alert>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Section 9: Form Actions */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    size="lg"
                    disabled={loading || !isFormValid()}
                  >
                    {loading ? 'Submitting Registration...' : 'Register Institute'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all fields?')) {
                        window.location.reload()
                      }
                    }}
                  >
                    Reset
                  </Button>
                </div>

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
