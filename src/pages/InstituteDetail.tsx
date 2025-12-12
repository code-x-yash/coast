import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase'
import { courseService, type Course } from '@/services/courses'
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Ship,
  Globe,
  Award
} from 'lucide-react'

interface Institute {
  instid: string
  name: string
  city: string
  state: string
  country: string
  address: string
  contact_email: string
  contact_phone: string
  customer_care_email: string
  customer_care_phone: string
  logo_url: string
  banner_url: string
  verified_status: string
  accreditation_no: string
  valid_from: string
  valid_to: string
}

export default function InstituteDetail() {
  const { instituteId } = useParams<{ instituteId: string }>()
  const navigate = useNavigate()
  const [institute, setInstitute] = useState<Institute | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (instituteId) {
      loadInstituteData()
    }
  }, [instituteId])

  const loadInstituteData = async () => {
    if (!instituteId) return

    setIsLoading(true)
    try {
      const { data: instituteData, error: instituteError } = await supabase
        .from('institutes')
        .select('*')
        .eq('instid', instituteId)
        .maybeSingle()

      if (instituteError) throw instituteError
      if (instituteData) {
        setInstitute(instituteData)

        const coursesData = await courseService.getCourses({
          instituteId: instituteId,
          approvalStatus: 'approved'
        })
        setCourses(coursesData)
      }
    } catch (error) {
      console.error('Failed to load institute:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="h-8 w-24 bg-muted rounded animate-pulse mb-6" />
          <div className="h-64 bg-muted rounded animate-pulse mb-6" />
          <div className="h-12 w-2/3 bg-muted rounded animate-pulse mb-4" />
        </div>
      </div>
    )
  }

  if (!institute) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Institute Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This institute may have been removed or is no longer available
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Button
        variant="ghost"
        className="container mx-auto px-4 mt-6 w-fit"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <div className="relative">
        <div className="h-64 md:h-80 lg:h-96 w-full overflow-hidden">
          {institute.banner_url ? (
            <img
              src={institute.banner_url}
              alt={`${institute.name} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4">
          <div className="relative -mt-20 pb-8">
            <div className="bg-card border rounded-2xl shadow-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="flex-shrink-0">
                  <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl bg-background border-4 border-background shadow-xl overflow-hidden flex items-center justify-center">
                    {institute.logo_url ? (
                      <img
                        src={institute.logo_url}
                        alt={`${institute.name} logo`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-16 w-16 md:h-20 md:w-20 text-primary" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-3xl md:text-4xl font-bold mb-2">{institute.name}</h1>
                      {(institute.city || institute.state || institute.country) && (
                        <div className="flex items-center gap-2 text-muted-foreground mb-3">
                          <MapPin className="h-5 w-5 flex-shrink-0" />
                          <span className="text-lg">
                            {[institute.city, institute.state, institute.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 text-sm px-3 py-1">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Verified Institute
                    </Badge>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {institute.contact_email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <a
                            href={`mailto:${institute.contact_email}`}
                            className="text-primary hover:underline break-all"
                          >
                            {institute.contact_email}
                          </a>
                        </div>
                      )}
                      {institute.contact_phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <a
                            href={`tel:${institute.contact_phone}`}
                            className="text-primary hover:underline"
                          >
                            {institute.contact_phone}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {institute.customer_care_email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div>
                            <div className="text-xs text-muted-foreground">Customer Care</div>
                            <a
                              href={`mailto:${institute.customer_care_email}`}
                              className="text-primary hover:underline break-all"
                            >
                              {institute.customer_care_email}
                            </a>
                          </div>
                        </div>
                      )}
                      {institute.customer_care_phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div>
                            <div className="text-xs text-muted-foreground">Customer Care</div>
                            <a
                              href={`tel:${institute.customer_care_phone}`}
                              className="text-primary hover:underline"
                            >
                              {institute.customer_care_phone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {institute.accreditation_no && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Accreditation:</span>
                        <span className="font-semibold">{institute.accreditation_no}</span>
                        {institute.valid_to && (
                          <span className="text-muted-foreground">
                            (Valid until {new Date(institute.valid_to).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Available Courses</h2>
            <p className="text-muted-foreground">
              Explore all courses offered by {institute.name}
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12 bg-background rounded-lg border">
              <Ship className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No courses available</p>
              <p className="text-muted-foreground">This institute hasn't published any courses yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card
                  key={course.courseid}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/course/${course.courseid}`)}
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Ship className="h-24 w-24 text-primary/20" />
                    <Badge className="absolute top-4 left-4 bg-white/95 text-foreground backdrop-blur shadow-md font-medium">
                      {course.type}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description || 'Professional maritime training course'}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {course.mode}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-muted-foreground">
                        {course.validity_months || 60} months validity
                      </span>
                      <div className="text-xl font-bold text-primary whitespace-nowrap">
                        ₹{Number(course.fees).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
