import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Building2, BookOpen, Calendar, Users, Award, TrendingUp, Plus, Upload, CheckCircle, AlertCircle, AlertTriangle, Clock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { ReactivationRequestForm } from '@/components/ReactivationRequestForm'
import { api, courseTypes, courseModes, Institute, Course, Batch, Booking, Certificate, ReactivationRequest } from '@/services/api'

export default function InstructorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [institute, setInstitute] = useState<Institute | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCourseDialog, setShowCourseDialog] = useState(false)
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [reactivationRequest, setReactivationRequest] = useState<ReactivationRequest | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  const [courseForm, setCourseForm] = useState({
    title: '',
    type: 'STCW' as 'STCW' | 'Refresher' | 'Technical' | 'Other',
    duration: '',
    mode: 'offline' as 'offline' | 'online' | 'hybrid',
    fees: '',
    description: '',
    validity_months: '60',
    accreditation_ref: ''
  })

  const [batchForm, setBatchForm] = useState({
    batch_name: '',
    seats_total: '30',
    trainer: '',
    start_date: '',
    end_date: '',
    location: ''
  })

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)

      const instituteData = await api.getInstituteByUserId(user.id)
      setInstitute(instituteData)

      if (instituteData) {
        const expired = api.isInstituteExpired(instituteData)
        setIsExpired(expired)

        if (expired) {
          const pendingRequest = await api.getReactivationRequestByInstId(instituteData.instid)
          setReactivationRequest(pendingRequest)
        }

        const instituteCourses = await api.listCourses({ instid: instituteData.instid })
        setCourses(instituteCourses)

        const allBatches = await api.listBatches()
        const instituteBatches = allBatches.filter(b =>
          instituteCourses.some(c => c.courseid === b.courseid)
        )
        setBatches(instituteBatches)

        const allBookings = await api.listBookings()
        const instituteBookings = allBookings.filter(b =>
          instituteBatches.some(batch => batch.batchid === b.batchid)
        )
        setBookings(instituteBookings)

        const allCerts = await api.listCertificates()
        const instituteCerts = allCerts.filter(c =>
          instituteCourses.some(course => course.courseid === c.courseid)
        )
        setCertificates(instituteCerts)
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

  const handleCreateCourse = async () => {
    if (!institute) return

    try {
      await api.createCourse({
        ...courseForm,
        instid: institute.instid,
        fees: parseFloat(courseForm.fees),
        validity_months: parseInt(courseForm.validity_months)
      })

      toast({
        title: 'Course Created',
        description: 'Your course has been added successfully'
      })

      setShowCourseDialog(false)
      setCourseForm({
        title: '',
        type: 'STCW',
        duration: '',
        mode: 'offline',
        fees: '',
        description: '',
        validity_months: '60',
        accreditation_ref: ''
      })
      loadDashboardData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleCreateBatch = async () => {
    if (!selectedCourse) return

    try {
      await api.createBatch({
        courseid: selectedCourse,
        ...batchForm,
        seats_total: parseInt(batchForm.seats_total)
      })

      toast({
        title: 'Batch Created',
        description: 'New batch has been scheduled successfully'
      })

      setShowBatchDialog(false)
      setBatchForm({
        batch_name: '',
        seats_total: '30',
        trainer: '',
        start_date: '',
        end_date: '',
        location: ''
      })
      loadDashboardData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const getAccreditationStatus = () => {
    if (!institute) return { status: 'Unknown', color: 'secondary', icon: AlertCircle }

    const validTo = new Date(institute.valid_to)
    const today = new Date()
    const daysUntilExpiry = Math.floor((validTo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (institute.verified_status !== 'verified') {
      return { status: 'Pending Verification', color: 'warning', icon: AlertCircle }
    }
    if (daysUntilExpiry < 0) {
      return { status: 'Expired', color: 'destructive', icon: AlertCircle }
    }
    if (daysUntilExpiry < 90) {
      return { status: `Expiring in ${daysUntilExpiry} days`, color: 'warning', icon: AlertCircle }
    }
    return { status: 'Verified & Active', color: 'success', icon: CheckCircle }
  }

  const totalRevenue = bookings
    .filter(b => b.payment_status === 'completed')
    .reduce((sum, b) => sum + b.amount, 0)

  const accreditationStatus = getAccreditationStatus()
  const StatusIcon = accreditationStatus.icon

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

  if (!institute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Institute profile not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{institute.name}</h1>
              <p className="text-muted-foreground">Accreditation: {institute.accreditation_no}</p>
            </div>
            <Badge variant={accreditationStatus.color as any} className="text-lg px-4 py-2">
              <StatusIcon className="h-4 w-4 mr-2" />
              {accreditationStatus.status}
            </Badge>
          </div>

          {isExpired && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Institute Accreditation Expired</AlertTitle>
              <AlertDescription className="mt-2">
                {reactivationRequest ? (
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Your reactivation request is pending admin review
                    </p>
                    <p className="text-sm">
                      Submitted on: {new Date(reactivationRequest.submitted_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm mt-2">
                      All course and batch creation features are temporarily disabled until your accreditation is renewed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p>
                      Your institute accreditation expired on {new Date(institute.valid_to).toLocaleDateString()}.
                      All course and batch creation features are temporarily disabled.
                    </p>
                    <p>
                      Submit a reactivation request with your updated accreditation details to restore full access.
                    </p>
                    <div className="mt-4">
                      <ReactivationRequestForm
                        institute={institute}
                        onSubmitSuccess={loadDashboardData}
                      />
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Courses</p>
                    <p className="text-2xl font-bold">{courses.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Batches</p>
                    <p className="text-2xl font-bold">{batches.filter(b => b.batch_status === 'upcoming').length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{bookings.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">₹{(totalRevenue / 100000).toFixed(1)}L</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Course Management</h2>
                <p className="text-muted-foreground">Manage your training courses</p>
              </div>
              <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
                <DialogTrigger asChild>
                  <Button disabled={isExpired}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>Add a new maritime training course</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Course Title *</Label>
                      <Input
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        placeholder="e.g., Basic Safety Training (BST) - STCW"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Course Type *</Label>
                        <Select value={courseForm.type} onValueChange={(value: any) => setCourseForm({ ...courseForm, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {courseTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Duration *</Label>
                        <Input
                          value={courseForm.duration}
                          onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                          placeholder="e.g., 5 Days"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Mode *</Label>
                        <Select value={courseForm.mode} onValueChange={(value: any) => setCourseForm({ ...courseForm, mode: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {courseModes.map(mode => (
                              <SelectItem key={mode} value={mode}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Fees (₹) *</Label>
                        <Input
                          type="number"
                          value={courseForm.fees}
                          onChange={(e) => setCourseForm({ ...courseForm, fees: e.target.value })}
                          placeholder="18500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Validity (Months)</Label>
                        <Input
                          type="number"
                          value={courseForm.validity_months}
                          onChange={(e) => setCourseForm({ ...courseForm, validity_months: e.target.value })}
                          placeholder="60"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Accreditation Reference</Label>
                        <Input
                          value={courseForm.accreditation_ref}
                          onChange={(e) => setCourseForm({ ...courseForm, accreditation_ref: e.target.value })}
                          placeholder="STCW-VI/1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        placeholder="Course description..."
                        rows={3}
                      />
                    </div>

                    <Button onClick={handleCreateCourse} className="w-full">
                      Create Course
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {courses.map(course => (
                <Card key={course.courseid}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {course.type} • {course.duration} • {course.mode}
                        </CardDescription>
                      </div>
                      <Badge>{course.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Fees:</span>
                      <span className="font-semibold">₹{course.fees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Batches:</span>
                      <span className="font-semibold">
                        {batches.filter(b => b.courseid === course.courseid).length}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedCourse(course.courseid)
                        setShowBatchDialog(true)
                      }}
                      disabled={isExpired}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Batch
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {courses.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No courses yet</p>
                  <p className="text-muted-foreground mb-4">Create your first maritime training course</p>
                  <Button onClick={() => setShowCourseDialog(true)} disabled={isExpired}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="batches">
            <Card>
              <CardHeader>
                <CardTitle>Batch Schedule</CardTitle>
                <CardDescription>Manage course batches and enrollment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batches.map(batch => {
                    const course = courses.find(c => c.courseid === batch.courseid)
                    const batchBookings = bookings.filter(b => b.batchid === batch.batchid)

                    return (
                      <Card key={batch.batchid}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{batch.batch_name}</h3>
                              <p className="text-sm text-muted-foreground">{course?.title}</p>
                              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="font-medium">Dates:</span> {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Trainer:</span> {batch.trainer}
                                </div>
                                <div>
                                  <span className="font-medium">Location:</span> {batch.location}
                                </div>
                                <div>
                                  <span className="font-medium">Seats:</span> {batch.seats_booked}/{batch.seats_total}
                                </div>
                              </div>
                            </div>
                            <Badge variant={batch.batch_status === 'upcoming' ? 'default' : 'secondary'}>
                              {batch.batch_status}
                            </Badge>
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-2">Enrollments: {batchBookings.length}</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">View Students</Button>
                              <Button size="sm" variant="outline">Mark Attendance</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {batches.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">No batches scheduled</p>
                    <p className="text-muted-foreground">Create a course first, then add batches</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>Manage student attendance and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">No students enrolled</p>
                      <p className="text-muted-foreground">Students will appear here once they book your courses</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map(booking => {
                        const batch = batches.find(b => b.batchid === booking.batchid)
                        const course = courses.find(c => c.courseid === batch?.courseid)

                        return (
                          <div key={booking.bookid} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{course?.title}</p>
                              <p className="text-sm text-muted-foreground">{batch?.batch_name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Booking: {booking.confirmation_number}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={booking.payment_status === 'completed' ? 'default' : 'secondary'}>
                                {booking.payment_status}
                              </Badge>
                              <Badge variant="outline">
                                {booking.attendance_status}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Management</CardTitle>
                <CardDescription>Issue and manage course certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certificates.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">No certificates issued</p>
                      <p className="text-muted-foreground">Issue certificates to students who complete courses</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {certificates.map(cert => {
                        const course = courses.find(c => c.courseid === cert.courseid)

                        return (
                          <div key={cert.certid} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{cert.cert_number}</p>
                              <p className="text-sm text-muted-foreground">{course?.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Issued: {new Date(cert.issue_date).toLocaleDateString()} •
                                Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {cert.dgshipping_uploaded ? (
                                <Badge className="bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  DGShipping Uploaded
                                </Badge>
                              ) : (
                                <Button size="sm" variant="outline">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload to DGShipping
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
              <DialogDescription>Schedule a new batch for this course</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Batch Name *</Label>
                <Input
                  value={batchForm.batch_name}
                  onChange={(e) => setBatchForm({ ...batchForm, batch_name: e.target.value })}
                  placeholder="BST-JAN-2025-01"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={batchForm.start_date}
                    onChange={(e) => setBatchForm({ ...batchForm, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={batchForm.end_date}
                    onChange={(e) => setBatchForm({ ...batchForm, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Seats *</Label>
                  <Input
                    type="number"
                    value={batchForm.seats_total}
                    onChange={(e) => setBatchForm({ ...batchForm, seats_total: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trainer</Label>
                  <Input
                    value={batchForm.trainer}
                    onChange={(e) => setBatchForm({ ...batchForm, trainer: e.target.value })}
                    placeholder="Capt. Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={batchForm.location}
                  onChange={(e) => setBatchForm({ ...batchForm, location: e.target.value })}
                  placeholder="Training facility address"
                />
              </div>

              <Button onClick={handleCreateBatch} className="w-full">
                Create Batch
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
