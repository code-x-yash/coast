import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { courseService, type Course } from '@/services/courses'
import { useAuth } from '@/hooks/useAuth'
import { CheckCircle2, ArrowLeft, MapPin, Calendar, Clock, Phone, Mail, Ship, Building2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [batches, setBatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  const handleEnroll = () => {
    if (!user) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to enroll in this course.',
      })
      navigate('/sign-in')
      return
    }

    toast({
      title: 'Contact Institute',
      description: 'Please contact the institute directly to enroll in this course.',
    })
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
                    onClick={handleEnroll}
                  >
                    Contact Institute to Enroll
                  </Button>

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
                    <div>
                      <p className="font-medium">{batch.batch_name || `Batch ${batch.batchid.slice(0, 8)}`}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Start: {new Date(batch.start_date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>End: {new Date(batch.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge>{batch.batch_status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
