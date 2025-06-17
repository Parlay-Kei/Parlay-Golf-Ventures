import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, ArrowLeft, ArrowRight, Play, Pause, Maximize, Minimize, Volume2, VolumeX } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { getLesson, Lesson, markLessonComplete, getNextLesson } from "@/api/lesson-api"
import { LoadingWrapper } from "@/components/ui/loading-wrapper"
import { useLoadingState } from "@/hooks/useLoadingState"
import withErrorBoundary from '@/components/withErrorBoundary'

export default withErrorBoundary(function Lesson() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isLoading: lessonLoading, withLoading: withLessonLoading } = useLoadingState({ message: 'Loading lesson...' })
  const { isLoading: actionLoading, withLoading: withActionLoading } = useLoadingState({ message: 'Processing...' })
  
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login?return_to=/academy/lesson/' + id)
      return
    }
    fetchLesson()
  }, [id, user])

  const fetchLesson = async () => {
    await withLessonLoading(async () => {
      try {
        const lessonData = await getLesson(id!)
        setLesson(lessonData)
        
        // Fetch next lesson if available
        if (lessonData.course_id) {
          const next = await getNextLesson(lessonData.course_id, lessonData.order)
          setNextLesson(next)
        }
      } catch (error) {
        console.error('Error fetching lesson:', error)
        toast({
          title: "Error",
          description: "Failed to load lesson",
          variant: "destructive",
        })
      }
    })
  }

  const handleMarkComplete = async () => {
    if (!lesson) return

    await withActionLoading(async () => {
      try {
        await markLessonComplete(lesson.id)
        setLesson(prev => prev ? { ...prev, completed: true } : null)
        toast({
          title: "Success",
          description: "Lesson marked as complete",
        })
      } catch (error) {
        console.error('Error marking lesson complete:', error)
        toast({
          title: "Error",
          description: "Failed to mark lesson as complete",
          variant: "destructive",
        })
      }
    })
  }

  const handleVideoProgress = () => {
    if (!videoRef) return
    
    const percent = (videoRef.currentTime / videoRef.duration) * 100
    setProgress(percent)
    
    // Auto-mark as complete when video is 90% watched
    if (percent >= 90 && !lesson?.completed) {
      handleMarkComplete()
    }
  }

  const togglePlay = () => {
    if (!videoRef) return
    if (isPlaying) {
      videoRef.pause()
    } else {
      videoRef.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleFullscreen = () => {
    if (!videoRef) return
    if (!isFullscreen) {
      videoRef.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const toggleMute = () => {
    if (!videoRef) return
    videoRef.muted = !isMuted
    setIsMuted(!isMuted)
  }

  if (lessonLoading) {
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

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">Lesson not found</p>
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
          isLoading={lessonLoading}
          variant="card"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  className="text-pgv-green"
                  onClick={() => navigate(`/academy/course/${lesson.course_id}`)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Course
                </Button>
                <Badge className={`${lesson.level === 'beginner' ? 'bg-green-500' : lesson.level === 'intermediate' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                  {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
                </Badge>
              </div>
              <CardTitle className="text-2xl mt-4">{lesson.title}</CardTitle>
              <CardDescription>{lesson.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Video Player */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={setVideoRef}
                    src={lesson.video_url}
                    className="w-full h-full"
                    onTimeUpdate={handleVideoProgress}
                    onEnded={() => setIsPlaying(false)}
                  />
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={togglePlay}
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      
                      <div className="flex-1">
                        <Progress value={progress} className="h-1" />
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={toggleMute}
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={toggleFullscreen}
                      >
                        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="prose max-w-none">
                  {lesson.content}
                </div>

                {/* Completion Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {lesson.completed ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-500">Lesson Completed</span>
                      </>
                    ) : (
                      <Button
                        className="bg-pgv-green hover:bg-pgv-green/90"
                        onClick={handleMarkComplete}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Mark as Complete'
                        )}
                      </Button>
                    )}
                  </div>

                  {nextLesson && (
                    <Button
                      className="bg-pgv-green hover:bg-pgv-green/90"
                      onClick={() => navigate(`/academy/lesson/${nextLesson.id}`)}
                    >
                      Next Lesson <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
}, 'lesson') 