import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, ArrowLeft, ArrowRight, Play, BookOpen, Clock } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { getCourse, Course, getCourseLessons, Lesson } from "@/api/lesson-api"
import { LoadingWrapper } from "@/components/ui/loading-wrapper"
import { useLoadingState } from "@/hooks/useLoadingState"

export default function Course() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isLoading: courseLoading, withLoading: withCourseLoading } = useLoadingState({ message: 'Loading course...' })
  const { isLoading: lessonsLoading, withLoading: withLessonsLoading } = useLoadingState({ message: 'Loading lessons...' })
  
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  const fetchCourse = useCallback(async () => {
    await withCourseLoading(async () => {
      try {
        const courseData = await getCourse(id!)
        setCourse(courseData)
        await fetchLessons(courseData.id)
      } catch (error) {
        console.error('Error fetching course:', error)
        toast({
          title: "Error",
          description: "Failed to load course",
          variant: "destructive",
        })
      }
    })
  }, [id, withCourseLoading, fetchLessons, toast])

  useEffect(() => {
    if (!user) {
      navigate('/login?return_to=/academy/course/' + id)
      return
    }
    fetchCourse()
  }, [id, user, fetchCourse, navigate])

  const fetchLessons = async (courseId: string) => {
    await withLessonsLoading(async () => {
      try {
        const lessonsData = await getCourseLessons(courseId)
        setLessons(lessonsData)
        
        // Select the first incomplete lesson or the last completed one
        const incompleteLesson = lessonsData.find(lesson => !lesson.completed)
        if (incompleteLesson) {
          setSelectedLesson(incompleteLesson)
        } else if (lessonsData.length > 0) {
          setSelectedLesson(lessonsData[lessonsData.length - 1])
        }
      } catch (error) {
        console.error('Error fetching lessons:', error)
        toast({
          title: "Error",
          description: "Failed to load lessons",
          variant: "destructive",
        })
      }
    })
  }

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    navigate(`/academy/lesson/${lesson.id}`)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
  }

  if (courseLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-pgv-green" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">Course not found</p>
              <Button 
                className="bg-pgv-green hover:bg-pgv-green/90"
                onClick={() => navigate('/academy')}
              >
                Back to Academy
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <LoadingWrapper
          isLoading={courseLoading}
          variant="card"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  className="text-pgv-green"
                  onClick={() => navigate('/academy')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Academy
                </Button>
                <Badge className={`${course.level === 'beginner' ? 'bg-green-500' : course.level === 'intermediate' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </Badge>
              </div>
              <CardTitle className="text-2xl mt-4">{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
              <div className="mt-4">
                <Progress value={course.progress} className="h-2" />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{course.completed_lessons} of {course.total_lessons} lessons</span>
                  <span>{Math.round(course.progress)}% complete</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Course Overview */}
                <div className="prose max-w-none">
                  {course.overview}
                </div>

                {/* Lessons List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Lessons</h3>
                  {lessonsLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-pgv-green" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lessons.map((lesson, index) => (
                        <div 
                          key={lesson.id} 
                          className={`p-4 rounded-lg border ${lesson.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow cursor-pointer`}
                          onClick={() => handleLessonSelect(lesson)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${lesson.completed ? 'bg-green-500 text-white' : 'bg-pgv-green/10 text-pgv-green'}`}>
                                {lesson.completed ? <CheckCircle className="h-5 w-5" /> : index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium">{lesson.title}</h4>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {formatDuration(lesson.duration)}
                                  </span>
                                  {lesson.last_watched_at && (
                                    <span className="text-blue-600">
                                      Last watched: {new Date(lesson.last_watched_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-pgv-green"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLessonSelect(lesson);
                              }}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              {lesson.completed ? 'Rewatch' : 'Start'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </LoadingWrapper>
      </main>
      <Footer />
    </div>
  )
} 