import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, MapPin, Clock, Users, Download, AlertCircle, CheckCircle, BookOpen, Award, Filter } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { api, courseTypes, courseModes, Seafarer, CourseWithDetails, Booking, Certificate } from '@/services/api'

export default function SeafarerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [seafarer, setSeafarer] = useState<Seafarer | null>(null)
  const [courses, setCourses] = useState<CourseWithDetails[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [filteredCourses, setFilteredCourses] = useState<CourseWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const ALL_SENTINEL = '__all__' // sentinel value used for "All" items to avoid empty-string SelectItem

  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [modeFilter, setModeFilter] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [courses, searchQuery, cityFilter, typeFilter, modeFilter])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)

      const seafarerData = await api.getSeafarerByUserId(user.userid)
      setSeafarer(seafarerData)

      const allCourses = await api.listCourses()
      const institutes = await api.listInstitutes(true)
      const allBatches = await api.listBatches()

      const coursesWithDetails: CourseWithDetails[] = allCourses.map(course => ({
        ...course,
        institute: institutes.find(i => i.instid === course.instid),
        batches: allBatches.filter(b => b.courseid === course.courseid && b.batch_status === 'upcoming')
      }))

      setCourses(coursesWithDetails)

      if (seafarerData) {
        const seafarerBookings = await api.listBookings({ studid: seafarerData.studid })
        setBookings(seafarerBookings)

        const seafarerCertificates = await api.listCertificates(seafarerData.studid)
        setCertificates(seafarerCertificates)
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...courses]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.type.toLowerCase().includes(query)
      )
    }

    if (cityFilter) {
      filtered = filtered.filter(c => c.institute?.city === cityFilter)
    }

    if (typeFilter) {
      filtered = filtered.filter(c => c.type === typeFilter)
    }

    if (modeFilter) {
      filtered = filtered.filter(c => c.mode === modeFilter)
    }

    setFilteredCourses(filtered)
  }

  const handleBookCourse = async (batchid: string, amount: number) => {
    if (!seafarer) {
      toast({
        title: 'Error',
        description: 'Seafarer profile not found',
        variant: 'destructive'
      })
      return
    }

    try {
      const booking = await api.createBooking({
        studid: seafarer.studid,
        batchid,
        amount
      })

      await api.updatePaymentStatus(booking.bookid, 'completed')

      toast({
        title: 'Booking Successful!',
        description: `Confirmation Number: ${booking.confirmation_number}`,
      })

      loadDashboardData()
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const getCertificateStatus = (cert: Certificate) => {
    const expiryDate = new Date(cert.expiry_date)
    const today = new Date()
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return { status: 'expired', color: 'destructive', days: 0 }
    if (daysUntilExpiry < 90) return { status: 'expiring-soon', color: 'warning', days: daysUntilExpiry }
    return { status: 'valid', color: 'success', days: daysUntilExpiry }
  }

  const cities = [...new Set(courses.map(c => c.institute?.city).filter(Boolean))]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Seafarer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
            {seafarer?.rank && ` - ${seafarer.rank}`}
          </p>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Courses
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="h-4 w-4 mr-2" />
              My Bookings ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="h-4 w-4 mr-2" />
              Certificates ({certificates.length})
            </TabsTrigger>
            <TabsTrigger value="profile">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search Maritime Training Courses
                </CardTitle>
                <CardDescription>
                  Find and book accredited STCW and technical courses from verified institutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="md:col-span-4"
                  />

                  <Select value={cityFilter} onValueChange={(v) => setCityFilter(v === ALL_SENTINEL ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_SENTINEL}>All Cities</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city as string}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === ALL_SENTINEL ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_SENTINEL}>All Types</SelectItem>
                      {courseTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>     

                  <Select value={modeFilter} onValueChange={(v) => setModeFilter(v === ALL_SENTINEL ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Modes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_SENTINEL}>All Modes</SelectItem>
                      {courseModes.map(mode => (
                        <SelectItem key={mode} value={mode}>
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setCityFilter('')
                      setTypeFilter('')
                      setModeFilter('')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  Showing {filteredCourses.length} of {courses.length} courses
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.courseid} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {course.institute?.name}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{course.type}</Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                      <Badge variant="outline">{course.accreditation_ref}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{course.institute?.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Mode:</span>
                        <span className="capitalize">{course.mode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Fees:</span>
                        <span>₹{course.fees.toLocaleString()}</span>
                      </div>
                    </div>

                    {course.batches && course.batches.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Upcoming Batches:</p>
                        {course.batches.slice(0, 2).map((batch) => (
                          <div key={batch.batchid} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{batch.batch_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Users className="h-3 w-3" />
                                <span className="text-xs">
                                  {batch.seats_total - batch.seats_booked} seats available
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleBookCourse(batch.batchid, course.fees)}
                              disabled={batch.seats_booked >= batch.seats_total}
                            >
                              {batch.seats_booked >= batch.seats_total ? 'Full' : 'Book Now'}
                            </Button>
                          </div>
                        ))} 
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No courses found</p>
                  <p className="text-muted-foreground">Try adjusting your filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>
                  View your course bookings and payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">No bookings yet</p>
                    <p className="text-muted-foreground mb-4">Start by browsing available courses</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => {
                      const batch = courses.flatMap(c => c.batches || []).find(b => b.batchid === booking.batchid)
                      const course = courses.find(c => c.batches?.some(b => b.batchid === booking.batchid))

                      return (
                        <Card key={booking.bookid}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{course?.title}</h3>
                                <p className="text-sm text-muted-foreground">{batch?.batch_name}</p>
                                <div className="mt-3 space-y-1 text-sm">
                                  <p><span className="font-medium">Confirmation:</span> {booking.confirmation_number}</p>
                                  <p><span className="font-medium">Dates:</span> {batch && `${new Date(batch.start_date).toLocaleDateString()} - ${new Date(batch.end_date).toLocaleDateString()}`}</p>
                                  <p><span className="font-medium">Location:</span> {batch?.location}</p>
                                  <p><span className="font-medium">Amount:</span> ₹{booking.amount.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="text-right space-y-2">
                                <Badge variant={booking.payment_status === 'completed' ? 'default' : 'secondary'}>
                                  {booking.payment_status}
                                </Badge>
                                <Badge variant="outline">
                                  {booking.attendance_status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Certificates</CardTitle>
                <CardDescription>
                  Download your certificates and track validity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {certificates.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">No certificates yet</p>
                    <p className="text-muted-foreground">Complete a course to earn your certificate</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {certificates.map((cert) => {
                      const course = courses.find(c => c.courseid === cert.courseid)
                      const certStatus = getCertificateStatus(cert)

                      return (
                        <Card key={cert.certid}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{course?.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">Certificate No: {cert.cert_number}</p>
                                <div className="mt-3 space-y-1 text-sm">
                                  <p><span className="font-medium">Issued:</span> {new Date(cert.issue_date).toLocaleDateString()}</p>
                                  <p><span className="font-medium">Expires:</span> {new Date(cert.expiry_date).toLocaleDateString()}</p>
                                  {certStatus.status === 'expiring-soon' && (
                                    <p className="text-amber-600 flex items-center gap-2">
                                      <AlertCircle className="h-4 w-4" />
                                      Expires in {certStatus.days} days
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    {cert.dgshipping_uploaded ? (
                                      <Badge variant="default" className="bg-green-600">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Uploaded to DGShipping
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary">
                                        Pending DGShipping Upload
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Badge variant={certStatus.status === 'valid' ? 'default' : 'destructive'}>
                                  {certStatus.status.replace('-', ' ').toUpperCase()}
                                </Badge>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Seafarer Profile</CardTitle>
                <CardDescription>
                  Your maritime credentials and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {user?.name}</p>
                      <p><span className="font-medium">Email:</span> {user?.email}</p>
                      <p><span className="font-medium">Phone:</span> {user?.phone || 'Not provided'}</p>
                      {seafarer?.date_of_birth && (
                        <p><span className="font-medium">Date of Birth:</span> {new Date(seafarer.date_of_birth).toLocaleDateString()}</p>
                      )}
                      <p><span className="font-medium">Nationality:</span> {seafarer?.nationality || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Maritime Credentials</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">DGShipping ID:</span> {seafarer?.dgshipping_id || 'Not provided'}</p>
                      <p><span className="font-medium">Rank:</span> {seafarer?.rank || 'Not provided'}</p>
                      <p><span className="font-medium">COC Number:</span> {seafarer?.coc_number || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-4">Account Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-primary">{bookings.length}</p>
                        <p className="text-sm text-muted-foreground">Courses Booked</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-primary">{certificates.length}</p>
                        <p className="text-sm text-muted-foreground">Certificates</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-primary">
                          {certificates.filter(c => getCertificateStatus(c).status === 'valid').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Valid Certificates</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
