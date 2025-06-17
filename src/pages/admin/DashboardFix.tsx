import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { mockDataService } from '@/lib/mockData';
import DashboardOverview from '@/components/admin/DashboardOverview';
import SignupAnalytics from '@/components/admin/SignupAnalyticsFix';
import GoLiveRoadmap from '@/components/admin/GoLiveRoadmap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, Calendar, ShoppingBag, Bell, LogOut, Beaker, ExternalLink, 
  BarChart, Settings, Shield, HelpCircle, Home, Search, AlertTriangle, Rocket 
} from 'lucide-react';
import SignUpsTab from '@/components/admin/SignUpsTab';
import ContentTab from '@/components/admin/ContentTab';
import CommunicationsTab from '@/components/admin/CommunicationsTab';
import TournamentsTab from '@/components/admin/TournamentsTab';
import AnalyticsTab from '@/components/admin/AnalyticsTab';
import SettingsTab from '@/components/admin/SettingsTab';
import { betaService } from '@/lib/services/betaService';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AdminToolsFallback } from '@/components/fallbacks';
import withErrorBoundary from '@/components/withErrorBoundary';

// Mock data for notifications
const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'New User Registration', message: 'John Doe has registered as a new user', created_at: new Date().toISOString(), read: false },
  { id: 2, title: 'Content Submission', message: 'A new swing analysis has been submitted for review', created_at: new Date(Date.now() - 3600000).toISOString(), read: false },
  { id: 3, title: 'Tournament Registration', message: '5 new players registered for the upcoming tournament', created_at: new Date(Date.now() - 7200000).toISOString(), read: true },
  { id: 4, title: 'System Update', message: 'Platform will undergo maintenance tonight at 2 AM EST', created_at: new Date(Date.now() - 86400000).toISOString(), read: true },
];

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

// Mock data for stats
const MOCK_STATS = {
  totalUsers: 1254,
  pendingApprovals: 15,
  activeContent: 342,
  upcomingTournaments: 3
};

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

const AdminDashboardContent = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBetaMode, setIsBetaMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeContent: 0,
    upcomingTournaments: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    // In development mode, bypass admin check
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Bypassing admin check for dashboard');
      
      // Set mock data directly
      setStats(MOCK_STATS);
      setNotifications(MOCK_NOTIFICATIONS);
      setIsBetaMode(betaService.getCurrentBetaStatus());
      return;
    }
    
    // Check if user is admin, if not redirect to login
    if (!isAdmin) {
      navigate('/admin/login');
    }
    
    // Check beta mode status safely inside a try/catch block
    try {
      setIsBetaMode(betaService.getCurrentBetaStatus());
    } catch (error) {
      console.error('Error checking beta status:', error);
      // Default to true if there's an error
      setIsBetaMode(true);
    }
    
    // In production, try to fetch real data
    fetchStats();
    fetchNotifications();

    // Set up real-time subscription for notifications
    try {
      const subscription = supabase
        .channel('admin_notifications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notifications' }, (payload) => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }
  }, [isAdmin, navigate]);

  // Function to fetch stats from the database
  const fetchStats = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // In development, use mock data service
        const mockStats = await mockDataService.getDashboardStats();
        setStats(mockStats);
        return;
      }
      
      // Fetch user count
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      if (userError) throw userError;

      // Fetch pending approvals count
      const { data: approvalData, error: approvalError } = await supabase
        .from('content_submissions')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      if (approvalError) throw approvalError;

      // Fetch active content count
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('id', { count: 'exact' })
        .eq('status', 'active');

      if (contentError) throw contentError;

      // Fetch upcoming tournaments count
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('id', { count: 'exact' })
        .gt('start_date', new Date().toISOString());

      if (tournamentError) throw tournamentError;

      setStats({
        totalUsers: userData?.length || 0,
        pendingApprovals: approvalData?.length || 0,
        activeContent: contentData?.length || 0,
        upcomingTournaments: tournamentData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use mock data as fallback
      const mockStats = await mockDataService.getDashboardStats();
      setStats(mockStats);
    }
  };

  // Function to fetch notifications from the database
  const fetchNotifications = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // In development mode, use the mock notifications
        setNotifications(MOCK_NOTIFICATIONS);
        return;
      }
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Use mock data as fallback
      setNotifications(MOCK_NOTIFICATIONS);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-md ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              {!isCollapsed && <h2 className="text-xl font-bold">Admin Panel</h2>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1"
              >
                {isCollapsed ? '→' : '←'}
              </Button>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-2">
              <li>
                <Button
                  variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}
                  onClick={() => handleTabChange('dashboard')}
                >
                  <Home className="h-5 w-5 mr-2" />
                  {!isCollapsed && <span>Dashboard</span>}
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === 'signups' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}
                  onClick={() => handleTabChange('signups')}
                >
                  <Users className="h-5 w-5 mr-2" />
                  {!isCollapsed && <span>Sign Ups</span>}
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === 'content' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}
                  onClick={() => handleTabChange('content')}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  {!isCollapsed && <span>Content</span>}
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === 'communications' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}
                  onClick={() => handleTabChange('communications')}
                >
                  <Bell className="h-5 w-5 mr-2" />
                  {!isCollapsed && <span>Communications</span>}
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === 'tournaments' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}
                  onClick={() => handleTabChange('tournaments')}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {!isCollapsed && <span>Tournaments</span>}
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}
                  onClick={() => handleTabChange('analytics')}
                >
                  <BarChart className="h-5 w-5 mr-2" />
                  {!isCollapsed && <span>Analytics</span>}
                </Button>
              </li>
              <li>
                <Button
                  variant={activeTab === 'settings' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}
                  onClick={() => handleTabChange('settings')}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  {!isCollapsed && <span>Settings</span>}
                </Button>
              </li>
            </ul>
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? 'justify-center px-2' : 'px-4'} text-red-500 hover:text-red-700 hover:bg-red-50`}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 w-full max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-2">
                        <div className="flex items-center w-full">
                          <span className="font-medium">{notification.title}</span>
                          {!notification.read && (
                            <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                        <span className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-center text-sm text-gray-500">
                      No notifications
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatar.png" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Documentation</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {activeTab === 'dashboard' && (
            <div>
              <DashboardOverview stats={stats} />
              <div className="mt-6">
                <GoLiveRoadmap />
              </div>
              <div className="mt-6">
                <SignupAnalytics />
              </div>
            </div>
          )}
          {activeTab === 'signups' && <SignUpsTab />}
          {activeTab === 'content' && <ContentTab />}
          {activeTab === 'communications' && <CommunicationsTab />}
          {activeTab === 'tournaments' && <TournamentsTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <ErrorBoundary routeName="admin-dashboard" fallback={<AdminToolsFallback />}>
      <AdminDashboardContent />
    </ErrorBoundary>
  );
};

export default withErrorBoundary(AdminDashboard, 'admin-dashboard-fix');
