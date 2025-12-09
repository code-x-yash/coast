import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { findCourse, listLessonsForCourse, type Course, type Lesson } from '@/data/mock'
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, ArrowLeft, Play } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'


// Use Course and Lesson types from mock data

interface Enrollment {
  id: string
  progress: number
  completedLessons: string
}

interface LearningInterfaceProps {
  courseId: string
  onNavigate: (page: string, courseId?: string) => void
  user: { id: string; email: string } | null
}

export default function LearningInterface({ courseId, onNavigate, user }: LearningInterfaceProps) {
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadLearningData()
    }
  }, [courseId, user])

  const loadLearningData = async () => {
    if (!user) return

    try {
      const courseData = findCourse(courseId)
      if (courseData) setCourse(courseData)
      const lessonsData = listLessonsForCourse(courseId)
      setLessons(lessonsData)

      const raw = localStorage.getItem('enrollments')
      const map = raw ? JSON.parse(raw) : {}
      const list: any[] = map[user.id] || []
      const enr = list.find((e) => e.courseId === courseId) || null
      if (enr) {
        setEnrollment(enr)
        const completed = JSON.parse(enr.completedLessons || '[]')
        setCompletedLessons(completed)
      }
    } catch (error) {
      console.error('Failed to load learning data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsComplete = async () => {
    if (!enrollment || !user) return

    const currentLesson = lessons[currentLessonIndex]
    if (!currentLesson) return

    const updatedCompleted = [...new Set([...completedLessons, currentLesson.id])]
    const progress = Math.round((updatedCompleted.length / lessons.length) * 100)

    try {
      const raw = localStorage.getItem('enrollments')
      const map = raw ? JSON.parse(raw) : {}
      const list: any[] = map[user.id] || []
      const idx = list.findIndex((e) => e.id === enrollment.id)
      const updated = { ...enrollment, completedLessons: JSON.stringify(updatedCompleted), progress, lastAccessed: Date.now() }
      if (idx >= 0) list[idx] = updated
      map[user.id] = list
      localStorage.setItem('enrollments', JSON.stringify(map))

      setEnrollment(updated)
      setCompletedLessons(updatedCompleted)
      
      toast({
        title: 'Lesson completed!',
        description: `Progress: ${progress}%`,
      })

      if (currentLessonIndex < lessons.length - 1) {
        setTimeout(() => setCurrentLessonIndex(currentLessonIndex + 1), 500)
      } else {
        toast({
          title: 'Course completed! 🎉',
          description: 'Congratulations on completing the course!',
        })
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Course not found or you're not enrolled</p>
          <Button onClick={() => onNavigate('catalog')}>Browse Courses</Button>
        </div>
      </div>
    )
  }

  const currentLesson = lessons[currentLessonIndex]
  const isLessonCompleted = completedLessons.includes(currentLesson.id)
  const courseProgress = Math.round((completedLessons.length / lessons.length) * 100)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Lesson List */}
      <aside className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => onNavigate('course', courseId)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
          <h2 className="font-semibold line-clamp-2 mb-2">{course.title}</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{courseProgress}%</span>
            </div>
            <Progress value={courseProgress} />
            <p className="text-xs text-muted-foreground">
              {completedLessons.length} of {lessons.length} lessons completed
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson.id)
              const isCurrent = index === currentLessonIndex

              return (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLessonIndex(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium mb-1 ${isCurrent ? 'text-primary' : ''}`}>
                        {index + 1}. {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.durationMinutes} min
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Video/Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-8">
            {/* Placeholder Video Area */}
            <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center">
                <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Video player coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Duration: {currentLesson.durationMinutes} minutes
                </p>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{currentLesson.title}</h1>
                {currentLesson.description && (
                  <p className="text-muted-foreground">{currentLesson.description}</p>
                )}
              </div>

              <Separator />

              <div className="prose prose-slate max-w-none">
                <h3>Lesson Overview</h3>
                <p>
                  Welcome to this lesson on {currentLesson.title}. In this session, you will learn important concepts
                  and practical skills related to maritime operations and safety.
                </p>
                
                <h3>Key Learning Points</h3>
                <ul>
                  <li>Understanding the fundamental principles</li>
                  <li>Practical applications in real-world scenarios</li>
                  <li>Best practices and industry standards</li>
                  <li>Safety considerations and regulations</li>
                </ul>

                <h3>Important Notes</h3>
                <p>
                  Make sure to take notes as you watch the video. You can pause and replay sections as needed.
                  Complete the lesson to track your progress through the course.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t bg-card p-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
              disabled={currentLessonIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-4">
              {!isLessonCompleted && (
                <Button onClick={markAsComplete}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Complete
                </Button>
              )}
              
              {currentLessonIndex < lessons.length - 1 && (
                <Button
                  onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)}
                >
                  Next Lesson
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
