import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { courseService, type Course } from '@/services/courses'
import { useAuth } from '@/hooks/useAuth'
import { CheckCircle2, ArrowLeft, MapPin, Calendar, Clock, Phone, Mail, Ship, Building2, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [batches, setBatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<any>(null)
  const [enrolling, setEnrolling] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (courseId) {
      loadCourseData()
    }
  }, [courseId])

  const loadCourseData = async () => {
    if (!courseId) return

    setIsLoading(true)
    try {
      const courseData = await courseService.getCourseById(courseId)
      if (courseData) {
        setCourse(courseData)
        const batchesData = await courseService.getCourseBatches(courseId)
        setBatches(batchesData || [])
      }
    } catch (error) {
      console.error('Failed to load course:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnrollClick = () => {
    if (!user) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to enroll in this course.',
      })
      navigate('/sign-in')
      return
    }

    if (batches.length === 0) {
      toast({
        title: 'No Batches Available',
        description: 'There are no active batches for this course at the moment.',
        variant: 'destructive'
      })
      return
    }

    setShowBatchDialog(true)
  }

  const handleBatchSelect = (batch: any) => {
    setSelectedBatch(batch)
  }

  const handleConfirmEnrollment = async () => {
    if (!selectedBatch || !user || !courseId) return

    setEnrolling(true)
    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('studid')
        .eq('userid', user.id)
        .maybeSingle()

      if (studentError) throw studentError
      if (!studentData) {
        toast({
          title: 'Profile Incomplete',
          description: 'Redirecting to complete your seafarer profile...',
        })
        setTimeout(() => {
          navigate('/complete-profile')
        }, 1500)
        return
      }

      const bookingData = {
        studid: studentData.studid,
        batchid: selectedBatch.batchid,
        booking_date: new Date().toISOString(),
        payment_status: 'pending',
        amount: course?.fees || 0
      }

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])

      if (bookingError) throw bookingError

      toast({
        title: 'Enrollment Successful!',
        description: 'Your booking has been created. Please proceed to payment.',
      })

      setShowBatchDialog(false)
      setSelectedBatch(null)

      setTimeout(() => {
        navigate('/seafarer')
      }, 2000)

    } catch (error: any) {
      console.error('Enrollment failed:', error)
      toast({
        title: 'Enrollment Failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive'
      })
    } finally {
      setEnrolling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="h-8 w-24 bg-muted rounded animate-pulse mb-6" />
          <div className="h-12 w-2/3 bg-muted rounded animate-pulse mb-4" />
          <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 text-center">
          <Ship className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This course may have been removed or is no longer available
          </p>
          <Button onClick={() => navigate('/courses')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/courses')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <Badge>{course.type}</Badge>
                <Badge variant="secondary">{course.mode}</Badge>
              </div>

              <h1 className="text-4xl font-bold">{course.title}</h1>

              {course.description && (
                <p className="text-lg text-muted-foreground">{course.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm border-y py-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>{course.validity_months || 60} months validity</span>
                </div>
              </div>

              {course.institutes && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Building2 className="h-8 w-8 text-primary mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{course.institutes.name}</h3>
                        {course.institutes.city && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>{course.institutes.city}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified Institute
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <Ship className="h-32 w-32 text-primary/20" />
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">₹{Number(course.fees).toLocaleString()}</span>
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleEnrollClick}
                    disabled={batches.length === 0}
                  >
                    {batches.length === 0 ? 'No Batches Available' : 'Enroll Now'}
                  </Button>

                  {batches.length === 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      Contact institute for upcoming batches
                    </p>
                  )}

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Course Information</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>{course.duration} duration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>{course.mode} mode</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>{course.validity_months || 60} months validity</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Certificate on completion</span>
                      </li>
                    </ul>
                  </div>

                  {course.institutes && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Contact Institute</h4>
                        {course.institutes.contact_email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${course.institutes.contact_email}`} className="text-primary hover:underline">
                              {course.institutes.contact_email}
                            </a>
                          </div>
                        )}
                        {course.institutes.contact_phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${course.institutes.contact_phone}`} className="text-primary hover:underline">
                              {course.institutes.contact_phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {batches.length > 0 && (
        <div className="container mx-auto px-4 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Available Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {batches.map((batch) => (
                  <div
                    key={batch.batchid}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{batch.batch_name || `Batch ${batch.batchid.slice(0, 8)}`}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Start: {new Date(batch.start_date).toLocaleDateString()}</span>
                        </div>
                        <span>•</span>
                        <span>End: {new Date(batch.end_date).toLocaleDateString()}</span>
                      </div>
                      {batch.seats_total && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Capacity: {batch.seats_booked || 0}/{batch.seats_total} students</span>
                        </div>
                      )}
                    </div>
                    <Badge variant={batch.batch_status === 'active' ? 'default' : 'secondary'}>
                      {batch.batch_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select a Batch</DialogTitle>
            <DialogDescription>
              Choose a batch to enroll in. You will proceed to payment after selection.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {batches.filter(b => ['active', 'upcoming'].includes(b.batch_status)).map((batch) => (
              <div
                key={batch.batchid}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedBatch?.batchid === batch.batchid
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => handleBatchSelect(batch)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{batch.batch_name || `Batch ${batch.batchid.slice(0, 8)}`}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(batch.start_date).toLocaleDateString()}</span>
                      </div>
                      <span>to</span>
                      <span>{new Date(batch.end_date).toLocaleDateString()}</span>
                    </div>
                    {batch.seats_total && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{batch.seats_booked || 0}/{batch.seats_total} seats</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    {selectedBatch?.batchid === batch.batchid && (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {batches.filter(b => ['active', 'upcoming'].includes(b.batch_status)).length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No available batches at the moment.
            </p>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowBatchDialog(false)
                setSelectedBatch(null)
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmEnrollment}
              disabled={!selectedBatch || enrolling}
            >
              {enrolling ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
