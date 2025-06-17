import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { betaService } from '@/lib/services/betaService';
import { 
  Users, Calendar, ShoppingBag, Bell, Rocket, 
  ArrowUpRight, ArrowDownRight, TrendingUp, Activity,
  CheckCircle2, AlertCircle, Clock, Award
} from 'lucide-react';
import SignupAnalytics from './SignupAnalyticsFix';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AdminToolsFallback } from '@/components/fallbacks';

interface DashboardStats {
  totalUsers: number;
  pendingApprovals: number;
  activeContent: number;
  upcomingTournaments: number;
}

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  description: string;
  trend: 'up' | 'down' | 'neutral';
}

const MetricCard = ({ title, value, change, icon, description, trend }: MetricCardProps) => {
  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-gray-50 to-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className={`p-2 rounded-full ${
              trend === 'up' ? 'bg-green-100 text-green-600' : 
              trend === 'down' ? 'bg-red-100 text-red-600' : 
              'bg-blue-100 text-blue-600'
            }`}>
              {icon}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold">{value.toLocaleString()}</div>
              <div className="flex items-center mt-1">
                {trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : trend === 'down' ? (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                )}
                <span className={`text-xs font-medium ${
                  trend === 'up' ? 'text-green-500' : 
                  trend === 'down' ? 'text-red-500' : 
                  'text-blue-500'
                }`}>
                  {change}% {trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : ''}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">{description}</div>
          </div>
        </div>
        <div className="h-1 w-full bg-gray-100">
          <div 
            className={`h-full ${
              trend === 'up' ? 'bg-green-500' : 
              trend === 'down' ? 'bg-red-500' : 
              'bg-blue-500'
            }`}
            style={{ width: `${Math.min(Math.abs(change) * 2, 100)}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PlatformStatusProps {
  isBetaMode: boolean;
}

const PlatformStatus = ({ isBetaMode }: PlatformStatusProps) => {
  return (
    <Card className={`border-0 shadow-md ${isBetaMode ? 'bg-amber-50' : 'bg-green-50'}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${isBetaMode ? 'bg-amber-100' : 'bg-green-100'}`}>
            {isBetaMode ? (
              <Clock className={`h-6 w-6 ${isBetaMode ? 'text-amber-600' : 'text-green-600'}`} />
            ) : (
              <Rocket className="h-6 w-6 text-green-600" />
            )}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isBetaMode ? 'text-amber-800' : 'text-green-800'}`}>
              {isBetaMode ? 'Platform in Beta Mode' : 'Platform is Live!'}
            </h3>
            <p className={`${isBetaMode ? 'text-amber-700' : 'text-green-700'}`}>
              {isBetaMode 
                ? 'Beta testing is active. Only invited users can access the platform.'
                : 'Beta mode is disabled. The platform is now in production mode.'}
            </p>
            <div className="mt-4">
              <Button 
                size="sm" 
                variant={isBetaMode ? 'outline' : 'secondary'}
                className={isBetaMode ? 'border-amber-300 text-amber-700 hover:bg-amber-100' : 'bg-green-100 text-green-700 hover:bg-green-200 border-0'}
                onClick={() => window.location.href = '/admin/settings'}
              >
                {isBetaMode ? 'Go to Platform Settings' : 'View Analytics'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ActivityItemProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
}

const ActivityItem = ({ icon, iconBg, iconColor, title, description, time }: ActivityItemProps) => {
  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150">
      <div className={`p-2 ${iconBg} rounded-full shrink-0`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{title}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
};

const DashboardOverviewContent = ({ stats }: { stats: DashboardStats }) => {
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
      {/* Platform Status Banner */}
      <PlatformStatus isBetaMode={isBetaMode} />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Members"
          value={stats.totalUsers}
          change={12}
          trend="up"
          icon={<Users className="h-5 w-5" />}
          description="from last month"
        />
        
        <MetricCard 
          title="Pending Approvals"
          value={stats.pendingApprovals}
          change={5}
          trend="down"
          icon={<CheckCircle2 className="h-5 w-5" />}
          description="from last week"
        />
        
        <MetricCard 
          title="Active Content"
          value={stats.activeContent}
          change={8}
          trend="up"
          icon={<Calendar className="h-5 w-5" />}
          description="from last month"
        />
        
        <MetricCard 
          title="Upcoming Tournaments"
          value={stats.upcomingTournaments}
          change={100}
          trend="neutral"
          icon={<Award className="h-5 w-5" />}
          description="new this week"
        />
      </div>
      
      {/* Signup Analytics (shown prominently when not in beta mode) */}
      {!isBetaMode && (
        <div className="space-y-4">
          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Signup Analytics
                  </CardTitle>
                  <CardDescription>Track user signups and growth trends</CardDescription>
                </div>
                <Tabs defaultValue="daily" className="w-auto">
                  <TabsList className="bg-white/80 backdrop-blur-sm">
                    <TabsTrigger value="daily" className="text-xs">Daily</TabsTrigger>
                    <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <SignupAnalytics />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity and Platform Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-md lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            <ActivityItem 
              icon={<Users className="h-4 w-4" />}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              title="New member signed up"
              description="John Doe (john.doe@example.com)"
              time="2 hours ago"
            />
            
            <ActivityItem 
              icon={<Calendar className="h-4 w-4" />}
              iconBg="bg-green-100"
              iconColor="text-green-600"
              title="New content published"
              description="Swing Analysis: Drive Technique"
              time="5 hours ago"
            />
            
            <ActivityItem 
              icon={<AlertCircle className="h-4 w-4" />}
              iconBg="bg-amber-100"
              iconColor="text-amber-600"
              title="Content flagged for review"
              description="Community post #1234 reported by user"
              time="Yesterday"
            />
            
            <ActivityItem 
              icon={<Award className="h-4 w-4" />}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              title="New tournament created"
              description="Summer Championship 2025"
              time="2 days ago"
            />
          </CardContent>
          <div className="p-4 bg-gray-50 border-t">
            <Button variant="outline" size="sm" className="w-full">View All Activity</Button>
          </div>
        </Card>
        
        {/* Platform Health */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>System status and metrics</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Server Uptime</span>
                <span className="text-green-600 font-medium">99.9%</span>
              </div>
              <Progress value={99.9} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">API Response Time</span>
                <span className="text-green-600 font-medium">120ms</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Storage Usage</span>
                <span className="text-amber-600 font-medium">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Error Rate</span>
                <span className="text-green-600 font-medium">0.2%</span>
              </div>
              <Progress value={2} className="h-2" />
            </div>
            
            <div className="pt-4 border-t mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">All Systems Operational</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs h-8 px-2">
                  Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DashboardOverview = ({ stats }: { stats: DashboardStats }) => {
  return (
    <ErrorBoundary routeName="admin-dashboard-overview" fallback={<AdminToolsFallback />}>
      <DashboardOverviewContent stats={stats} />
    </ErrorBoundary>
  );
};

export default DashboardOverview;
