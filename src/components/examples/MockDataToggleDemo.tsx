import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { devDataProvider } from '@/lib/devDataProvider';
import { DEV_CONFIG } from '@/lib/config/env';

/**
 * MockDataToggleDemo Component
 * 
 * This component demonstrates how to use the "Mock vs Live" toggle switch
 * in a real application component. It shows the current configuration
 * and allows developers to see how the data provider behaves with different settings.
 */
export function MockDataToggleDemo() {
  // Local state to track the current configuration
  const [useMockData, setUseMockData] = useState(DEV_CONFIG.DATABASE.USE_MOCK_DATA);
  const [forceMockData, setForceMockData] = useState(DEV_CONFIG.DATABASE.FORCE_MOCK_DATA);
  const [tryLiveFirst, setTryLiveFirst] = useState(DEV_CONFIG.DATABASE.TRY_LIVE_FIRST);
  const [debugDb, setDebugDb] = useState(DEV_CONFIG.DATABASE.DEBUG_DB);
  
  // State for dashboard stats
  const [stats, setStats] = useState<{
    totalUsers: number;
    pendingApprovals: number;
    activeContent: number;
    upcomingTournaments: number;
  } | null>(null);
  
  // State for loading status
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'mock' | 'unknown'>('unknown');
  
  // Load dashboard stats
  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      // Update the configuration before fetching
      DEV_CONFIG.DATABASE.USE_MOCK_DATA = useMockData;
      DEV_CONFIG.DATABASE.FORCE_MOCK_DATA = forceMockData;
      DEV_CONFIG.DATABASE.TRY_LIVE_FIRST = tryLiveFirst;
      DEV_CONFIG.DATABASE.DEBUG_DB = debugDb;
      
      // Determine what data source we're using
      if (!useMockData) {
        setDataSource('live');
      } else if (forceMockData) {
        setDataSource('mock');
      } else if (tryLiveFirst) {
        setDataSource('unknown'); // Will be determined after fetch
      } else {
        setDataSource('mock');
      }
      
      // Fetch the stats
      const dashboardStats = await devDataProvider.getDashboardStats();
      setStats(dashboardStats);
      
      // If we were using tryLiveFirst, check console logs to determine source
      if (useMockData && tryLiveFirst && !forceMockData) {
        // This is a simplification - in a real app you'd need a more robust way
        // to determine if mock data was used
        setDataSource('live'); // Assume live first, may be overridden by mock fallback
        
        // Check if any values match the mock data exactly
        const mockStats = {
          totalUsers: devDataProvider.profiles.getAll().then(r => r.data?.length || 0),
          pendingApprovals: devDataProvider.submissions.getPending().then(r => r.data?.length || 0),
          activeContent: devDataProvider.content.getByStatus('active').then(r => r.data?.length || 0),
          upcomingTournaments: devDataProvider.tournaments.getUpcoming().then(r => r.data?.length || 0),
        };
        
        const mockValues = await Promise.all(Object.values(mockStats));
        const statsValues = Object.values(dashboardStats);
        
        if (JSON.stringify(mockValues) === JSON.stringify(statsValues)) {
          setDataSource('mock');
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, [useMockData, forceMockData, tryLiveFirst, debugDb]);
  
  // Load stats on initial render
  useEffect(() => {
    loadStats();
  }, [loadStats]);
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Mock vs Live Data Toggle Demo</CardTitle>
        <CardDescription>
          This component demonstrates how to use the "Mock vs Live" toggle switch in your components.
          Change the settings and click "Refresh Data" to see how the data provider behaves.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="settings">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="data">Data Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-mock-data"
                  checked={useMockData}
                  onCheckedChange={setUseMockData}
                />
                <Label htmlFor="use-mock-data">Use Mock Data</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="force-mock-data"
                  checked={forceMockData}
                  disabled={!useMockData}
                  onCheckedChange={setForceMockData}
                />
                <Label htmlFor="force-mock-data">Force Mock Data</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="try-live-first"
                  checked={tryLiveFirst}
                  disabled={!useMockData || forceMockData}
                  onCheckedChange={setTryLiveFirst}
                />
                <Label htmlFor="try-live-first">Try Live First</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="debug-db"
                  checked={debugDb}
                  onCheckedChange={setDebugDb}
                />
                <Label htmlFor="debug-db">Debug Database</Label>
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Current Mode:</h3>
              <div className="flex space-x-2">
                {!useMockData && (
                  <Badge variant="default">Live Data Only</Badge>
                )}
                {useMockData && forceMockData && (
                  <Badge variant="secondary">Force Mock Data</Badge>
                )}
                {useMockData && !forceMockData && tryLiveFirst && (
                  <Badge variant="outline">Try Live First, Mock Fallback</Badge>
                )}
                {useMockData && !forceMockData && !tryLiveFirst && (
                  <Badge variant="secondary">Mock Data Only</Badge>
                )}
                {debugDb && (
                  <Badge variant="destructive">Debug Mode</Badge>
                )}
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Check the browser console to see debug logs when Debug Database is enabled.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Data Source:</h3>
                <Badge variant={dataSource === 'live' ? 'default' : dataSource === 'mock' ? 'secondary' : 'outline'}>
                  {dataSource === 'unknown' ? 'Determining...' : `${dataSource.charAt(0).toUpperCase() + dataSource.slice(1)} Data`}
                </Badge>
              </div>
              
              {loading ? (
                <div className="py-8 text-center">
                  <p>Loading data...</p>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Active Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{stats.activeContent}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Upcoming Tournaments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{stats.upcomingTournaments}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p>No data available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => {
          // Reset to default values
          setUseMockData(process.env.NODE_ENV === 'development');
          setForceMockData(false);
          setTryLiveFirst(true);
          setDebugDb(process.env.NODE_ENV === 'development');
        }}>
          Reset Defaults
        </Button>
        
        <Button onClick={loadStats} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </CardFooter>
    </Card>
  );
}
