import { useState, useEffect } from 'react'
import { maritimeApi, Institute, Course, Booking, Certificate, User } from '@/api/maritimeMockApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, BookOpen, Users, TrendingUp, Award, CheckCircle, XCircle, Clock, AlertCircle, DollarSign, FileCheck } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface AdminDashboardProps {
  onNavigate: (page: string) => void
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [institutes, setInstitutes] = useState<Institute[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const [instituteData, courseData, bookingData, certData, userData] = await Promise.all([
        maritimeApi.listInstitutes(false),
        maritimeApi.listCourses(),
        maritimeApi.listBookings(),
        maritimeApi.listCertificates(),
        maritimeApi.listAllUsers()
      ])

      setInstitutes(instituteData)
      setCourses(courseData)
      setBookings(bookingData)
      setCertificates(certData)
      setUsers(userData)
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

  const handleVerifyInstitute = async (instid: string, status: 'verified' | 'rejected') => {
    try {
      await maritimeApi.updateInstituteStatus(instid, status)

      toast({
        title: status === 'verified' ? 'Institute Verified' : 'Institute Rejected',
        description: `The institute has been ${status}`,
      })

      setShowVerificationDialog(false)
      setSelectedInstitute(null)
      loadDashboardData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const analytics = maritimeApi.getAnalytics()

  const pendingInstitutes = institutes.filter(i => i.verified_status === 'pending')
  const verifiedInstitutes = institutes.filter(i => i.verified_status === 'verified')
  const totalRevenue = bookings
    .filter(b => b.payment_status === 'completed')
    .reduce((sum, b) => sum + b.amount, 0)
  const dgshippingCompliance = certificates.length > 0
    ? Math.round((certificates.filter(c => c.dgshipping_uploaded).length / certificates.length) * 100)
    : 0

  const getInstituteExpiry = (institute: Institute) => {
    const validTo = new Date(institute.valid_to)
    const today = new Date()
    const daysUntilExpiry = Math.floor((validTo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return { status: 'Expired', color: 'destructive', days: 0 }
    if (daysUntilExpiry < 90) return { status: `Expiring in ${daysUntilExpiry} days`, color: 'warning', days: daysUntilExpiry }
    return { status: 'Valid', color: 'success', days: daysUntilExpiry }
  }

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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Platform Administration</h1>
              <p className="text-muted-foreground">Maritime Training Course Aggregator</p>
            </div>
            {pendingInstitutes.length > 0 && (
              <Badge variant="warning" className="text-lg px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                {pendingInstitutes.length} Pending Verification
              </Badge>
            )}
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Institutes</p>
                    <p className="text-2xl font-bold">{institutes.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {verifiedInstitutes.length} verified
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Courses</p>
                    <p className="text-2xl font-bold">{courses.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {courses.filter(c => c.status === 'active').length} active
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{bookings.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {bookings.filter(b => b.payment_status === 'completed').length} completed
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Platform Revenue</p>
                    <p className="text-2xl font-bold">₹{(totalRevenue / 100000).toFixed(1)}L</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total collections
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">DGShipping Upload</p>
                    <p className="text-2xl font-bold">{dgshippingCompliance}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Compliance rate
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="verification" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="verification">
              Institute Verification
              {pendingInstitutes.length > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingInstitutes.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="institutes">All Institutes</TabsTrigger>
            <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
            <TabsTrigger value="certificates">Certificate Management</TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Institute Verification</CardTitle>
                <CardDescription>
                  Review and verify new training institutes seeking platform registration
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingInstitutes.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p className="text-lg font-medium mb-2">All caught up!</p>
                    <p className="text-muted-foreground">No institutes pending verification</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingInstitutes.map(institute => {
                      const instituteUser = users.find(u => u.userid === institute.userid)
                      const instituteCourses = courses.filter(c => c.instid === institute.instid)

                      return (
                        <Card key={institute.instid} className="border-amber-200 bg-amber-50">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="font-semibold text-lg">{institute.name}</h3>
                                  <Badge variant="warning">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending Verification
                                  </Badge>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-2">
                                    <p>
                                      <span className="font-medium">Accreditation No:</span>{' '}
                                      {institute.accreditation_no}
                                    </p>
                                    <p>
                                      <span className="font-medium">Valid Period:</span>{' '}
                                      {new Date(institute.valid_from).toLocaleDateString()} -{' '}
                                      {new Date(institute.valid_to).toLocaleDateString()}
                                    </p>
                                    <p>
                                      <span className="font-medium">Contact Email:</span>{' '}
                                      {institute.contact_email}
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <p>
                                      <span className="font-medium">Contact Person:</span>{' '}
                                      {instituteUser?.name || 'N/A'}
                                    </p>
                                    <p>
                                      <span className="font-medium">Location:</span>{' '}
                                      {institute.city}, {institute.state}
                                    </p>
                                    <p>
                                      <span className="font-medium">Registered:</span>{' '}
                                      {new Date(institute.created_at!).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                {institute.address && (
                                  <p className="text-sm mt-3">
                                    <span className="font-medium">Address:</span> {institute.address}
                                  </p>
                                )}

                                {instituteCourses.length > 0 && (
                                  <Alert className="mt-3">
                                    <AlertDescription>
                                      This institute has already created {instituteCourses.length} course(s) pending approval
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4 pt-4 border-t">
                              <Button
                                onClick={() => {
                                  setSelectedInstitute(institute)
                                  setShowVerificationDialog(true)
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify & Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleVerifyInstitute(institute.instid, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
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

          <TabsContent value="institutes">
            <Card>
              <CardHeader>
                <CardTitle>All Training Institutes</CardTitle>
                <CardDescription>
                  Complete list of registered institutes on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {institutes.map(institute => {
                    const instituteCourses = courses.filter(c => c.instid === institute.instid)
                    const expiry = getInstituteExpiry(institute)

                    return (
                      <Card key={institute.instid}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{institute.name}</h3>
                                <Badge variant={
                                  institute.verified_status === 'verified' ? 'default' :
                                  institute.verified_status === 'pending' ? 'warning' : 'destructive'
                                }>
                                  {institute.verified_status}
                                </Badge>
                                <Badge variant={expiry.color as any}>
                                  {expiry.status}
                                </Badge>
                              </div>

                              <div className="grid md:grid-cols-3 gap-4 text-sm mt-3">
                                <div>
                                  <p className="text-muted-foreground">Accreditation</p>
                                  <p className="font-medium">{institute.accreditation_no}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Location</p>
                                  <p className="font-medium">{institute.city}, {institute.state}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Courses</p>
                                  <p className="font-medium">{instituteCourses.length} courses</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Institute Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Total Registered</span>
                    <span className="text-xl font-bold">{analytics.totalInstitutes}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Verified & Active</span>
                    <span className="text-xl font-bold text-green-600">{analytics.verifiedInstitutes}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Pending Verification</span>
                    <span className="text-xl font-bold text-amber-600">{analytics.pendingInstitutes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rejected</span>
                    <span className="text-xl font-bold text-red-600">{analytics.rejectedInstitutes}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Total Courses</span>
                    <span className="text-xl font-bold">{analytics.totalCourses}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">STCW Courses</span>
                    <span className="text-xl font-bold">{courses.filter(c => c.type === 'STCW').length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Active Courses</span>
                    <span className="text-xl font-bold text-green-600">{analytics.activeCourses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Course Fee</span>
                    <span className="text-xl font-bold">₹{analytics.avgCourseFee.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student & Booking Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Total Students</span>
                    <span className="text-xl font-bold">{analytics.totalStudents}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Total Bookings</span>
                    <span className="text-xl font-bold">{analytics.totalBookings}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Completed Bookings</span>
                    <span className="text-xl font-bold text-green-600">{analytics.completedBookings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Bookings</span>
                    <span className="text-xl font-bold text-amber-600">{analytics.pendingBookings}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue & Certificate Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Total Revenue</span>
                    <span className="text-xl font-bold">₹{(analytics.totalRevenue / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Certificates Issued</span>
                    <span className="text-xl font-bold">{analytics.totalCertificates}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">DGShipping Uploaded</span>
                    <span className="text-xl font-bold text-green-600">{analytics.certificatesUploaded}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Upload Compliance</span>
                    <span className="text-xl font-bold">{dgshippingCompliance}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Institutes</CardTitle>
                <CardDescription>Based on bookings and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {verifiedInstitutes.slice(0, 5).map((institute, index) => {
                    const instituteCourses = courses.filter(c => c.instid === institute.instid)
                    const instituteBookings = bookings.filter(b => {
                      const course = courses.find(c => instituteCourses.some(ic => ic.courseid === c.courseid))
                      return course?.instid === institute.instid
                    })
                    const instituteRevenue = instituteBookings
                      .filter(b => b.payment_status === 'completed')
                      .reduce((sum, b) => sum + b.amount, 0)

                    return (
                      <div key={institute.instid} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{institute.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {instituteCourses.length} courses • {instituteBookings.length} bookings
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">₹{(instituteRevenue / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Management</CardTitle>
                <CardDescription>
                  Monitor certificate issuance and DGShipping upload compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{certificates.length}</p>
                      <p className="text-sm text-muted-foreground">Total Certificates</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6 text-center">
                      <FileCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-green-600">
                        {certificates.filter(c => c.dgshipping_uploaded).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Uploaded to DGShipping</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6 text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                      <p className="text-2xl font-bold text-amber-600">
                        {certificates.filter(c => !c.dgshipping_uploaded).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Pending Upload</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  {certificates.map(cert => {
                    const course = courses.find(c => c.courseid === cert.courseid)
                    const institute = institutes.find(i => i.instid === course?.instid)

                    return (
                      <div key={cert.certid} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{cert.cert_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {course?.title} • {institute?.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Issued: {new Date(cert.issue_date).toLocaleDateString()} •
                            Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={cert.dgshipping_uploaded ? 'default' : 'secondary'}>
                            {cert.dgshipping_uploaded ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Uploaded
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                          <Badge variant={cert.status === 'valid' ? 'default' : 'destructive'}>
                            {cert.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Institute</DialogTitle>
              <DialogDescription>
                Confirm verification of {selectedInstitute?.name}
              </DialogDescription>
            </DialogHeader>

            {selectedInstitute && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    By verifying this institute, you confirm that:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>DGShipping accreditation number is valid</li>
                      <li>Accreditation validity dates are correct</li>
                      <li>Institute documents have been reviewed</li>
                      <li>Institute can start offering courses on the platform</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="border rounded-lg p-4 space-y-2 bg-muted">
                  <p><span className="font-medium">Institute:</span> {selectedInstitute.name}</p>
                  <p><span className="font-medium">Accreditation:</span> {selectedInstitute.accreditation_no}</p>
                  <p><span className="font-medium">Valid Until:</span> {new Date(selectedInstitute.valid_to).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedInstitute && handleVerifyInstitute(selectedInstitute.instid, 'verified')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify & Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
