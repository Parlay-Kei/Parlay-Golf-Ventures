import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Heart, MessageSquare, Send, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { 
  togglePostLike, 
  getPostComments,
  addComment,
  type CommunityPost as PostType,
  type Comment 
} from "@/api/community-api"; 

interface CommunityPostProps {
  post: PostType;
  onPostUpdate: (updatedPost: PostType) => void;
}

export default function CommunityPost({ post, onPostUpdate }: CommunityPostProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, "MMM d, yyyy 'at' h:mm a");
    }
  };
  
  // Toggle like on a post
  const handleToggleLike = async () => {
    if (!user) {
      navigate("/login?return_to=/community");
      return;
    }
    
    try {
      const isLiked = !!post.is_liked_by_user;
      await togglePostLike(post.id, isLiked ? "unlike" : "like");
      
      // Update post with new like status
      onPostUpdate({
        ...post,
        likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
        is_liked_by_user: !isLiked
      });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };
  
  // Toggle comments visibility and load if needed
  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      await loadComments();
    }
    setShowComments(!showComments);
  };
  
  // Load comments for the post
  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const postComments = await getPostComments(post.id);
      setComments(postComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };
  
  // Submit a new comment
  const handleSubmitComment = async () => {
    if (!user) {
      navigate("/login?return_to=/community");
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmittingComment(true);
      const comment = await addComment(post.id, newComment);
      
      // Add new comment to the list
      setComments(prev => [...prev, comment]);
      
      // Update post comment count
      onPostUpdate({
        ...post,
        comments_count: post.comments_count + 1
      });
      
      // Clear comment input
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar_url || undefined} />
              <AvatarFallback>{post.author?.full_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author?.full_name || "Anonymous"}</p>
              <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
            </div>
          </div>
          {post.updated_at !== post.created_at && (
            <Badge variant="outline" className="text-xs">Edited</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 ${post.is_liked_by_user ? 'text-red-500' : ''}`}
            onClick={handleToggleLike}
          >
            <Heart className={`h-4 w-4 ${post.is_liked_by_user ? 'fill-current' : ''}`} />
            <span>{post.likes_count}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={toggleComments}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments_count}</span>
          </Button>
        </div>
      </CardFooter>
      
      {/* Comments Section */}
      {showComments && (
        <div className="px-6 pb-4">
          <Separator className="mb-4" />
          
          {/* Comments List */}
          {loadingComments ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-pgv-green" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.avatar_url || undefined} />
                    <AvatarFallback>{comment.author?.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="font-medium text-sm">{comment.author?.full_name || "Anonymous"}</p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(comment.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-2">No comments yet. Be the first to comment!</p>
          )}
          
          {/* Add Comment */}
          <div className="flex gap-3 items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.user_metadata?.full_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-grow relative">
              <Input
                placeholder={user ? "Write a comment..." : "Sign in to comment"}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!user || submittingComment}
                className="pr-10"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full"
                disabled={!user || submittingComment || !newComment.trim()}
                onClick={handleSubmitComment}
              >
                {submittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
