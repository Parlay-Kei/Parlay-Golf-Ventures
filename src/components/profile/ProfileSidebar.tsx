import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TierBadge } from '@/components/ui/tier-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { User, Settings, CreditCard, BookOpen, Award, LogOut, ChevronRight } from 'lucide-react';

export interface ProfileSidebarProps {
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * User's profile completion percentage
   */
  profileCompletion?: number;
  
  /**
   * User's academy progress percentage
   */
  academyProgress?: number;
  
  /**
   * User's pending swing uploads count
   */
  pendingSwings?: number;
  
  /**
   * User's pending feedback count
   */
  pendingFeedback?: number;
  
  /**
   * Whether to show the logout button
   */
  showLogout?: boolean;
  
  /**
   * Custom logout handler
   */
  onLogout?: () => void;
  
  /**
   * Active section for highlighting
   */
  activeSection?: 'profile' | 'settings' | 'subscription' | 'academy' | 'achievements';
}

/**
 * ProfileSidebar Component
 * 
 * A sidebar component for the user profile page that displays the user's
 * information, role, tier, and completion status.
 */
export function ProfileSidebar({
  className,
  profileCompletion = 0,
  academyProgress = 0,
  pendingSwings = 0,
  pendingFeedback = 0,
  showLogout = true,
  onLogout,
  activeSection,
}: ProfileSidebarProps) {
  const { user, signOut, isAdmin } = useAuth();
  
  // Handle logout
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await signOut();
    }
  };
  
  // Navigation items
  const navItems = [
    {
      id: 'profile',
      label: 'Profile Information',
      icon: <User className="h-4 w-4" />,
      path: '/profile',
    },
    {
      id: 'settings',
      label: 'Account Settings',
      icon: <Settings className="h-4 w-4" />,
      path: '/profile/settings',
    },
    {
      id: 'subscription',
      label: 'Membership & Billing',
      icon: <CreditCard className="h-4 w-4" />,
      path: '/profile/subscription',
    },
    {
      id: 'academy',
      label: 'Academy Progress',
      icon: <BookOpen className="h-4 w-4" />,
      path: '/profile/academy',
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: <Award className="h-4 w-4" />,
      path: '/profile/achievements',
    },
  ];
  
  if (!user) {
    return null;
  }
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* User Info Header */}
      <CardHeader className="bg-pgv-forest text-white p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-pgv-gold">
            <AvatarImage src={user.user_metadata?.avatar_url || undefined} alt={user.user_metadata?.full_name || 'User'} />
            <AvatarFallback className="bg-pgv-gold text-pgv-forest text-xl font-bold">
              {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold truncate">
              {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {user.user_metadata?.tier && (
                <TierBadge tier={user.user_metadata.tier} size="sm" />
              )}
              
              {isAdmin && (
                <Badge variant="destructive" className="text-xs font-normal">
                  Admin
                </Badge>
              )}
              
              {user.role && user.role !== 'user' && !isAdmin && (
                <Badge variant="outline" className="text-xs font-normal bg-white/10 text-white border-white/20">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile Completion */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <span>Profile Completion</span>
            <span>{profileCompletion}%</span>
          </div>
          <ProgressBar 
            value={profileCompletion} 
            max={100} 
            variant="warning"
            size="sm"
            showValue={false}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Navigation */}
        <nav className="py-2">
          {navItems.map((item) => (
            <Link 
              key={item.id}
              to={item.path}
              className={cn(
                'flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors',
                activeSection === item.id && 'bg-slate-50 border-l-4 border-pgv-forest font-medium'
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          ))}
        </nav>
        
        <Separator />
        
        {/* Stats */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">Academy Progress</h3>
            <div className="flex justify-between items-center text-xs mb-1">
              <span>Overall Completion</span>
              <span>{academyProgress}%</span>
            </div>
            <ProgressBar 
              value={academyProgress} 
              max={100} 
              variant="default"
              size="sm"
              showValue={false}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="text-2xl font-bold text-pgv-forest">{pendingSwings}</div>
              <div className="text-xs text-slate-500">Pending Swings</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="text-2xl font-bold text-pgv-forest">{pendingFeedback}</div>
              <div className="text-xs text-slate-500">Pending Feedback</div>
            </div>
          </div>
        </div>
      </CardContent>
      
      {showLogout && (
        <CardFooter className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * ProfileSidebarSkeleton Component
 * 
 * A skeleton loader for the ProfileSidebar component.
 */
export function ProfileSidebarSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Skeleton Header */}
      <CardHeader className="bg-pgv-forest text-white p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/20 animate-pulse" />
          
          <div className="flex-1">
            <div className="h-6 w-40 bg-white/20 rounded animate-pulse" />
            <div className="h-4 w-24 bg-white/20 rounded mt-2 animate-pulse" />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <div className="h-3 w-24 bg-white/20 rounded animate-pulse" />
            <div className="h-3 w-8 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="h-2 w-full bg-white/20 rounded animate-pulse" />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Skeleton Navigation */}
        <nav className="py-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i}
              className="flex items-center justify-between px-6 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </nav>
        
        <Separator />
        
        {/* Skeleton Stats */}
        <div className="p-6 space-y-4">
          <div>
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="flex justify-between items-center mb-1">
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-8 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-2 w-full bg-slate-200 rounded animate-pulse" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="h-8 w-12 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mt-1" />
            </div>
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="h-8 w-12 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mt-1" />
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t">
        <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
      </CardFooter>
    </Card>
  );
}
