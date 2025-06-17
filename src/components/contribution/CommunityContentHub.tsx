import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { contributionsApi } from '@/lib/api/contributions';
import { toast } from 'sonner';
import { Contribution } from '@/lib/types/contribution';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CommunityContentHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filter, setFilter] = useState<string>('latest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 9; // Number of items per page
  
  useEffect(() => {
    fetchContributions(true);
  }, [activeTab, filter, fetchContributions]);
  
  const fetchContributions = useCallback(async (reset = false) => {
    if (reset) {
      setIsLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }
    
    try {
      // Only fetch approved contributions
      const data = await contributionsApi.getContributionsByStatus('approved');
      
      // Define a mapping for tab filtering
      const tabFilterMap: Record<string, (contribution: Contribution) => boolean> = {
        all: () => true,
        member: (contribution) => contribution.contributorType === 'member',
        mentor: (contribution) => contribution.contributorType === 'mentor',
        creator: (contribution) => contribution.contributorType === 'creator',
        swing: (contribution) => typeof contribution.contributionType === 'string' && contribution.contributionType.includes('swing'),
        tutorial: (contribution) => typeof contribution.contributionType === 'string' && contribution.contributionType.includes('tutorial'),
        gear: (contribution) => typeof contribution.contributionType === 'string' && contribution.contributionType.includes('gear'),
      };
      
      // Apply filtering in the client side for now
      // In a production environment, this should be handled by the API
      const filtered = data.filter((contribution: Contribution) => {
        return tabFilterMap[activeTab] ? tabFilterMap[activeTab](contribution) : true;
      }).sort((a: Contribution, b: Contribution) => {
        if (filter === 'latest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (filter === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return 0;
      });
      
      // Implement pagination
      const currentPage = reset ? 1 : page;
      const start = 0;
      const end = currentPage * limit;
      const paginatedData = filtered.slice(start, end);
      
      setContributions(paginatedData);
      setHasMore(end < filtered.length);
      
      if (reset) {
        setPage(1);
      } else {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
      toast.error('Failed to load community content');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, filter, page, limit]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchContributions(false);
    }
  };
  
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const filteredContributions = contributions;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto py-12 px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">PGV Community Content Hub</h1>
            <p className="text-xl text-muted-foreground">
              Explore contributions from the Parlay Golf Ventures community
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex space-x-2 w-full sm:w-auto">
              <Button 
                variant={filter === 'latest' ? 'default' : 'outline'}
                onClick={() => setFilter('latest')}
                className="w-full sm:w-auto"
              >
                Latest
              </Button>
              <Button 
                variant={filter === 'oldest' ? 'default' : 'outline'}
                onClick={() => setFilter('oldest')}
                className="w-full sm:w-auto"
              >
                Oldest
              </Button>
              {/* Add more filter options as needed */}
            </div>
            <Button onClick={() => navigate('/contribute')} className="w-full sm:w-auto">
              Contribute
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 mb-8 overflow-x-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="member">Members</TabsTrigger>
              <TabsTrigger value="mentor">Mentors</TabsTrigger>
              <TabsTrigger value="creator">Creators</TabsTrigger>
              <TabsTrigger value="swing">Swings</TabsTrigger>
              <TabsTrigger value="tutorial">Tutorials</TabsTrigger>
              <TabsTrigger value="gear">Gear</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-pgv-green" />
                    <span className="ml-2 text-muted-foreground">Loading content...</span>
                  </div>
                ) : filteredContributions.length === 0 ? (
                  <div className="text-center py-12 bg-muted rounded-lg">
                    <h3 className="text-xl font-medium mb-2">No contributions yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to contribute to the community!</p>
                    <Button onClick={() => navigate('/contribute')}>Contribute Now</Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredContributions.map((contribution: Contribution) => (
                        <Card key={contribution.id} className="overflow-hidden h-full flex flex-col">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-xl">{contribution.title}</CardTitle>
                              <Badge variant="outline">{getContributionTypeLabel(String(contribution.contributionType))}</Badge>
                            </div>
                            <CardDescription className="mt-1">
                              By: {getContributorTypeLabel(contribution.contributorType)} • {formatDate(contribution.createdAt)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            <div className="prose max-w-none">
                              <p className="line-clamp-4">{contribution.description}</p>
                            </div>
                            {('videoUrl' in contribution && contribution.videoUrl) && (
                              <div className="mt-4">
                                <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                                  {/* This is a placeholder for video preview */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Button variant="outline" onClick={() => window.open(contribution.videoUrl, '_blank')}>
                                      Watch Video
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="border-t pt-4">
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => navigate(`/contribute/hub/${contribution.id}`)}
                            >
                              View Full Content
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                    
                    {/* Load More Button */}
                    {hasMore && (
                      <div className="flex justify-center mt-8">
                        <Button 
                          variant="outline" 
                          onClick={loadMore}
                          disabled={loadingMore}
                          className="w-full sm:w-auto"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading more...
                            </>
                          ) : (
                            <>
                              <ChevronDown className="mr-2 h-4 w-4" />
                              Load More
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold mb-4">Join the Community</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Share your golf journey, insights, and expertise with fellow PGV members
            </p>
            <Button size="lg" onClick={() => navigate('/contribute')}>
              Contribute
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CommunityContentHub;
