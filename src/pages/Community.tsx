import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  ChevronDown,
  Calendar,
  ThumbsUp,
  Flame
} from "lucide-react";
import { 
  getCommunityPosts, 
  createCommunityPost,
  type CommunityPost as PostType,
  type SortOption
} from "@/api/community-api"; 
import CommunityPost from "@/components/CommunityPost";
import withErrorBoundary from '@/components/withErrorBoundary';
import { supabase } from '@/lib/supabase';

export default withErrorBoundary(function Community() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [crewId, setCrewId] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [page, setPage] = useState(1);
  const limit = 10;
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Load posts when component mounts or sort/page changes
  useEffect(() => {
    loadPosts();
  }, [sortBy, page, crewId]);
  
  // Fetch user's crew ID
  useEffect(() => {
    const fetchCrewId = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('crew_id')
          .eq('id', user.id)
          .single();
        if (data && data.crew_id) setCrewId(data.crew_id);
      }
    };
    fetchCrewId();
  }, [user]);
  
  // Load posts from API
  const loadPosts = async (append: boolean = false) => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const { posts: newPosts, total: totalPosts } = await getCommunityPosts(limit, offset, sortBy, crewId || undefined);
      
      setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
      setTotal(totalPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new post
  const handleCreatePost = async () => {
    if (!user) {
      navigate("/login?return_to=/community");
      return;
    }
    
    if (!newPostContent.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setCreating(true);
      const newPost = await createCommunityPost(newPostContent);
      setPosts(prev => [newPost, ...prev]);
      setNewPostContent("");
      toast({
        title: "Success",
        description: "Your post has been published",
      });
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setCreating(false);
    }
  };
  
  // Update a post in the list
  const handlePostUpdate = (updatedPost: PostType) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };
  
  // Load more posts
  const loadMore = () => {
    if (posts.length < total) {
      setPage(prev => prev + 1);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Your Crew Feed</h1>
          <p className="text-muted-foreground mb-6">Posts from your crew only. Connect and share your journey!</p>
          
          {/* Create Post Card */}
          <Card className="mb-8 border-2 border-pgv-green shadow-lg">
            <CardContent className="pt-6">
              <div className="flex gap-4 flex-col sm:flex-row">
                <Avatar className="h-10 w-10 hidden sm:block">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{user?.user_metadata?.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <Textarea
                    placeholder={user ? "What's on your mind? (Post to your crew)" : "Sign in to post in the community"}
                    className="min-h-[100px] mb-3 border-2 border-pgv-green focus:ring-pgv-green"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    disabled={!user || creating}
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleCreatePost} 
                      disabled={!user || creating || !newPostContent.trim()}
                      className="w-full sm:w-auto bg-pgv-green text-white font-bold border-2 border-pgv-green shadow-md hover:bg-pgv-green/90 hover:shadow-lg transition"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting... (Crew)
                        </>
                      ) : (
                        <>Post to Crew</>  
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Sort Options */}
          <div className="mb-6">
            <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="latest" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Latest
                </TabsTrigger>
                <TabsTrigger value="popular" className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  Popular
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-1">
                  <Flame className="h-4 w-4" />
                  Trending
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Posts List */}
          {loading && posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-pgv-green mb-4" />
              <p className="text-muted-foreground">Loading community posts...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <CommunityPost 
                  key={post.id} 
                  post={post} 
                  onPostUpdate={handlePostUpdate} 
                />
              ))}
              
              {/* Load More Button */}
              {posts.length < total && (
                <div className="flex justify-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
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
            </div>
          ) : (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-4">No posts yet. Be the first to share something with the community!</p>
              {!user && (
                <Button onClick={() => navigate("/login?return_to=/community")}>
                  Sign In to Post
                </Button>
              )}
              {user && (
                <Button onClick={() => document.querySelector('textarea')?.focus()}>
                  Create First Post
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      <div ref={bottomRef} />
    </div>
  );
}, 'community');
