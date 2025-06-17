import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LockedContent from "@/components/LockedContent";
import { useFeatures } from "@/lib/features";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, Trophy, Video, BookOpen, ArrowLeft, CheckCircle, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import withErrorBoundary from '@/components/withErrorBoundary';

type SubscriptionTier = 'free' | 'driven' | 'aspiring' | 'breakthrough';

interface ContentDetails {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'video' | 'event' | 'feature';
  requiredTier: SubscriptionTier;
  releaseDate: string;
  thumbnail?: string;
  teaserContent?: string;
  teaserVideo?: string;
  teaserImages?: string[];
  features?: string[];
  instructor?: {
    name: string;
    title: string;
    avatar?: string;
  };
  duration?: number; // in minutes
  lessons?: number;
}

// Sample premium content data
const premiumContent: Record<string, ContentDetails> = {
  "advanced-short-game": {
    id: "advanced-short-game",
    title: "Advanced Short Game Mastery",
    description: "Learn the secrets of elite short game play from PGA professionals",
    type: "course",
    requiredTier: "aspiring",
    releaseDate: "May 15, 2025",
    thumbnail: "/images/coming-soon/short-game.jpg",
    teaserContent: "This comprehensive course will cover advanced techniques for pitching, chipping, and bunker play. You'll learn how to control trajectory, spin, and distance with precision.",
    teaserVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual teaser video
    teaserImages: [
      "/images/coming-soon/short-game-1.jpg",
      "/images/coming-soon/short-game-2.jpg",
      "/images/coming-soon/short-game-3.jpg"
    ],
    features: [
      "12 in-depth video lessons",
      "Downloadable practice drills",
      "Interactive feedback tools",
      "Progress tracking",
      "Certificate of completion"
    ],
    instructor: {
      name: "David Thompson",
      title: "PGA Teaching Professional",
      avatar: "/images/instructors/david-thompson.jpg"
    },
    duration: 240,
    lessons: 12
  },
  "mental-game-workshop": {
    id: "mental-game-workshop",
    title: "Mental Game Workshop",
    description: "Develop the mental toughness needed to perform under pressure",
    type: "event",
    requiredTier: "breakthrough",
    releaseDate: "June 5, 2025",
    thumbnail: "/images/coming-soon/mental-game.jpg",
    teaserContent: "Join our virtual workshop with sports psychologists to learn techniques for focus, visualization, and managing pressure on the course.",
    features: [
      "Live interactive sessions",
      "Personalized mental game assessment",
      "One-on-one coaching session",
      "Take-home exercises and resources",
      "30-day follow-up program"
    ],
    instructor: {
      name: "Dr. Sarah Williams",
      title: "Sports Psychologist",
      avatar: "/images/instructors/sarah-williams.jpg"
    },
    duration: 180
  },
  "putting-analysis": {
    id: "putting-analysis",
    title: "Putting Stroke Analysis Tool",
    description: "AI-powered analysis of your putting stroke mechanics",
    type: "feature",
    requiredTier: "driven",
    releaseDate: "May 1, 2025",
    thumbnail: "/images/coming-soon/putting-analysis.jpg",
    teaserContent: "Upload videos of your putting stroke and receive instant AI-powered analysis with personalized recommendations for improvement.",
    teaserVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual teaser video
    features: [
      "Instant stroke analysis",
      "Frame-by-frame breakdown",
      "Comparison with pro models",
      "Personalized drills",
      "Progress tracking over time"
    ]
  },
  "tournament-prep": {
    id: "tournament-prep",
    title: "Tournament Preparation Series",
    description: "Step-by-step guide to prepare for competitive play",
    type: "video",
    requiredTier: "aspiring",
    releaseDate: "May 10, 2025",
    thumbnail: "/images/coming-soon/tournament-prep.jpg",
    teaserContent: "This 5-part video series covers everything from practice routines to course management strategies specifically designed for tournament play.",
    features: [
      "5 comprehensive video lessons",
      "Pre-tournament checklist",
      "Mental preparation guide",
      "Course strategy workbook",
      "Post-round analysis template"
    ],
    instructor: {
      name: "Michael Chen",
      title: "Tour Player & Coach",
      avatar: "/images/instructors/michael-chen.jpg"
    },
    duration: 150,
    lessons: 5
  }
};

