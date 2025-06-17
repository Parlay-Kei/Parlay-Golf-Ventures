import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeatures } from '@/lib/features';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

type SubscriptionTier = 'free' | 'driven' | 'aspiring' | 'breakthrough';

// Define tier order for comparison
const tierOrder: Record<SubscriptionTier, number> = {
  'free': 0,
  'driven': 1,
  'aspiring': 2,
  'breakthrough': 3
};

interface LockedContentProps {
  title: string;
  description?: string;
  requiredTier: SubscriptionTier;
  thumbnail?: string;
  teaserContent?: ReactNode;
  comingSoon?: boolean;
  releaseDate?: string;
  children: ReactNode;
}

export default function LockedContent({
  title,
  description,
  requiredTier,
  thumbnail,
  teaserContent,
  comingSoon = false,
  releaseDate,
  children
}: LockedContentProps) {
  const navigate = useNavigate();
  const { userTier } = useFeatures();
  
  // Check if user has access to this content
  const hasAccess = checkTierAccess(userTier, requiredTier);
  
  // If user has access, show the actual content
  if (hasAccess && !comingSoon) {
    return <>{children}</>;
  }
  
  // Get the appropriate badge for the required tier
  const tierBadge = getTierBadge(requiredTier);
  
  return (
    <Card className="border-2 border-amber-200 overflow-hidden">
      {comingSoon && (
        <div className="bg-amber-500 text-white text-center py-1 font-medium text-sm">
          COMING SOON
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            <span>{title}</span>
          </CardTitle>
          {tierBadge}
        </div>
        {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
      </CardHeader>
      
      <CardContent>
        <div className="bg-amber-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
            <Sparkles className="h-4 w-4" />
            <span>
              {comingSoon 
                ? 'This content is coming soon' 
                : `This content requires ${requiredTier} membership`}
            </span>
          </div>
          
          {releaseDate && (
            <p className="text-sm text-amber-600 mb-2">
              Expected release: {releaseDate}
            </p>
          )}
          
          <p className="text-sm text-amber-600">
            {userTier 
              ? `Your current tier: ${userTier}. ${tierOrder[userTier as SubscriptionTier] < tierOrder[requiredTier] ? 'Upgrade required.' : 'You will have access when released.'}` 
              : 'Sign in or create an account to access this content.'}
          </p>
          
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getTierColor(requiredTier)}`}
                style={{ width: userTier ? `${(tierOrder[userTier as SubscriptionTier] / tierOrder.breakthrough) * 100}%` : '0%' }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">
              {userTier ? `${tierOrder[userTier as SubscriptionTier] >= tierOrder[requiredTier] ? '✓ Eligible' : 'Upgrade needed'}` : 'Not signed in'}
            </span>
          </div>
        </div>
        
        {thumbnail && (
          <div className="relative rounded-md overflow-hidden mb-4">
            <img 
              src={thumbnail} 
              alt={title} 
              className="w-full h-48 object-cover filter blur-sm" 
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Lock className="h-12 w-12 text-white" />
            </div>
          </div>
        )}
        
        {teaserContent && (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Preview</h3>
            <div className="prose prose-sm max-w-none">
              {teaserContent}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-pgv-green hover:bg-pgv-green/90"
          onClick={() => navigate('/subscription-new')}
        >
          Upgrade Membership
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper function to check if a user's tier gives access to content
function checkTierAccess(userTier: string | null, requiredTier: SubscriptionTier): boolean {
  if (!userTier) return requiredTier === 'free';
  
  return tierOrder[userTier as SubscriptionTier] >= tierOrder[requiredTier];
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

// Helper function to get a color for a tier
function getTierColor(tier: SubscriptionTier): string {
  switch (tier) {
    case 'free':
      return 'bg-blue-500';
    case 'driven':
      return 'bg-purple-500';
    case 'aspiring':
      return 'bg-pgv-green';
    case 'breakthrough':
      return 'bg-pgv-gold';
    default:
      return 'bg-gray-500';
  }
}
