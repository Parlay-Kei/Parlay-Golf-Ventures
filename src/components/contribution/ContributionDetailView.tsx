import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { contributionsApi } from '@/lib/api/contributions';
import { toast } from 'sonner';
import type { Contribution } from '@/lib/types/contribution';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, Share2, ThumbsUp, MessageSquare } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { metricsService } from '@/lib/services/metricsService';

/**
 * ContributionDetailView Component
 * 
 * This component displays a detailed view of an individual contribution.
 * It includes the full content, contributor information, and related content.
 */
const ContributionDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedContent, setRelatedContent] = useState<Contribution[]>([]);
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  
  useEffect(() => {
    if (!id) return;
    
    // Fetch the contribution details
    fetchContribution(id);
    
    // Track view count using metrics service
    if (id) {
      metricsService.trackView(id, 'contribution', user?.id);
      
      // Set up time tracking
      const startTime = Date.now();
      
      // Track time spent when component unmounts
      return () => {
        const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
        if (timeSpentSeconds > 5) { // Only track if spent more than 5 seconds
          metricsService.trackTimeSpent(id, 'contribution', timeSpentSeconds, user?.id);
        }
      };
    }
  }, [id, user?.id, fetchContribution]);
  
  const fetchContribution = useCallback(async (contributionId: string) => {
    setIsLoading(true);
    try {
      const data = await contributionsApi.getContribution(contributionId);
      setContribution(data);
      
      // Fetch related content based on tags or contributor type
      fetchRelatedContent(data);
      
      // Fetch metrics data
      fetchMetricsData(contributionId);
    } catch (error) {
      console.error('Error fetching contribution:', error);
      toast.error('Failed to load contribution details');
      navigate('/contribute/hub');
    } finally {
      setIsLoading(false);
    }
  }, [fetchRelatedContent, fetchMetricsData, navigate]);
  
  const fetchMetricsData = useCallback(async (contributionId: string) => {
    try {
      // Fetch view count
      const views = await metricsService.getViewCount(contributionId, 'contribution');
      setViewCount(views);
      
      // Fetch like count
      const likes = await metricsService.getInteractionCount(contributionId, 'contribution', 'like');
      setLikeCount(likes);
      
      // Fetch comment count
      const comments = await metricsService.getInteractionCount(contributionId, 'contribution', 'comment');
      setCommentCount(comments);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }, []);
  
  const fetchRelatedContent = useCallback(async (currentContribution: Contribution) => {
    try {
      // Fetch approved contributions of the same type
      const allContent = await contributionsApi.getContributionsByStatus('approved');
      
      // Filter out the current contribution and limit to 3 related items
      const filtered = allContent
        .filter((item: Contribution) => 
          item.id !== currentContribution.id && 
          (item.contributionType === currentContribution.contributionType || 
           item.contributorType === currentContribution.contributorType))
        .slice(0, 3);
      
      setRelatedContent(filtered);
    } catch (error) {
      console.error('Error fetching related content:', error);
    }
  }, []);
  
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getContributorTypeLabel = (type: string) => {
    switch (type) {
      case 'member': return 'PGV Member';
      case 'guest': return 'Non-Member Guest';
      case 'mentor': return 'Mentor';
      case 'creator': return 'Content Creator';
      default: return type;
    }
  };
  
  const getContributionTypeLabel = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  const getContributorInitials = (name: string) => {
    if (!name) return 'PGV';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const handleShare = () => {
    // In a real implementation, this would open a share dialog
    // For now, we'll just copy the URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-pgv-green mb-4" />
            <p className="text-muted-foreground">Loading contribution details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!contribution) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto py-12 px-4">
            <div className="text-center py-12 bg-muted rounded-lg">
              <h3 className="text-xl font-medium mb-2">Contribution not found</h3>
              <p className="text-muted-foreground mb-4">The contribution you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/contribute/hub')}>Back to Content Hub</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto py-8 px-4">
          {/* Back button */}
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/contribute/hub')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content Hub
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content column */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{contribution.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center mt-2">
                          <Badge variant="outline" className="mr-2">
                            {getContributionTypeLabel(contribution.contributionType)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(contribution.createdAt)}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Content type specific display */}
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{contribution.description}</p>
                    
                    {contribution.videoUrl && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium mb-2">Video</h4>
                        <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                          {/* In a real implementation, this would be an embedded video player */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button onClick={() => window.open(contribution.videoUrl, '_blank')}>
                              Watch Video
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {contribution.keyPoints && contribution.keyPoints.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium mb-2">Key Points</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {contribution.keyPoints.map((point: string, index: number) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Display pros and cons for gear reviews */}
                    {contribution.contributionType === 'gear-review' && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {contribution.pros && contribution.pros.length > 0 && (
                          <div className="bg-green-50 p-4 rounded-md">
                            <h4 className="text-lg font-medium mb-2 text-green-700">Pros</h4>
                            <ul className="list-disc pl-5 space-y-1 text-green-800">
                              {contribution.pros.map((pro: string, index: number) => (
                                <li key={index}>{pro}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {contribution.cons && contribution.cons.length > 0 && (
                          <div className="bg-red-50 p-4 rounded-md">
                            <h4 className="text-lg font-medium mb-2 text-red-700">Cons</h4>
                            <ul className="list-disc pl-5 space-y-1 text-red-800">
                              {contribution.cons.map((con: string, index: number) => (
                                <li key={index}>{con}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Display gear details for gear reviews */}
                    {contribution.contributionType === 'gear-review' && contribution.gearBrand && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium mb-2">Gear Details</h4>
                        <div className="bg-muted p-4 rounded-md">
                          <p><strong>Brand:</strong> {contribution.gearBrand}</p>
                          {contribution.gearModel && <p><strong>Model:</strong> {contribution.gearModel}</p>}
                          {contribution.gearType && <p><strong>Type:</strong> {contribution.gearType}</p>}
                          {contribution.rating && (
                            <p>
                              <strong>Rating:</strong> 
                              <span className="ml-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className={i < contribution.rating ? "text-yellow-500" : "text-gray-300"}>
                                    ★
                                  </span>
                                ))}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Display swing type for swing videos */}
                    {(contribution.contributionType === 'swing-video' || contribution.contributionType === 'swing-demo') && contribution.swingType && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium mb-2">Swing Details</h4>
                        <div className="bg-muted p-4 rounded-md">
                          <p><strong>Swing Type:</strong> {contribution.swingType}</p>
                          {contribution.difficultyLevel && <p><strong>Difficulty Level:</strong> {contribution.difficultyLevel}</p>}
                        </div>
                      </div>
                    )}
                    
                    {/* Engagement metrics */}
                    <div className="mt-8 flex items-center space-x-6">
                      <div className="flex items-center">
                        <ThumbsUp className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{likeCount} likes</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{commentCount} comments</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground">{viewCount} views</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-6 flex flex-col items-start">
                  <h4 className="text-lg font-medium mb-4">Comments</h4>
                  <div className="w-full p-6 bg-muted rounded-md text-center">
                    <p className="text-muted-foreground">Comments will be available in a future update.</p>
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            {/* Sidebar column */}
            <div>
              {/* Contributor information */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Contributor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarFallback>{getContributorInitials(contribution.contributorName || 'PGV User')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{contribution.contributorName || 'PGV User'}</p>
                      <p className="text-sm text-muted-foreground">{getContributorTypeLabel(contribution.contributorType)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Related content */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Content</CardTitle>
                </CardHeader>
                <CardContent>
                  {relatedContent.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No related content found.</p>
                  ) : (
                    <div className="space-y-4">
                      {relatedContent.map((item) => (
                        <div key={item.id} className="group">
                          <a 
                            href={`/contribute/hub/${item.id}`} 
                            className="block hover:no-underline"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/contribute/hub/${item.id}`);
                            }}
                          >
                            <h5 className="font-medium group-hover:text-pgv-green transition-colors">{item.title}</h5>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                            <div className="flex items-center mt-2">
                              <Badge variant="outline" className="text-xs">
                                {getContributionTypeLabel(item.contributionType)}
                              </Badge>
                              <span className="text-xs text-muted-foreground ml-2">
                                {formatDate(item.createdAt)}
                              </span>
                            </div>
                          </a>
                          <Separator className="mt-4" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/contribute/hub')}
                  >
                    View All Content
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContributionDetailView;