export default withErrorBoundary(function LockedContentPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { userTier } = useFeatures();
  const [content, setContent] = useState<ContentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      
      // In a real app, fetch this from an API
      // For now, we'll use our sample data
      if (contentId && premiumContent[contentId]) {
        setContent(premiumContent[contentId]);
        
        // Check if user is subscribed to notifications for this content
        if (userTier) {
          try {
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
              const { data } = await supabase
                .from('content_notifications')
                .select('*')
                .eq('user_id', userData.user.id)
                .eq('content_id', contentId)
                .single();
                
              setIsSubscribed(!!data);
            }
          } catch (error) {
            console.error('Error checking notification status:', error);
          }
        }
      } else {
        // Content not found, redirect to coming soon page
        navigate('/coming-soon');
      }
      
      setLoading(false);
    };
    
    loadContent();
  }, [contentId, navigate, userTier]);
  
  const handleSubscribe = async () => {
    if (!content || !userTier) return;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      if (isSubscribed) {
        // Unsubscribe
        await supabase
          .from('content_notifications')
          .delete()
          .eq('user_id', userData.user.id)
          .eq('content_id', content.id);
          
        setIsSubscribed(false);
      } else {
        // Subscribe
        await supabase
          .from('content_notifications')
          .insert({
            user_id: userData.user.id,
            content_id: content.id,
            content_title: content.title,
            release_date: content.releaseDate,
            created_at: new Date().toISOString()
          });
          
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };
  
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "course":
        return <BookOpen className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "event":
        return <Calendar className="h-5 w-5" />;
      case "feature":
        return <Trophy className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };
  
  // Calculate days until release
  const getDaysUntilRelease = (releaseDate: string) => {
    const release = new Date(releaseDate);
    const today = new Date();
    const diffTime = release.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-pgv-green" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!content) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Content Not Found</h1>
            <p className="text-muted-foreground mb-6">The content you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/coming-soon')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Coming Soon
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Check if user has access based on their tier
  const hasAccess = userTier ? 
    ['free', 'driven', 'aspiring', 'breakthrough'].indexOf(userTier as SubscriptionTier) >= 
    ['free', 'driven', 'aspiring', 'breakthrough'].indexOf(content.requiredTier) : 
    content.requiredTier === 'free';
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/coming-soon')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Coming Soon
          </Button>
          
          <LockedContent
            title={content.title}
            description={content.description}
            requiredTier={content.requiredTier}
            thumbnail={content.thumbnail}
            teaserContent={
              <div className="space-y-4">
                <p>{content.teaserContent}</p>
                
                {content.teaserVideo && (
                  <div className="aspect-video rounded-md overflow-hidden">
                    <iframe 
                      src={content.teaserVideo} 
                      className="w-full h-full" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            }
            comingSoon={true}
            releaseDate={content.releaseDate}
          >
            {/* This content will only be shown if the user has access */}
            <div>Actual content would go here if unlocked</div>
          </LockedContent>
          
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">About This {content.type === 'course' ? 'Course' : content.type === 'video' ? 'Video Series' : content.type === 'event' ? 'Event' : 'Feature'}</h3>
                        <p className="text-muted-foreground mb-4">{content.teaserContent}</p>
                        
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-pgv-green" />
                            <span>Release Date: <span className="font-medium">{content.releaseDate}</span></span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-pgv-green" />
                            <span>Countdown: <span className="font-medium">{getDaysUntilRelease(content.releaseDate)} days</span></span>
                          </div>
                          
                          {content.duration && (
                            <div className="flex items-center gap-2">
                              <Video className="h-5 w-5 text-pgv-green" />
                              <span>Duration: <span className="font-medium">{formatDuration(content.duration)}</span></span>
                            </div>
                          )}
                          
                          {content.lessons && (
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-pgv-green" />
                              <span>Lessons: <span className="font-medium">{content.lessons}</span></span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-pgv-green" />
                            <span>Required Tier: <span className="font-medium capitalize">{content.requiredTier}</span></span>
                          </div>
                        </div>
                        
                        {userTier && (
                          <div className="mt-6">
                            <Button 
                              className={isSubscribed ? "bg-amber-500 hover:bg-amber-600" : "bg-pgv-green hover:bg-pgv-green/90"}
                              onClick={handleSubscribe}
                            >
                              {isSubscribed ? (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Subscribed for Updates
                                </>
                              ) : (
                                "Notify Me When Available"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        {content.teaserImages && content.teaserImages.length > 0 && (
                          <div className="space-y-3">
                            {content.teaserImages.map((image, index) => (
                              <div key={index} className="rounded-md overflow-hidden">
                                <img 
                                  src={image} 
                                  alt={`${content.title} preview ${index + 1}`} 
                                  className="w-full h-auto object-cover" 
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="features" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">What You'll Get</h3>
                    
                    {content.features && content.features.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {content.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="bg-pgv-green/10 rounded-full p-1">
                              <CheckCircle className="h-5 w-5 text-pgv-green" />
                            </div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Feature details will be announced soon.</p>
                    )}
                    
                    <Separator className="my-6" />
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium flex items-center gap-2 text-amber-800 mb-2">
                        <Star className="h-5 w-5 text-amber-500" />
                        Exclusive to {content.requiredTier.charAt(0).toUpperCase() + content.requiredTier.slice(1)} Members
                      </h4>
                      <p className="text-amber-700 text-sm">
                        This premium content is designed specifically for our {content.requiredTier} tier members. 
                        {!hasAccess && " Upgrade your membership today to get access when it's released."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="instructor" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    {content.instructor ? (
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {content.instructor.avatar && (
                          <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
                            <img 
                              src={content.instructor.avatar} 
                              alt={content.instructor.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        
                        <div>
                          <h3 className="text-xl font-medium mb-1">{content.instructor.name}</h3>
                          <p className="text-pgv-green mb-4">{content.instructor.title}</p>
                          
                          <p className="text-muted-foreground">
                            {/* This would be the instructor bio in a real app */}
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Instructor information will be announced soon.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}, 'locked-content');
