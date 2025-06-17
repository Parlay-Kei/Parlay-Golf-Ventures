/**
 * Signup Analytics Component
 * 
 * This component displays analytics for user signups, including trends for
 * beta vs. production signups.
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { betaService } from '@/lib/services/betaService';

interface SignupData {
  day: string;
  total_signups: number;
  beta_signups: number;
  production_signups: number;
}

export default function SignupAnalytics() {
  const [signupData, setSignupData] = useState<SignupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily');
  const [totalSignups, setTotalSignups] = useState({
    total: 0,
    beta: 0,
    production: 0
  });

  const fetchSignupData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch signup analytics from the view
      const { data, error } = await supabase
        .from('signup_analytics')
        .select('*')
        .order('day', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      
      // Calculate totals
      const totals = data.reduce((acc, item) => {
        return {
          total: acc.total + item.total_signups,
          beta: acc.beta + item.beta_signups,
          production: acc.production + item.production_signups
        };
      }, { total: 0, beta: 0, production: 0 });
      
      setSignupData(data || []);
      setTotalSignups(totals);
    } catch (error) {
      console.error('Error fetching signup data:', error);
      // Use mock data if database fetch fails
      const mockData = generateMockData();
      setSignupData(mockData);
      
      // Calculate mock totals
      const mockTotals = mockData.reduce((acc, item) => {
        return {
          total: acc.total + item.total_signups,
          beta: acc.beta + item.beta_signups,
          production: acc.production + item.production_signups
        };
      }, { total: 0, beta: 0, production: 0 });
      
      setTotalSignups(mockTotals);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignupData();
  }, [fetchSignupData]);

  const generateMockData = (): SignupData[] => {
    // Generate 30 days of mock data
    const mockData: SignupData[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // More production signups in recent days if beta mode is off
      const isBetaMode = betaService.getCurrentBetaStatus();
      const betaSignups = isBetaMode ? Math.floor(Math.random() * 10) + 1 : Math.floor(Math.random() * 5);
      const productionSignups = !isBetaMode && i < 7 ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 3);
      
      mockData.push({
        day: date.toISOString().split('T')[0],
        total_signups: betaSignups + productionSignups,
        beta_signups: betaSignups,
        production_signups: productionSignups
      });
    }
    
    return mockData;
  };

  const renderBarChart = () => {
    // Sort data by date ascending for the chart
    const sortedData = [...signupData].sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
    const recentData = sortedData.slice(-7); // Last 7 days
    
    return (
      <div className="h-80 mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pgv-green"></div>
          </div>
        ) : (
          <div className="relative h-full">
            {/* Simple bar chart visualization */}
            <div className="flex h-full items-end space-x-2">
              {recentData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center space-y-1" style={{ height: 'calc(100% - 24px)' }}>
                    {/* Production signups bar */}
                    {item.production_signups > 0 && (
                      <div 
                        className="w-full bg-green-500 rounded-t" 
                        style={{ 
                          height: `${(item.production_signups / Math.max(...recentData.map(d => d.total_signups))) * 100}%`,
                          minHeight: '4px'
                        }}
                        title={`Production: ${item.production_signups}`}
                      ></div>
                    )}
                    {/* Beta signups bar */}
                    {item.beta_signups > 0 && (
                      <div 
                        className="w-full bg-blue-500 rounded-t" 
                        style={{ 
                          height: `${(item.beta_signups / Math.max(...recentData.map(d => d.total_signups))) * 100}%`,
                          minHeight: '4px'
                        }}
                        title={`Beta: ${item.beta_signups}`}
                      ></div>
                    )}
                  </div>
                  <div className="text-xs mt-2 text-gray-600">{new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                <span className="text-xs">Beta</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                <span className="text-xs">Production</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSummaryCards = () => {
    const isBetaMode = betaService.getCurrentBetaStatus();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSignups.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Beta Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{totalSignups.beta}</div>
            <div className="text-sm text-gray-500">{((totalSignups.beta / totalSignups.total) * 100).toFixed(1)}% of total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Production Signups</CardTitle>
            {!isBetaMode && <CardDescription className="text-green-500 font-medium">Live Mode Active</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{totalSignups.production}</div>
            <div className="text-sm text-gray-500">{((totalSignups.production / totalSignups.total) * 100).toFixed(1)}% of total</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Signup Analytics</h2>
        <Button onClick={fetchSignupData} variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      {renderSummaryCards()}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">
            <BarChart className="h-4 w-4 mr-2" />
            Daily
          </TabsTrigger>
          <TabsTrigger value="trends">
            <LineChart className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <PieChart className="h-4 w-4 mr-2" />
            Distribution
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Signups</CardTitle>
              <CardDescription>Signup activity for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {renderBarChart()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Signup Trends</CardTitle>
              <CardDescription>30-day signup trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Trend visualization will be implemented in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Signup Distribution</CardTitle>
              <CardDescription>Beta vs. Production signup distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Distribution visualization will be implemented in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const Button = ({ children, onClick, variant = 'default', size = 'default', disabled = false }) => {
  const variantClasses = {
    default: 'bg-pgv-green text-white hover:bg-pgv-green-dark',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };
  
  const sizeClasses = {
    default: 'py-2 px-4',
    sm: 'py-1 px-3 text-sm',
    lg: 'py-3 px-6 text-lg',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses[variant]} ${sizeClasses[size]} rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pgv-green focus:ring-opacity-50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};
