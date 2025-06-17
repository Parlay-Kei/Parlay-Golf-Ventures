// @ts-nocheck
/* This file has TypeScript checking disabled due to circular type references */
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ChevronDown, User, Search } from "lucide-react";
import {
  EnhancedDropdownMenu,
  EnhancedDropdownMenuContent,
  EnhancedDropdownMenuItem,
  EnhancedDropdownMenuSeparator,
  EnhancedDropdownMenuTrigger,
} from "@/components/ui/enhanced-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import InfoTicker from "@/components/InfoTicker";
import { createPortal } from "react-dom";
import MobileNav from "./MobileNav";
import { useThrottledCallback } from "@/hooks/useThrottle";
import { useAuth } from "@/contexts/AuthContext";

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Define a proper interface for the profile data
interface UserProfile {
  full_name?: string;
  avatar_url?: string;
}

// No need for a ProfileResponse interface, we'll use type assertions

const Header = () => {
  // Use the auth context instead of managing user state locally
  const { user, isAdmin, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Memoize scroll position threshold
  const scrollThreshold = useMemo(() => 10, []);

  // Create throttled scroll handler with useCallback + useThrottledCallback
  const handleScroll = useThrottledCallback(() => {
    if (window.scrollY > scrollThreshold) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  }, 100); // Throttle to once every 100ms

  // Handle scroll effect for transparent header
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    // Initial check for page load with scroll already applied
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!activeDropdown) return;
      
      const targetElement = event.target as Element;
      
      const isToggleButton = targetElement.closest(`[data-dropdown-toggle="${activeDropdown}"]`);
      
      const isInsideDropdown = targetElement.closest(`[data-dropdown-menu="${activeDropdown}"]`);
      
      if (!isToggleButton && !isInsideDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [activeDropdown]);

  // Fetch profile data in the useEffect directly
  useEffect(() => {
    // Only fetch if user exists
    if (!user) return;
    
    // Define the fetch function inside the effect
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        if (data) {
          // Use type assertion to handle the response data
          setUserProfile({
            full_name: (data as any).full_name || '',
            avatar_url: (data as any).avatar_url || ''
          });
        }
      } catch (error) {
        console.error('Error in profile fetch:', error);
      }
    };
    
    // Call the function
    fetchProfile();
    
  }, [user]); // Only depend on user

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  const isHomePage = location.pathname === '/';
  // Memoize header classes based on scroll state
  const headerClasses = useMemo(() => {
    const baseClasses = "w-full z-[1001] transition-all duration-400";
    return isScrolled || !isHomePage
      ? `${baseClasses} bg-pgv-cream py-2 shadow-header`
      : `${baseClasses} bg-pgv-forest py-3 relative overflow-hidden`;
  }, [isScrolled, isHomePage]);

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  const getUserInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }
    return user?.email ? user.email[0].toUpperCase() : 'U';
  };

  // Get dropdown position based on button position
  const getDropdownPosition = (buttonId: string) => {
    const button = document.querySelector(`[data-dropdown-toggle="${buttonId}"]`);
    if (!button) return { top: 70, left: 0 };
    
    const rect = button.getBoundingClientRect();
    return {
      top: rect.bottom,
      left: buttonId === 'more' ? rect.right - 192 : rect.left, // 192 is width of dropdown (48px * 4)
    };
  };

  // Render dropdown portals
  const renderDropdownPortals = () => {
    if (!activeDropdown) return null;
    
    const position = getDropdownPosition(activeDropdown);
    
    if (activeDropdown === 'academy') {
      return createPortal(
        <div 
          className="fixed w-48 bg-pgv-cream rounded-md shadow-lg border border-pgv-gold/30 z-[9999999]" 
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
          data-dropdown-menu="academy"
        >
          <div className="py-1">
            <Link to="/academy" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">Academy Home</Link>
            <Link to="/academy/short-game-secrets" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">Short Game Secrets</Link>
            <Link to="/academy/dashboard" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">My Dashboard</Link>
            <Link to="/academy/schedule-review" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">Schedule Review</Link>
            <Link to="/coming-soon" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">Coming Soon</Link>
          </div>
        </div>,
        document.body
      );
    } else if (activeDropdown === 'community') {
      return createPortal(
        <div 
          className="fixed w-48 bg-pgv-cream rounded-md shadow-lg border border-pgv-gold/30 z-[9999999]" 
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
          data-dropdown-menu="community"
        >
          <div className="py-1">
            <Link to="/community" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">Community Home</Link>
            <Link to="/contribution/hub" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">Swing Analysis</Link>
            <Link to="/coming-soon/tournaments" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">Tournaments</Link>
            <Link to="/coming-soon/leaderboards" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">Leaderboards</Link>
          </div>
        </div>,
        document.body
      );
    } else if (activeDropdown === 'more') {
      return createPortal(
        <div 
          className="fixed w-48 bg-pgv-cream rounded-md shadow-lg border border-pgv-gold/30 z-[9999999]" 
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
          data-dropdown-menu="more"
        >
          <div className="py-1">
            <Link to="/community" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">Community</Link>
            <Link to="/contribute/hub" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">Content Hub</Link>
            <Link to="/membership" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">Membership</Link>
            <Link to="/store" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">Store</Link>
            <Link to="/coming-soon" className="block px-4 py-2 text-sm text-text-main hover:bg-pgv-forest hover:text-text-inverse transition-colors duration-200">Coming Soon</Link>
          </div>
        </div>,
        document.body
      );
    }
    
    return null;
  };

  const renderUserDropdown = () => {
    if (!user) return null;

    return (
      <EnhancedDropdownMenu>
        <EnhancedDropdownMenuTrigger 
          className="flex items-center space-x-1 hover:text-pgv-gold transition-colors" 
          menuId="user-dropdown"
          ariaLabel="User menu"
        >
          <Avatar className="h-8 w-8 border border-pgv-gold">
            <AvatarImage src={userProfile?.avatar_url || ''} alt="User avatar" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </EnhancedDropdownMenuTrigger>
        <EnhancedDropdownMenuContent 
          className="w-56 bg-pgv-forest text-white border-pgv-gold" 
          menuId="user-dropdown"
          ariaLabel="User menu options"
        >
          <div className="px-2 py-1.5 text-sm">
            <p className="font-medium">{userProfile?.full_name || 'User'}</p>
          </div>
          <EnhancedDropdownMenuSeparator className="bg-pgv-gold/20" />
          <EnhancedDropdownMenuItem asChild>
            <Link to="/dashboard" className="cursor-pointer hover:bg-pgv-gold/20 hover:text-white focus:bg-pgv-gold/20">
              Dashboard
            </Link>
          </EnhancedDropdownMenuItem>
          <EnhancedDropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer hover:bg-pgv-gold/20 hover:text-white focus:bg-pgv-gold/20">
              Profile
            </Link>
          </EnhancedDropdownMenuItem>
          <EnhancedDropdownMenuItem asChild>
            <Link to="/billing" className="cursor-pointer hover:bg-pgv-gold/20 hover:text-white focus:bg-pgv-gold/20">
              Billing
            </Link>
          </EnhancedDropdownMenuItem>
          <EnhancedDropdownMenuSeparator className="bg-pgv-gold/20" />
          <EnhancedDropdownMenuItem 
            onClick={handleSignOut}
            className="cursor-pointer text-pgv-rust hover:bg-pgv-gold/20 hover:text-pgv-rust focus:bg-pgv-gold/20"
          >
            Sign out
          </EnhancedDropdownMenuItem>
        </EnhancedDropdownMenuContent>
      </EnhancedDropdownMenu>
    );
  };

  const renderDropdownMenu = (title: string, items: { label: string; href: string }[]) => {
    const menuId = `${title.toLowerCase()}-dropdown`;
    
    return (
      <EnhancedDropdownMenu>
        <EnhancedDropdownMenuTrigger 
          className="flex items-center space-x-1 hover:text-pgv-gold transition-colors" 
          menuId={menuId}
          ariaLabel={`${title} menu`}
        >
          <span>{title}</span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </EnhancedDropdownMenuTrigger>
        <EnhancedDropdownMenuContent 
          className="w-56 bg-pgv-forest text-white border-pgv-gold z-[9999999]" 
          menuId={menuId}
          ariaLabel={`${title} menu options`}
        >
          {items.map((item, index) => (
            <EnhancedDropdownMenuItem key={index} asChild>
              <Link 
                to={item.href} 
                className="cursor-pointer hover:bg-pgv-gold/20 hover:text-white focus:bg-pgv-gold/20"
              >
                {item.label}
              </Link>
            </EnhancedDropdownMenuItem>
          ))}
        </EnhancedDropdownMenuContent>
      </EnhancedDropdownMenu>
    );
  };

  // Memoize navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(() => [
    { label: "Home", path: "/" },
    { label: "Membership", path: "/membership" },
  ], []);

  // Memoize user menu items
  const userMenuItems = useMemo(() => {
    if (!user) return [];
    
    return [
      { label: "My Dashboard", path: "/dashboard", icon: "dashboard" },
      { label: "My Profile", path: "/profile", icon: "profile" },
      { label: "Account Settings", path: "/settings", icon: "settings" },
      { label: "Billing", path: "/billing", icon: "billing" },
    ];
  }, [user]);

  // Memoize admin menu items
  const adminMenuItems = useMemo(() => {
    if (!user || !isAdmin) return [];
    
    return [
      { label: "Admin Dashboard", path: "/admin/dashboard", icon: "admin" },
      { label: "Error Monitoring", path: "/admin/error-monitoring", icon: "error" },
      { label: "Beta Invites", path: "/admin/beta-invites", icon: "beta" },
    ];
  }, [user, isAdmin]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[1000]">
        <header className={headerClasses}>
          <div className="container mx-auto px-4 flex items-center justify-between relative">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img 
                  src="/images/pgv-logo.svg" 
                  alt="Parlay Golf Ventures" 
                  className="h-10 md:h-12" 
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item, index) => (
                <Link 
                  key={index} 
                  to={item.path} 
                  className={`nav-link ${
                    isScrolled || !isHomePage
                      ? 'text-gray-800 hover:text-pgv-green'
                      : 'text-white hover:text-pgv-gold'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {/* Special dropdown menus that need custom rendering */}
              <div className="relative">
                {renderDropdownMenu('ACADEMY', [
                  { label: 'Academy Home', href: '/academy' },
                  { label: 'Short Game Secrets', href: '/academy/short-game-secrets' },
                  { label: 'Driving Distance', href: '/coming-soon/driving-distance' },
                  { label: 'Mental Game', href: '/coming-soon/mental-game' },
                  { label: 'Course Management', href: '/coming-soon/course-management' },
                ])}
              </div>

              <div className="relative">
                <button
                  onClick={() => toggleDropdown('community')}
                  className={`flex items-center space-x-1 hover:text-pgv-gold transition-colors ${
                    isScrolled || !isHomePage
                      ? 'text-gray-800 hover:text-pgv-green'
                      : 'text-white hover:text-pgv-gold'
                  }`}
                  data-dropdown-toggle="community"
                >
                  <span>COMMUNITY</span>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </nav>

            {/* --- Start Mobile Nav Section --- */}
            <div className="flex items-center md:hidden">
              {/* Search Icon (if desired on mobile) */}
              <Link 
                to="/search" 
                className={`nav-link mr-2 ${
                  isScrolled || !isHomePage
                    ? 'text-gray-800 hover:text-pgv-green'
                    : 'text-white hover:text-pgv-gold'
                }`}
              >
                <Search size={20} />
              </Link>
              
              {/* Render the MobileNav component */} 
              <MobileNav />
            </div>
            {/* --- End Mobile Nav Section --- */}

            {/* User Menu (Desktop) */}
            <nav className="hidden md:block">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Search Icon */}
                  <Link 
                    to="/search" 
                    className={`nav-link ${
                      isScrolled || !isHomePage
                        ? 'text-gray-800 hover:text-pgv-green'
                        : 'text-white hover:text-pgv-gold'
                    }`}
                    aria-label="Search"
                  >
                    <Search size={20} />
                  </Link>
                  
                  <EnhancedDropdownMenu>
                    <EnhancedDropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                      <Avatar className="h-8 w-8 border-2 border-pgv-gold">
                        {userProfile?.avatar_url ? (
                          <AvatarImage src={userProfile.avatar_url} alt="User avatar" />
                        ) : (
                          <AvatarFallback className="bg-pgv-green text-white">
                            {userProfile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <ChevronDown 
                        size={16} 
                        className={isScrolled || !isHomePage ? 'text-gray-800' : 'text-white'} 
                      />
                    </EnhancedDropdownMenuTrigger>
                    <EnhancedDropdownMenuContent align="end" className="w-56">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium">{userProfile?.full_name || 'Member'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      {/* User Menu Items */}
                      {userMenuItems.map((item, index) => (
                        <EnhancedDropdownMenuItem key={index} asChild>
                          <Link to={item.path} className="cursor-pointer">
                            {item.label}
                          </Link>
                        </EnhancedDropdownMenuItem>
                      ))}
                      
                      {/* Admin Menu Items - only shown if user is admin */}
                      {adminMenuItems.length > 0 && (
                        <>
                          <EnhancedDropdownMenuSeparator />
                          <div className="px-4 py-1">
                            <p className="text-xs font-medium text-pgv-green">Admin</p>
                          </div>
                          {adminMenuItems.map((item, index) => (
                            <EnhancedDropdownMenuItem key={`admin-${index}`} asChild>
                              <Link to={item.path} className="cursor-pointer">
                                {item.label}
                              </Link>
                            </EnhancedDropdownMenuItem>
                          ))}
                        </>
                      )}
                      
                      <EnhancedDropdownMenuSeparator />
                      <EnhancedDropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                        Sign Out
                      </EnhancedDropdownMenuItem>
                    </EnhancedDropdownMenuContent>
                  </EnhancedDropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button asChild variant="ghost" size="sm" className={isScrolled || !isHomePage ? 'text-gray-800 hover:text-pgv-green' : 'text-white hover:text-pgv-gold'}>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-pgv-gold hover:bg-pgv-gold-dark text-pgv-forest">
                    <Link to="/signup">Join Free</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
          
          {/* Info Ticker - positioned inside header for better integration */}
          <InfoTicker />
        </header>
        
        {/* Render dropdown portals */}
        {renderDropdownPortals()}
      </div>
      
      {/* Spacer for fixed header - using dynamic spacing with clamp() */}
      <div className="min-h-header"></div>
    </>
  );
};

export default Header;
