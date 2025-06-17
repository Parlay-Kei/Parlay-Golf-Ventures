import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TierBadge, type TierLevel } from '@/components/ui/tier-badge';
import { Calendar, MessageSquare, ThumbsUp, Eye, Share2, User, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ContributionCardProps {
  /**
   * Unique ID of the contribution
   */
  id: string;
  
  /**
   * Title of the contribution
   */
  title: string;
  
  /**
   * Brief description or excerpt
   */
  description?: string;
  
  /**
   * URL to the contribution's thumbnail image
   */
  thumbnailUrl?: string;
  
  /**
   * Alt text for the thumbnail image
   */
  thumbnailAlt?: string;
  
  /**
   * Author information
   */
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    role?: string;
  };
  
  /**
   * Creation date
   */
  createdAt: Date | string;
  
  /**
   * Categories or tags
   */
  tags?: string[];
  
  /**
   * Required tier to access this content
   */
  requiredTier?: TierLevel;
  
  /**
   * Engagement metrics
   */
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  
  /**
   * Status of the contribution (draft, pending, published, etc.)
   */
  status?: 'draft' | 'pending' | 'published' | 'rejected';
  
  /**
   * URL to navigate to when clicking the card
   */
  href?: string;
  
  /**
   * Whether the card is currently loading
   */
  isLoading?: boolean;
  
  /**
   * Card variant
   */
  variant?: 'default' | 'compact' | 'featured';
  
  /**
   * Whether to show action buttons
   */
  showActions?: boolean;
  
  /**
   * Custom action buttons
   */
  actionButtons?: React.ReactNode;
  
  /**
   * Click handler for the entire card
   */
  onClick?: (id: string) => void;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Format number with abbreviations (K, M) for large values
 */
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * ContributionCard Component
 * 
 * A card component for displaying user contributions with consistent styling,
 * proper image fallbacks, and formatted metadata.
 */
export function ContributionCard({
  id,
  title,
  description,
  thumbnailUrl,
  thumbnailAlt,
  author,
  createdAt,
  tags = [],
  requiredTier,
  metrics,
  status,
  href,
  isLoading,
  variant = 'default',
  showActions = true,
  actionButtons,
  onClick,
  className,
  ...props
}: ContributionCardProps) {
  // Format the date
  const formattedDate = typeof createdAt === 'string' 
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : formatDistanceToNow(createdAt, { addSuffix: true });
  
  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    } else if (href) {
      window.location.href = href;
    }
  };
  
  // Determine if the card is clickable
  const isClickable = Boolean(onClick || href);
  
  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-200',
        isClickable && 'hover:shadow-md cursor-pointer',
        variant === 'compact' && 'border-0 shadow-none',
        variant === 'featured' && 'border-pgv-gold/30',
        className
      )}
      onClick={isClickable ? handleClick : undefined}
      {...props}
    >
      {/* Card Image */}
      {(thumbnailUrl || variant !== 'compact') && (
        <div className={cn(
          'relative overflow-hidden',
          variant === 'compact' ? 'h-32' : 'h-48',
          variant === 'featured' && 'h-64'
        )}>
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={thumbnailAlt || title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                // Replace broken image with fallback
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = '/images/fallbacks/contribution-placeholder.jpg';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100">
              <ImageIcon className="h-12 w-12 text-slate-300" />
            </div>
          )}
          
          {/* Status badge */}
          {status && status !== 'published' && (
            <div className="absolute right-2 top-2">
              <Badge 
                variant={status === 'draft' ? 'outline' : status === 'pending' ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          )}
          
          {/* Tier badge */}
          {requiredTier && requiredTier !== 'free' && (
            <div className="absolute left-2 top-2">
              <TierBadge tier={requiredTier} size="sm" />
            </div>
          )}
        </div>
      )}
      
      <CardHeader className={variant === 'compact' ? 'p-3' : 'p-4'}>
        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <CardTitle className={cn(
          'line-clamp-2',
          variant === 'compact' ? 'text-base' : 'text-xl',
          variant === 'featured' && 'text-2xl'
        )}>
          {title}
        </CardTitle>
        
        {description && (
          <CardDescription className="line-clamp-2 mt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className={variant === 'compact' ? 'p-3 pt-0' : 'p-4 pt-0'}>
        {/* Author and date */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={author.avatarUrl} alt={author.name} />
            <AvatarFallback className="text-xs">
              {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-medium">{author.name}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          {author.role && (
            <Badge variant="outline" className="ml-auto text-xs font-normal">
              {author.role}
            </Badge>
          )}
        </div>
      </CardContent>
      
      {/* Metrics and actions */}
      {(metrics || showActions) && (
        <CardFooter className={cn(
          'flex items-center justify-between border-t bg-slate-50/50 p-2',
          variant === 'compact' ? 'text-xs' : 'text-sm'
        )}>
          {/* Metrics */}
          {metrics && (
            <div className="flex items-center gap-3">
              {metrics.views !== undefined && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{formatNumber(metrics.views)}</span>
                </div>
              )}
              {metrics.likes !== undefined && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{formatNumber(metrics.likes)}</span>
                </div>
              )}
              {metrics.comments !== undefined && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{formatNumber(metrics.comments)}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Action buttons */}
          {showActions && (
            <div className="flex items-center gap-1">
              {actionButtons || (
                <>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * ContributionCardSkeleton Component
 * 
 * A skeleton loader for the ContributionCard component.
 */
export function ContributionCardSkeleton({
  variant = 'default',
  className,
}: {
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}) {
  return (
    <Card className={cn(
      'overflow-hidden',
      variant === 'compact' && 'border-0 shadow-none',
      className
    )}>
      {/* Skeleton image */}
      {variant !== 'compact' && (
        <div className={cn(
          'animate-pulse bg-slate-200',
          variant === 'featured' ? 'h-64' : 'h-48'
        )} />
      )}
      
      <CardHeader className={variant === 'compact' ? 'p-3' : 'p-4'}>
        {/* Skeleton tags */}
        <div className="mb-2 flex gap-1">
          <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
        </div>
        
        {/* Skeleton title */}
        <div className={cn(
          'h-6 animate-pulse rounded bg-slate-200',
          variant === 'featured' ? 'w-3/4' : 'w-2/3'
        )} />
        
        {/* Skeleton description */}
        <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="mt-1 h-4 w-4/5 animate-pulse rounded bg-slate-200" />
      </CardHeader>
      
      <CardContent className={variant === 'compact' ? 'p-3 pt-0' : 'p-4 pt-0'}>
        {/* Skeleton author */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-pulse rounded-full bg-slate-200" />
          <div className="flex flex-col gap-1">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </CardContent>
      
      {/* Skeleton footer */}
      <CardFooter className="border-t bg-slate-50/50 p-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-2">
            <div className="h-4 w-12 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-12 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="flex gap-1">
            <div className="h-7 w-7 animate-pulse rounded bg-slate-200" />
            <div className="h-7 w-7 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
