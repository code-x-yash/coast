import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { mockApi } from '@/api/mockApi'
import { useAuth } from '@/hooks/useAuth'
import { type Course, type Lesson } from '@/data/mock'
import { Star, Clock, Users, Award, CheckCircle2, Play, Lock, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CourseDetailProps {
  courseId: string
  onNavigate: (page: string, courseId?: string) => void
}

export default function CourseDetail({ courseId, onNavigate }: CourseDetailProps) {
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadCourseData()
  }, [courseId, user])

  const loadCourseData = async () => {
    setIsLoading(true)
    try {
      const courseData = await mockApi.findCourse(courseId)
      if (courseData) setCourse(courseData)

      const lessonsData = await mockApi.listLessonsForCourse(courseId)
      setLessons(lessonsData)

      if (user) {
        const userId = (user as any).id || (user as any).userid || 'demo-user'
        const enrollment = await mockApi.findEnrollmentByUserCourse(userId, courseId)
        setIsEnrolled(!!enrollment)
      }
    } catch (error) {
      console.error('Failed to load course:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      onNavigate('sign-in')
      return
    }

    try {
      const userId = (user as any).id || (user as any).userid || 'demo-user'
      await mockApi.enrollStudent(userId, courseId)
      setIsEnrolled(true)
      toast({
        title: 'Successfully enrolled!',
        description: 'You can now access all course materials.',
      })
      setTimeout(() => onNavigate('learn', courseId), 1000)
    } catch (error) {
      console.error('Enrollment failed:', error)
      toast({
        title: 'Enrollment failed',
        description: 'Please try again later.',
        variant: 'destructive'
      })
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
        <div className="container mx-auto px-4">
          <p>Course not found</p>
        </div>
      </div>
    )
  }

  const whatYouWillLearn = course.whatYouWillLearn || []
  const requirements = course.requirements || []
  const totalDuration = lessons.reduce((sum, lesson) => sum + lesson.durationMinutes, 0)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => onNavigate('catalog')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Badge>{course.category}</Badge>
              <h1 className="text-4xl font-bold">{course.title}</h1>
              <p className="text-lg text-muted-foreground">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    <span className="font-semibold text-lg">{course.rating}</span>
                  </div>
                  <span className="text-muted-foreground">rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>{course.totalStudents.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{course.durationHours} hours</span>
                </div>
                <Badge variant="secondary">{course.level}</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Created by</p>
                <div>
                  <p className="font-semibold">{course.instructorName}</p>
                  {course.instructorTitle && (
                    <p className="text-sm text-muted-foreground">{course.instructorTitle}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img
                    src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">${course.price}</span>
                  </div>

                  {isEnrolled ? (
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => onNavigate('learn', courseId)}
                    >
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleEnroll}
                    >
                      Enroll Now
                    </Button>
                  )}

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">This course includes:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>{totalDuration} minutes of video</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>{lessons.length} lessons</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Lifetime access</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Certificate of completion</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* What You'll Learn */}
              <Card>
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {whatYouWillLearn.map((item: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Course Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Content</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {lessons.length} lessons • {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                  </p>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="section-1">
                      <AccordionTrigger>
                        <span className="font-semibold">Course Curriculum</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {lessons.map((lesson, index) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {Number(lesson.isPreview) > 0 ? (
                                  <Play className="h-4 w-4 text-primary" />
                                ) : (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                )}
                                <div>
                                  <p className="text-sm font-medium">
                                    {index + 1}. {lesson.title}
                                  </p>
                                  {lesson.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{lesson.durationMinutes}min</span>
                                {Number(lesson.isPreview) > 0 && (
                                  <Badge variant="secondary" className="ml-2">Preview</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Requirements */}
              {requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {requirements.map((req: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground mt-0.5">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
