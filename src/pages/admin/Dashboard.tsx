import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import SignupAnalytics from '@/components/admin/SignupAnalytics';
import { useNavigate } from 'react-router-dom';
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
import { supabase } from '@/lib/supabase';

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

export default function AdminDashboard() {
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
      console.log('Error setting up real-time subscription:', error);
      // If subscription fails, still use mock data
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, [isAdmin, navigate]);

  const fetchStats = async () => {
    try {
      // In development mode, use mock data service
      if (process.env.NODE_ENV === 'development') {
        const mockStats = await mockDataService.getDashboardStats();
        setStats(mockStats);
        return;
      }
      
      // Try to fetch user stats from database
      const { data: users, error: usersError } = await supabase
        .from('academy_users')
        .select('id, status');
      
      if (usersError) throw usersError;

      // Try to fetch content stats
      const { data: content, error: contentError } = await supabase
        .from('content_items')
        .select('id, status');
      
      if (contentError) throw contentError;

      // Try to fetch tournament stats
      const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('id, status')
        .eq('status', 'upcoming');
      
      if (tournamentsError) throw tournamentsError;

      // Try to fetch pending approvals
      const { data: approvals, error: approvalsError } = await supabase
        .from('content_submissions')
        .select('id')
        .eq('status', 'pending');
      
      if (approvalsError) throw approvalsError;

      // Update stats with real data
      setStats({
        totalUsers: users?.length || 0,
        pendingApprovals: approvals?.length || 0,
        activeContent: content?.filter(item => item.status === 'active').length || 0,
        upcomingTournaments: tournaments?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use mock data as fallback
      const mockStats = await mockDataService.getDashboardStats();
      setStats(mockStats);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Use mock data if database fetch fails
      setNotifications(MOCK_NOTIFICATIONS);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview stats={stats} />;
      case 'signups':
        return <SignUpsTab />;
      case 'content':
        return <ContentTab />;
      case 'communications':
        return <CommunicationsTab />;
      case 'tournaments':
        return <TournamentsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardOverview stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-pgv-green text-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">PGV Admin Dashboard</h1>
            <span className="text-sm bg-pgv-gold text-pgv-green px-2 py-1 rounded">Admin</span>
            {isBetaMode && (
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">BETA</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 bg-pgv-green-dark text-white border-pgv-green-dark focus:border-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white opacity-70" />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-white" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="py-4 text-center text-gray-500">No new notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="py-2 px-4 cursor-pointer">
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-gray-500">{notification.message}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center space-x-2 text-white hover:bg-pgv-green-dark">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className={`md:col-span-1 ${isCollapsed ? 'md:w-16' : ''}`}>
            <Card className="sticky top-24">
              <CardHeader className={isCollapsed ? 'p-2' : ''}>
                {!isCollapsed && (
                  <>
                    <CardTitle>Admin Controls</CardTitle>
                    <CardDescription>Manage your PGV platform</CardDescription>
                  </>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2" 
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? '→' : '←'}
                </Button>
              </CardHeader>
              <CardContent className={isCollapsed ? 'p-2' : ''}>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant={activeTab === 'dashboard' ? 'default' : 'outline'}
                    className={isCollapsed ? 'justify-center p-2' : 'justify-start'}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    {!isCollapsed && 'Dashboard'}
                  </Button>
                  <Button 
                    variant={activeTab === 'signups' ? 'default' : 'outline'}
                    className={isCollapsed ? 'justify-center p-2' : 'justify-start'}
                    onClick={() => setActiveTab('signups')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {!isCollapsed && 'Sign-Ups'}
                    {!isCollapsed && stats.pendingApprovals > 0 && (
                      <Badge variant="destructive" className="ml-auto">{stats.pendingApprovals}</Badge>
                    )}
                  </Button>
                  <Button 
                    variant={activeTab === 'content' ? 'default' : 'outline'}
                    className={isCollapsed ? 'justify-center p-2' : 'justify-start'}
                    onClick={() => setActiveTab('content')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {!isCollapsed && 'Content Approval'}
                  </Button>
                  <Button 
                    variant={activeTab === 'communications' ? 'default' : 'outline'}
                    className={isCollapsed ? 'justify-center p-2' : 'justify-start'}
                    onClick={() => setActiveTab('communications')}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    {!isCollapsed && 'Communications'}
                  </Button>
                  <Button 
                    variant={activeTab === 'tournaments' ? 'default' : 'outline'}
                    className={isCollapsed ? 'justify-center p-2' : 'justify-start'}
                    onClick={() => setActiveTab('tournaments')}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {!isCollapsed && 'Tournaments & Gear'}
                  </Button>
                  <Button 
                    variant={activeTab === 'analytics' ? 'default' : 'outline'}
                    className={isCollapsed ? 'justify-center p-2' : 'justify-start'}
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    {!isCollapsed && 'Analytics'}
                  </Button>
                  <Button 
                    variant="outline"
                    className={isCollapsed ? 'justify-center p-2' : 'justify-start'}
                    onClick={() => navigate('/admin/error-monitoring')}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                    {!isCollapsed && 'Error Monitoring'}
                  </Button>
                  <Button 
                    variant={activeTab === 'settings' ? 'default' : 'outline'}
                    className={isCollapsed ? 'justify-center p-2' : 'justify-start'}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {!isCollapsed && 'Settings'}
                  </Button>
                  
                  {isBetaMode && (
                    <Button 
                      variant="outline"
                      className={isCollapsed ? 'justify-center p-2 mt-4 border-blue-500 text-blue-600 hover:bg-blue-50' : 'justify-start mt-4 border-blue-500 text-blue-600 hover:bg-blue-50'}
                      onClick={() => navigate('/admin/beta-invites')}
                    >
                      <Beaker className="h-4 w-4 mr-2" />
                      {!isCollapsed && (
                        <>
                          Beta Invites
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'signups' && 'Member Sign-Ups'}
                  {activeTab === 'content' && 'Content Approval'}
                  {activeTab === 'communications' && 'Communications'}
                  {activeTab === 'tournaments' && 'Tournaments & Gear'}
                  {activeTab === 'analytics' && 'Analytics'}
                  {activeTab === 'settings' && 'Settings'}
                </CardTitle>
                <CardDescription>
                  {activeTab === 'dashboard' && 'Overview of your PGV platform'}
                  {activeTab === 'signups' && 'View and manage member registrations'}
                  {activeTab === 'content' && 'Review and approve content submissions'}
                  {activeTab === 'communications' && 'Send notifications and emails to members'}
                  {activeTab === 'tournaments' && 'Manage tournaments and equipment inventory'}
                  {activeTab === 'analytics' && 'View analytics and insights'}
                  {activeTab === 'settings' && 'Configure your PGV platform settings'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTabContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardOverview({ stats }: { stats: { totalUsers: number; pendingApprovals: number; activeContent: number; upcomingTournaments: number } }) {
  const [isBetaMode, setIsBetaMode] = useState(false);
  
  useEffect(() => {
    // Check current beta status safely inside a try/catch block
    const checkBetaStatus = () => {
      try {
        setIsBetaMode(betaService.getCurrentBetaStatus());
      } catch (error) {
        console.error('Error checking beta status:', error);
        // Default to true if there's an error
        setIsBetaMode(true);
      }
    };
    
    checkBetaStatus();
    
    // Set up an interval to check for beta status changes
    const intervalId = setInterval(checkBetaStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Beta Mode Status Banner */}
      {!isBetaMode && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Rocket className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-800">Platform is Live!</h3>
                <p className="text-green-700">Beta mode is disabled. The platform is now in production mode.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Members</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <span className="text-green-500 font-medium">↑ 12%</span> from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                <h3 className="text-2xl font-bold">{stats.pendingApprovals}</h3>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <span className="text-red-500 font-medium">↑ 5%</span> from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Content</p>
                <h3 className="text-2xl font-bold">{stats.activeContent}</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <span className="text-green-500 font-medium">↑ 8%</span> from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Tournaments</p>
                <h3 className="text-2xl font-bold">{stats.upcomingTournaments}</h3>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <span className="text-purple-500 font-medium">New</span> tournament this week
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Signup Analytics (shown prominently when not in beta mode) */}
      {!isBetaMode && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Signup Analytics</CardTitle>
              <CardDescription>Track user signups and growth trends</CardDescription>
            </CardHeader>
            <CardContent>
              <SignupAnalytics />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">New member signed up</p>
                <p className="text-sm text-gray-500">John Doe (john.doe@example.com)</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">New content submitted</p>
                <p className="text-sm text-gray-500">"Advanced Putting Techniques" by Coach Smith</p>
                <p className="text-xs text-gray-400">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <ShoppingBag className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Tournament registration opened</p>
                <p className="text-sm text-gray-500">Summer Golf Classic 2025</p>
                <p className="text-xs text-gray-400">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Bell className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">Communication sent</p>
                <p className="text-sm text-gray-500">Monthly newsletter to 156 members</p>
                <p className="text-xs text-gray-400">2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => window.location.href = '/admin/signups'}>
              <Users className="h-4 w-4 mr-2" />
              Approve New Members
            </Button>
            <Button onClick={() => window.location.href = '/admin/content'}>
              <Calendar className="h-4 w-4 mr-2" />
              Review Content
            </Button>
            <Button onClick={() => window.location.href = '/admin/communications'}>
              <Bell className="h-4 w-4 mr-2" />
              Send Announcement
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
