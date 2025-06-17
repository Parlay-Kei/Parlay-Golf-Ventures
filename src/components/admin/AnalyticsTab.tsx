import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Loader2, BarChart, Users, Calendar, ShoppingBag } from 'lucide-react';

// Mock data for charts - in a real app, this would come from your database
const mockUserData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'New Users',
      data: [12, 19, 15, 25, 22, 30],
    },
  ],
};

const mockContentData = {
  labels: ['Articles', 'Videos', 'Events', 'Products'],
  datasets: [
    {
      label: 'Content Types',
      data: [25, 15, 10, 8],
    },
  ],
};

const mockEngagementData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Page Views',
      data: [1200, 1900, 2100, 2400],
    },
    {
      label: 'Unique Visitors',
      data: [800, 1200, 1400, 1600],
    },
  ],
};

export default function AnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    contentViews: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    // In a real application, you would fetch actual analytics data
    // Here we're simulating a data fetch with a timeout
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 256,
        activeUsers: 142,
        contentViews: 3450,
        conversionRate: 3.2,
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pgv-green" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Platform Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              change="+12%" 
              icon={<Users className="h-5 w-5 text-blue-600" />} 
              color="blue"
            />
            <StatCard 
              title="Active Users" 
              value={stats.activeUsers} 
              change="+5%" 
              icon={<Users className="h-5 w-5 text-green-600" />} 
              color="green"
            />
            <StatCard 
              title="Content Views" 
              value={stats.contentViews} 
              change="+18%" 
              icon={<Calendar className="h-5 w-5 text-purple-600" />} 
              color="purple"
            />
            <StatCard 
              title="Conversion Rate" 
              value={`${stats.conversionRate}%`} 
              change="+0.8%" 
              icon={<ShoppingBag className="h-5 w-5 text-yellow-600" />} 
              color="yellow"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Growth</CardTitle>
              <CardDescription>User and content growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">Chart visualization would appear here</p>
                  <p className="text-sm text-gray-400">Using a charting library like Chart.js or Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">User growth chart would appear here</p>
                  <p className="text-sm text-gray-400">Data: {JSON.stringify(mockUserData.datasets[0].data)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
                <CardDescription>Breakdown by skill level and region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="text-center">
                    <p className="text-gray-500">Pie chart would appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>Weekly active user retention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="text-center">
                    <p className="text-gray-500">Retention chart would appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Views and engagement by content type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">Content performance chart would appear here</p>
                  <p className="text-sm text-gray-400">Data: {JSON.stringify(mockContentData.datasets[0].data)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Most viewed and engaged content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Advanced Putting Techniques</p>
                    <p className="text-sm text-gray-500">Article • 1,245 views</p>
                  </div>
                  <span className="text-green-600 font-medium">+18%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Golf Swing Fundamentals</p>
                    <p className="text-sm text-gray-500">Video • 982 views</p>
                  </div>
                  <span className="text-green-600 font-medium">+12%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">Summer Golf Classic 2025</p>
                    <p className="text-sm text-gray-500">Event • 756 views</p>
                  </div>
                  <span className="text-green-600 font-medium">+8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Page views and unique visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">Engagement chart would appear here</p>
                  <p className="text-sm text-gray-400">Data: {JSON.stringify(mockEngagementData.datasets[0].data)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Avg. Session Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">4m 32s</p>
                  <p className="text-sm text-green-600 font-medium">+12% from last period</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pages Per Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">3.8</p>
                  <p className="text-sm text-green-600 font-medium">+5% from last period</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bounce Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">28%</p>
                  <p className="text-sm text-green-600 font-medium">-3% from last period</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, change, icon, color }: { title: string; value: number | string; change: string; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          <div className={`p-2 bg-${color}-100 rounded-full`}>
            {icon}
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <span className="text-green-500 font-medium">{change}</span> from last period
        </div>
      </CardContent>
    </Card>
  );
}
