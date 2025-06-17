import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LockedContent from "@/components/LockedContent";
import { useFeatures } from "@/lib/features";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Trophy, Video, BookOpen, Clock, ArrowRight } from "lucide-react";

type SubscriptionTier = 'free' | 'driven' | 'aspiring' | 'breakthrough';

interface UpcomingContent {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'video' | 'event' | 'feature';
  requiredTier: SubscriptionTier;
  releaseDate: string;
  thumbnail?: string;
  teaserContent?: string;
}

// Sample upcoming content data
const upcomingContent: UpcomingContent[] = [
  {
    id: "1",
    title: "Advanced Short Game Mastery",
    description: "Learn the secrets of elite short game play from PGA professionals",
    type: "course",
    requiredTier: "aspiring",
    releaseDate: "May 15, 2025",
    thumbnail: "/images/coming-soon/short-game.jpg",
    teaserContent: "This comprehensive course will cover advanced techniques for pitching, chipping, and bunker play. You'll learn how to control trajectory, spin, and distance with precision."
  },
  {
    id: "2",
    title: "Mental Game Workshop",
    description: "Develop the mental toughness needed to perform under pressure",
    type: "event",
    requiredTier: "breakthrough",
    releaseDate: "June 5, 2025",
    thumbnail: "/images/coming-soon/mental-game.jpg",
    teaserContent: "Join our virtual workshop with sports psychologists to learn techniques for focus, visualization, and managing pressure on the course."
  },
  {
    id: "3",
    title: "Putting Stroke Analysis Tool",
    description: "AI-powered analysis of your putting stroke mechanics",
    type: "feature",
    requiredTier: "driven",
    releaseDate: "May 1, 2025",
    thumbnail: "/images/coming-soon/putting-analysis.jpg"
  },
  {
    id: "4",
    title: "Tournament Preparation Series",
    description: "Step-by-step guide to prepare for competitive play",
    type: "video",
    requiredTier: "aspiring",
    releaseDate: "May 10, 2025",
    thumbnail: "/images/coming-soon/tournament-prep.jpg",
    teaserContent: "This 5-part video series covers everything from practice routines to course management strategies specifically designed for tournament play."
  },
  {
    id: "5",
    title: "Swing Mechanics Fundamentals",
    description: "Back to basics with a focus on proper mechanics",
    type: "course",
    requiredTier: "free",
    releaseDate: "April 30, 2025",
    thumbnail: "/images/coming-soon/swing-mechanics.jpg",
    teaserContent: "Available to all members soon! This course breaks down the golf swing into simple, digestible lessons that will help you build a solid foundation."
  },
  {
    id: "6",
    title: "Pro Swing Analysis",
    description: "Get your swing analyzed by a PGA teaching professional",
    type: "feature",
    requiredTier: "breakthrough",
    releaseDate: "June 15, 2025",
    thumbnail: "/images/coming-soon/pro-analysis.jpg"
  }
];

export default function ComingSoon() {
  const navigate = useNavigate();
  const { userTier } = useFeatures();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Filter content based on active tab
  const filteredContent = upcomingContent.filter(item => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });
  
  // Get appropriate icon for content type
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Coming Soon to PGV Academy</h1>
            <p className="text-muted-foreground">Get a sneak peek at upcoming content and features</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="course">Courses</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="event">Events</TabsTrigger>
              <TabsTrigger value="feature">Features</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {filteredContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.thumbnail && (
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
                        <Badge className="bg-amber-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {getDaysUntilRelease(item.releaseDate)} days
                        </Badge>
                        {getContentTypeIcon(item.type)}
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      {item.requiredTier && getTierBadge(item.requiredTier)}
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>Release date: {item.releaseDate}</span>
                    </div>
                    
                    {item.teaserContent && (
                      <>
                        <Separator className="my-3" />
                        <div className="text-sm line-clamp-3">
                          {item.teaserContent}
                        </div>
                      </>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    {checkTierAccess(userTier, item.requiredTier) ? (
                      <Button 
                        className="w-full bg-pgv-green hover:bg-pgv-green/90"
                        variant="default"
                        onClick={() => navigate(`/coming-soon/${item.id}`)}
                      >
                        View Details
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => navigate(`/coming-soon/${item.id}`)}
                      >
                        View Details
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No upcoming content in this category yet.</p>
            </div>
          )}
          
          <div className="mt-12 bg-muted rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Want to see more content?</h2>
            <p className="mb-6">Upgrade your membership to get access to all upcoming premium content as soon as it's released.</p>
            <Button 
              className="bg-pgv-green hover:bg-pgv-green/90"
              onClick={() => navigate('/subscription-new')}
            >
              View Membership Options
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Helper function to check if a user's tier gives access to content
function checkTierAccess(userTier: string | null, requiredTier: SubscriptionTier): boolean {
  if (!userTier) return requiredTier === 'free';
  
  const tierOrder: Record<string, number> = {
    'free': 0,
    'driven': 1,
    'aspiring': 2,
    'breakthrough': 3
  };

  return tierOrder[userTier] >= tierOrder[requiredTier];
}

// Helper function to get a badge for a tier
function getTierBadge(tier: SubscriptionTier) {
  switch (tier) {
    case 'free':
      return <Badge className="bg-blue-500">Free</Badge>;
    case 'driven':
      return <Badge className="bg-purple-500">Driven</Badge>;
    case 'aspiring':
      return <Badge className="bg-pgv-green">Aspiring</Badge>;
    case 'breakthrough':
      return <Badge className="bg-pgv-gold text-pgv-green">Breakthrough</Badge>;
    default:
      return null;
  }
}
