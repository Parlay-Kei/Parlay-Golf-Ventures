import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle, Clock, ArrowRight, Upload, BookOpen, Calendar, Trophy, BarChart, CreditCard, Play } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useFeatures } from "@/lib/features"
import { useAuth } from "@/contexts/AuthContext"
import { getUserSubscription, cancelSubscription, createPortalSession } from "@/api/stripe-api"
import { getUserCourses, Course, getCourseLessons, Lesson } from "@/api/lesson-api"
import { LoadingWrapper } from "@/components/ui/loading-wrapper"
import { useLoadingState } from "@/hooks/useLoadingState"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import ErrorBoundary from "@/components/ErrorBoundary"
import { DashboardFallback } from "@/components/fallbacks"
import withErrorBoundary from '@/components/withErrorBoundary'

interface Subscription {
  id: string
  user_id: string
  tier: 'free' | 'driven' | 'aspiring' | 'breakthrough'
  status: string
  current_period_start: string
  current_period_end: string | null
  cancel_at_period_end: boolean
  stripe_customer_id?: string
  stripe_subscription_id?: string
  expiresAt: string
  plan: string
}

const DashboardContent = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isLoading: subscriptionLoading, withLoading: withSubscriptionLoading } = useLoadingState({ message: 'Loading subscription...' })
  const { isLoading: coursesLoading, withLoading: withCoursesLoading, error: coursesError, retryAttempts: coursesRetries } = useLoadingState({ message: 'Loading courses...' })
  const { isLoading: lessonsLoading, withLoading: withLessonsLoading, error: lessonsError, retryAttempts: lessonsRetries } = useLoadingState({ message: 'Loading lessons...' })
  const { isLoading: actionLoading, withLoading: withActionLoading } = useLoadingState({ message: 'Processing...' })
  
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([])
  const { hasAccess } = useFeatures()

  useEffect(() => {
    if (!user) {
      navigate('/login?return_to=/dashboard')
      return
    }
    fetchSubscription()
    fetchUserCourses()
  }, [user, navigate, fetchSubscription, fetchUserCourses])

  const fetchSubscription = useCallback(async () => {
    try {
      const data = await withSubscriptionLoading(async () => {
        const response = await api.get("/subscription")
        return response.data
      })
      setSubscription(data as Subscription)
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
      toast({
        title: "Error",
        description: "Failed to load subscription status",
        variant: "destructive"
      })
    }
  }, [withSubscriptionLoading])

  const fetchUserCourses = useCallback(async () => {
    try {
      const data = await withCoursesLoading(async () => {
        const response = await api.get("/courses")
        return response.data
      })
      setCourses(data as Course[])
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      })
    }
  }, [withCoursesLoading])

  const fetchCourseLessons = async () => {
    try {
      if (!selectedCourse) {
        throw new Error("No course selected");
      }
      const data = await withLessonsLoading(async () => {
        const response = await api.get(`/lessons?courseId=${selectedCourse.id}`)
        return response.data
      })
      setCourseLessons(data as Lesson[])
    } catch (error) {
      console.error("Failed to fetch lessons:", error)
      toast({
        title: "Error",
        description: "Failed to load lessons",
        variant: "destructive"
      })
    }
  }

  const handleCancelSubscription = async () => {
    await withActionLoading(async () => {
      try {
        if (!subscription?.stripe_subscription_id) {
          throw new Error('No subscription ID found');
        }
        await cancelSubscription(subscription.stripe_subscription_id)
        await fetchSubscription()
        toast({
          title: "Success",
          description: "Your subscription has been cancelled",
        })
      } catch (error) {
        console.error('Error cancelling subscription:', error)
        toast({
          title: "Error",
          description: "Failed to cancel subscription",
          variant: "destructive",
        })
      }
    }, "Cancelling subscription...")
  }

  const handleManageSubscription = async () => {
    await withActionLoading(async () => {
      try {
        if (!subscription?.stripe_customer_id) {
          throw new Error('No customer ID found');
        }
        const url = await createPortalSession(subscription.stripe_customer_id)
        window.location.href = url
      } catch (error) {
        console.error('Error creating portal session:', error)
        toast({
          title: "Error",
          description: "Failed to open subscription management",
          variant: "destructive",
        })
      }
    }, "Opening subscription management...")
  }

  const getStatusBadge = () => {
    if (!subscription) return null

    const variants = {
      active: <Badge className="bg-green-500">Active</Badge>,
      trialing: <Badge className="bg-blue-500">Trial</Badge>,
      past_due: <Badge className="bg-yellow-500">Past Due</Badge>,
      canceled: <Badge className="bg-gray-500">Canceled</Badge>,
      incomplete: <Badge className="bg-orange-500">Incomplete</Badge>,
      incomplete_expired: <Badge className="bg-red-500">Expired</Badge>
    }

    return variants[subscription.status as keyof typeof variants] || null
  }

  const getTierBadge = () => {
    if (!subscription) return null

    const variants = {
      free: <Badge className="bg-blue-500">Free</Badge>,
      driven: <Badge className="bg-purple-500">Driven</Badge>,
      aspiring: <Badge className="bg-pgv-green">Aspiring</Badge>,
      breakthrough: <Badge className="bg-pgv-gold text-pgv-green">Breakthrough</Badge>
    }

    return variants[subscription.tier as keyof typeof variants] || null
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiration'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRemainingDays = (dateString: string | null) => {
    if (!dateString) return null
    
    const endDate = new Date(dateString)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
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

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course)
    fetchCourseLessons()
  }

  const handleContinueLearning = () => {
    if (!selectedCourse) return
    
    // Find the first incomplete lesson
    const nextLesson = courseLessons.find(lesson => !lesson.completed)
    
    if (nextLesson) {
      navigate(`/academy/lesson/${nextLesson.id}`)
    } else {
      // If all lessons are complete, go to the course page
      navigate(`/academy/course/${selectedCourse.id}`)
    }
  }

  const handleMarkComplete = async (lessonId: string) => {
    try {
      await withActionLoading(async () => {
        await api.post(`/lessons/${lessonId}/complete`, {})
        await fetchCourseLessons()
        toast({
          title: "Success",
          description: "Lesson marked as complete"
        })
      }, "Marking lesson as complete...")
    } catch (error) {
      console.error("Failed to mark lesson complete:", error)
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete",
        variant: "destructive"
      })
    }
  }

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-pgv-green" />
        </main>
      </div>
    )
  }

  return (
    <>
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground mb-8">Welcome back! Here's an overview of your PGV Academy membership.</p>

        <LoadingWrapper
          isLoading={coursesLoading}
          error={coursesError}
          retryAttempts={coursesRetries}
          onRetry={fetchUserCourses}
          variant="card"
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Courses</CardTitle>
              <CardDescription>
                Continue learning and track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                {/* Subscription Status Card */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-pgv-green" />
                        Membership Status
                      </div>
                      {getStatusBadge()}
                    </CardTitle>
                    <CardDescription>
                      Manage your PGV Academy membership
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {subscription ? (
                      <div className="space-y-6">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-lg capitalize">{subscription.tier} Plan</span>
                            {getTierBadge()}
                          </div>
                          <p className="text-muted-foreground">
                            {subscription.tier === 'free' 
                              ? 'Basic access to golf tutorials and community features' 
                              : subscription.tier === 'driven'
                                ? 'Access to beginner tutorials and basic swing analysis'
                                : subscription.tier === 'aspiring'
                                  ? 'Advanced swing analysis and weekly practice plans'
                                  : 'Professional analysis and personalized coaching'}
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h3 className="font-medium">Subscription Details</h3>
                            
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>Status: <span className="font-medium">{subscription.status}</span></span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-gray-500" />
                              <span>
                                {subscription.tier === 'free' 
                                  ? 'Free membership - No expiration' 
                                  : `Renews: ${formatDate(subscription.current_period_end)}`}
                              </span>
                            </div>

                            {subscription.tier !== 'free' && subscription.current_period_end && (
                              <div className="flex items-center gap-2 text-blue-600">
                                <Trophy className="h-5 w-5" />
                                <span>
                                  {getRemainingDays(subscription.current_period_end)} days remaining in this billing cycle
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="font-medium">Membership Benefits</h3>
                            <ul className="space-y-1">
                              <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>{subscription.tier === 'free' ? 'Basic tutorials' : 'Full access to all tutorials'}</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>{subscription.tier === 'free' ? 'Community forum' : 'Priority community support'}</span>
                              </li>
                              {subscription.tier !== 'free' && (
                                <li className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>Swing analysis tools</span>
                                </li>
                              )}
                              {(subscription.tier === 'aspiring' || subscription.tier === 'breakthrough') && (
                                <li className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>Virtual coaching sessions</span>
                                </li>
                              )}
                              {subscription.tier === 'breakthrough' && (
                                <li className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>Custom tournament prep</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {subscription.cancel_at_period_end && subscription.tier !== 'free' && (
                          <div className="flex items-center gap-2 p-4 bg-orange-50 rounded-lg text-orange-700 border border-orange-200">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Your subscription is set to cancel</p>
                              <p className="text-sm">
                                Access will end on {formatDate(subscription.current_period_end)}. You can reactivate anytime before this date.
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {subscription.tier === 'free' && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-blue-700 font-medium mb-2">Upgrade to unlock premium features:</p>
                            <ul className="list-disc pl-5 text-blue-600 space-y-1">
                              <li>Advanced swing analysis</li>
                              <li>Personalized training plans</li>
                              <li>1-on-1 coaching sessions</li>
                              <li>Tournament preparation tools</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-600 mb-4">
                          You don't have an active membership yet.
                        </p>
                        <Button 
                          className="bg-pgv-green hover:bg-pgv-green/90"
                          onClick={() => navigate('/subscription-new')}
                        >
                          View Membership Options <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>

                  {subscription && subscription.tier !== 'free' && !subscription.cancel_at_period_end && (
                    <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between w-full">
                      <Button 
                        variant="outline" 
                        className="text-red-600 border-red-600 hover:bg-red-50 sm:w-auto w-full"
                        onClick={handleCancelSubscription}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Cancel Subscription'
                        )}
                      </Button>
                      <Button 
                        className="bg-pgv-green hover:bg-pgv-green/90 sm:w-auto w-full"
                        onClick={handleManageSubscription}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Manage Subscription'
                        )}
                      </Button>
                    </CardFooter>
                  )}
                  {subscription && subscription.tier === 'free' && (
                    <CardFooter>
                      <Button 
                        className="bg-pgv-green hover:bg-pgv-green/90 w-full"
                        onClick={() => navigate('/subscription-new')}
                      >
                        Upgrade Membership <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  )}
                </Card>

                {/* Quick Actions Card */}
                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-pgv-green" />
                        Quick Actions
                      </CardTitle>
                      <CardDescription>
                        Common tasks and resources
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start hover:bg-pgv-green/10 hover:text-pgv-green hover:border-pgv-green"
                        onClick={() => navigate('/upload')}
                      >
                        <Upload className="mr-2 h-5 w-5" />
                        Upload Swing Video
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="w-full justify-start hover:bg-pgv-green/10 hover:text-pgv-green hover:border-pgv-green"
                        onClick={() => navigate('/academy')}
                      >
                        <BookOpen className="mr-2 h-5 w-5" />
                        Browse Lessons
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="w-full justify-start hover:bg-pgv-green/10 hover:text-pgv-green hover:border-pgv-green"
                        onClick={() => navigate('/academy/schedule-review')}
                        disabled={!hasAccess('MENTOR_REVIEWS')}
                      >
                        <Calendar className="mr-2 h-5 w-5" />
                        Schedule Mentor Review
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Continue Learning Card */}
                  {selectedCourse && (
                    <Card className="bg-gradient-to-br from-pgv-green to-pgv-green-dark text-white">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5" />
                          Continue Learning
                        </CardTitle>
                        <CardDescription className="text-white/80">
                          Pick up where you left off
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-bold text-lg">{selectedCourse.title}</h3>
                            <p className="text-white/80 text-sm">{selectedCourse.description}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{selectedCourse.completed_lessons} of {selectedCourse.total_lessons} lessons</span>
                              <span>{Math.round(selectedCourse.progress)}% complete</span>
                            </div>
                            <Progress value={selectedCourse.progress} className="h-2 bg-white/20" />
                          </div>
                          
                          <Button 
                            className="w-full bg-white text-pgv-green hover:bg-white/90"
                            onClick={handleContinueLearning}
                          >
                            Continue <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </LoadingWrapper>
        
        {/* My Courses Section */}
        <LoadingWrapper
          isLoading={lessonsLoading}
          error={lessonsError}
          retryAttempts={lessonsRetries}
          onRetry={fetchCourseLessons}
          variant="card"
        >
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-pgv-green" />
                My Courses
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {coursesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-pgv-green" />
                </div>
              ) : courses.length > 0 ? (
                <div className="space-y-8">
                  {/* Course Selection Tabs */}
                  <div className="flex flex-wrap gap-2">
                    {courses.map(course => (
                      <Button 
                        key={course.id}
                        variant={selectedCourse?.id === course.id ? "default" : "outline"}
                        className={selectedCourse?.id === course.id ? "bg-pgv-green" : ""}
                        onClick={() => handleCourseSelect(course)}
                      >
                        {course.title}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Selected Course Details */}
                  {selectedCourse && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {selectedCourse.title}
                            <Badge className={`${selectedCourse.level === 'beginner' ? 'bg-green-500' : selectedCourse.level === 'intermediate' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                              {selectedCourse.level.charAt(0).toUpperCase() + selectedCourse.level.slice(1)}
                            </Badge>
                          </div>
                          <div className="text-sm font-normal">
                            {selectedCourse.completed_lessons}/{selectedCourse.total_lessons} lessons
                          </div>
                        </CardTitle>
                        <CardDescription>
                          {selectedCourse.description}
                        </CardDescription>
                        <Progress 
                          value={selectedCourse.progress} 
                          className="h-2 mt-2" 
                        />
                      </CardHeader>
                      
                      <CardContent>
                        {lessonsLoading ? (
                          <div className="flex justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-pgv-green" />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {courseLessons.map((lesson, index) => (
                              <div 
                                key={lesson.id} 
                                className={`p-4 rounded-lg border ${lesson.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}
                                onClick={() => navigate(`/academy/lesson/${lesson.id}`)}
                              >
                                <div className="flex items-center justify-between cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${lesson.completed ? 'bg-green-500 text-white' : 'bg-pgv-green/10 text-pgv-green'}`}>
                                      {lesson.completed ? <CheckCircle className="h-5 w-5" /> : index + 1}
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{lesson.title}</h3>
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
                                      navigate(`/academy/lesson/${lesson.id}`);
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
                      </CardContent>
                      
                      <CardFooter>
                        <Button 
                          className="w-full bg-pgv-green hover:bg-pgv-green/90"
                          onClick={() => navigate(`/academy/course/${selectedCourse.id}`)}
                        >
                          View Full Course
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600 mb-4">You haven't started any courses yet.</p>
                    <Button 
                      className="bg-pgv-green hover:bg-pgv-green/90"
                      onClick={() => navigate('/academy')}
                    >
                      Browse Academy Courses
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </LoadingWrapper>
      </main>
    </>
  )
}

export default withErrorBoundary(DashboardContent, 'dashboard')
