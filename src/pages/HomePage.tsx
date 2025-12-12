import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { courseService, type Course } from '@/services/courses'
import { Star, Clock, Users, Award, Anchor, Ship, TrendingUp, CheckCircle, Building2, MapPin, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Institute {
  instid: string
  name: string
  city: string
  state: string
  logo_url: string
  banner_url: string
  verified_status: string
  course_count?: number
}

export default function HomePage() {
  const navigate = useNavigate()
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])
  const [featuredInstitutes, setFeaturedInstitutes] = useState<Institute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [institutesLoading, setInstitutesLoading] = useState(true)

  useEffect(() => {
    loadFeaturedCourses()
    loadFeaturedInstitutes()
  }, [])

  const loadFeaturedCourses = async () => {
    try {
      const courses = await courseService.getCourses({ limit: 3 })
      setFeaturedCourses(courses)
    } catch (error) {
      console.error('Failed to load courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFeaturedInstitutes = async () => {
    try {
      const { data, error } = await supabase
        .from('institutes')
        .select(`
          instid,
          name,
          city,
          state,
          logo_url,
          banner_url,
          verified_status
        `)
        .eq('verified_status', 'verified')
        .limit(6)

      if (error) throw error

      if (data) {
        const institutesWithCounts = await Promise.all(
          data.map(async (institute) => {
            const { count } = await supabase
              .from('courses')
              .select('*', { count: 'exact', head: true })
              .eq('instid', institute.instid)
              .eq('status', 'active')

            return {
              ...institute,
              course_count: count || 0
            }
          })
        )

        setFeaturedInstitutes(institutesWithCounts.filter(i => i.course_count && i.course_count > 0))
      }
    } catch (error) {
      console.error('Failed to load institutes:', error)
    } finally {
      setInstitutesLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/HomePage-Hero.webp"
            alt="Maritime Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/90" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Professional Maritime Education
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Advance Your{' '}
                <span className="text-primary">Merchant Navy</span>{' '}
                Career
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Learn from experienced maritime professionals. Get certified. Build your career at sea with specialized courses designed for merchant navy personnel.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate('/courses')}>
                  Explore Courses
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/courses')}>
                  Learn More
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Expert Courses</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">10k+</div>
                  <div className="text-sm text-muted-foreground">Active Students</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block animate-slide-up">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-muted">
                <img
                  src="/images/HomePage-Features.jpg"
                  alt="Maritime Navigation"
                  className="w-full h-[400px] object-cover loading-lazy"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/800x400?text=Maritime+Navigation'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
              </div>
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-card border rounded-xl shadow-lg p-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">IMO Certified</div>
                    <div className="text-sm text-muted-foreground">Recognized Worldwide</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose SeaLearn?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Specialized maritime education platform built for professionals by professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-all">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Ship className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Industry Experts</h3>
                <p className="text-muted-foreground">
                  Learn from experienced captains, engineers, and maritime professionals with decades of sea experience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Anchor className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">IMO Compliant</h3>
                <p className="text-muted-foreground">
                  All courses meet international maritime standards and IMO requirements for professional certification.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
                <p className="text-muted-foreground">
                  Advance your career with recognized certifications that open doors to better positions and higher ranks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Institutes */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Top Training Institutes</h2>
              <p className="text-muted-foreground">Explore courses from verified maritime training institutes</p>
            </div>
          </div>

          {institutesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-32 bg-muted animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded animate-pulse mb-4" />
                    <div className="h-3 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredInstitutes.length === 0 ? (
            <div className="text-center py-12 bg-background rounded-lg border">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No institutes available yet</p>
              <p className="text-muted-foreground">Check back soon for verified maritime training institutes</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredInstitutes.map((institute) => (
                <Card
                  key={institute.instid}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => navigate(`/institute/${institute.instid}`)}
                >
                  <div className="relative h-32 overflow-hidden">
                    {institute.banner_url ? (
                      <img
                        src={institute.banner_url}
                        alt={`${institute.name} banner`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>

                  <CardContent className="p-6 relative">
                    <div className="absolute -top-8 left-6">
                      <div className="h-16 w-16 rounded-lg bg-card border-4 border-background shadow-lg overflow-hidden flex items-center justify-center">
                        {institute.logo_url ? (
                          <img
                            src={institute.logo_url}
                            alt={`${institute.name} logo`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-primary" />
                        )}
                      </div>
                    </div>

                    <div className="mt-10">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors flex-1">
                          {institute.name}
                        </h3>
                        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 shrink-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>

                      {(institute.city || institute.state) && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">
                            {[institute.city, institute.state].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{institute.course_count}</span> {institute.course_count === 1 ? 'Course' : 'Courses'}
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1 group-hover:gap-2 transition-all">
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Courses</h2>
              <p className="text-muted-foreground">Start learning with our most popular maritime courses</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/courses')}>
              View All Courses
            </Button>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded animate-pulse mb-4" />
                    <div className="h-3 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredCourses.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Ship className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No courses available yet</p>
              <p className="text-muted-foreground">Check back soon for new maritime training courses</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
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
                    {course.institutes?.name && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground truncate flex-1">
                          {course.institutes.name}
                        </span>
                        <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700 shrink-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    )}
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

                    <div className="flex items-center justify-between">
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Set Sail on Your Learning Journey?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of maritime professionals advancing their careers through SeaLearn
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/courses')}>
            Start Learning Today
          </Button>
        </div>
      </section>
    </div>
  )
}
