import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Video, FileText, Users, Calendar, Lock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useFeatures } from "@/lib/features";

type SearchResultType = 'lesson' | 'article' | 'video' | 'community';
type SubscriptionTier = 'free' | 'driven' | 'aspiring' | 'breakthrough';

interface SearchResultCardProps {
  id: string;
  title: string;
  type: SearchResultType;
  description?: string;
  thumbnailUrl?: string;
  url: string;
  createdAt: string;
  author?: string;
  tier: SubscriptionTier;
  tags?: string[];
  category?: string;
  highlightTerms?: string[];
}

export default function SearchResultCard({
  id,
  title,
  type,
  description,
  thumbnailUrl,
  url,
  createdAt,
  author,
  tier,
  tags,
  category,
  highlightTerms = []
}: SearchResultCardProps) {
  const { hasAccess } = useFeatures();
  const hasContentAccess = hasAccess(tier);
  
  // Get content type icon
  const getContentTypeIcon = () => {
    switch (type) {
      case "lesson":
        return <BookOpen className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "article":
        return <FileText className="h-4 w-4" />;
      case "community":
        return <Users className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };
  
  // Get tier badge
  const getTierBadge = () => {
    switch (tier) {
      case "free":
        return <Badge className="bg-blue-500">Free</Badge>;
      case "driven":
        return <Badge className="bg-purple-500">Driven</Badge>;
      case "aspiring":
        return <Badge className="bg-pgv-green">Aspiring</Badge>;
      case "breakthrough":
        return <Badge className="bg-pgv-gold text-pgv-green">Breakthrough</Badge>;
      default:
        return null;
    }
  };
  
  // Highlight search terms in text
  const highlightText = (text: string) => {
    if (!text || highlightTerms.length === 0) return text;
    
    // Create a regex pattern for all terms
    const pattern = new RegExp(`(${highlightTerms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    
    // Split by the pattern and wrap matches in highlight spans
    const parts = text.split(pattern);
    
    return parts.map((part, i) => {
      if (pattern.test(part)) {
        return <span key={i} className="bg-yellow-100 text-yellow-800">{part}</span>;
      }
      return part;
    });
  };
  
  // Format relative time
  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md ${!hasContentAccess ? 'opacity-80' : ''}`}>
      <div className="flex flex-col md:flex-row">
        {thumbnailUrl && (
          <div className="relative md:w-1/3 h-48 md:h-auto overflow-hidden">
            <img 
              src={thumbnailUrl} 
              alt={title} 
              className={`w-full h-full object-cover ${!hasContentAccess ? 'filter blur-sm' : ''}`} 
            />
            {!hasContentAccess && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Lock className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
        )}
        
        <div className={`flex-1 flex flex-col ${thumbnailUrl ? 'md:max-w-2/3' : ''}`}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="px-2 py-0 h-5">
                    {getContentTypeIcon()}
                    <span className="ml-1 capitalize">{type}</span>
                  </Badge>
                  {getTierBadge()}
                  {category && (
                    <Badge variant="secondary">{category}</Badge>
                  )}
                </div>
                
                <CardTitle className="text-xl">
                  {highlightText(title)}
                </CardTitle>
              </div>
            </div>
            
            {description && (
              <CardDescription className="mt-2 line-clamp-2">
                {highlightText(description)}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="pb-2 flex-grow">
            <div className="flex items-center text-sm text-muted-foreground gap-3">
              {author && (
                <div className="flex items-center gap-1">
                  <span>By {author}</span>
                </div>
              )}
              
              {createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{getRelativeTime(createdAt)}</span>
                </div>
              )}
            </div>
            
            {tags && tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{tags.length - 3} more</Badge>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pt-0">
            <Button 
              asChild 
              variant={hasContentAccess ? "default" : "outline"}
              className={hasContentAccess ? "bg-pgv-green hover:bg-pgv-green/90" : ""}
            >
              <Link to={hasContentAccess ? url : "/subscription-new"}>
                {hasContentAccess ? (
                  <>
                    View {type === "lesson" ? "Lesson" : type === "video" ? "Video" : type === "article" ? "Article" : "Post"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Upgrade to Access
                    <Lock className="ml-2 h-4 w-4" />
                  </>
                )}
              </Link>
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
