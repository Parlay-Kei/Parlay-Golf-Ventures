/**
 * Signup Analytics Component (Fixed Version)
 * 
 * This component displays analytics for user signups, including trends for
 * beta vs. production signups. This version prioritizes mock data in development mode.
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const [error, setError] = useState<string | null>(null);
  const [totalSignups, setTotalSignups] = useState({
    total: 0,
    beta: 0,
    production: 0
  });

  // Generate mock data function
  const generateMockData = useCallback((): SignupData[] => {
    // Generate last 30 days of mock data
    const mockData: SignupData[] = [];
    const today = new Date();
    const isBetaMode = betaService.getCurrentBetaStatus();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const day = date.toISOString().split('T')[0];
      
      // Generate more realistic data with a trend
      const baseSignups = Math.floor(Math.random() * 10) + 5; // 5-15 base signups
      const trendFactor = 1 + (30 - i) / 60; // Gradually increasing trend
      const totalSignups = Math.floor(baseSignups * trendFactor);
      
      // If beta mode is active, most signups are beta
      // If beta mode is off, most signups are production
      let betaSignups, productionSignups;
      
      if (isBetaMode) {
        betaSignups = Math.floor(totalSignups * 0.8); // 80% beta signups
        productionSignups = totalSignups - betaSignups;
      } else {
        // After going live, beta signups drop and production increases
        const daysAfterGoingLive = i < 10 ? 10 - i : 0; // Assuming went live 10 days ago
        const betaRatio = Math.max(0.1, 0.8 - (daysAfterGoingLive * 0.07)); // Decreasing beta ratio
        betaSignups = Math.floor(totalSignups * betaRatio);
        productionSignups = totalSignups - betaSignups;
      }
      
      mockData.push({
        day,
        total_signups: totalSignups,
        beta_signups: betaSignups,
        production_signups: productionSignups
      });
    }
    
    return mockData;
  }, []);

  // Calculate totals from data
  const calculateTotals = useCallback((data: SignupData[]) => {
    return data.reduce((acc, item) => {
      return {
        total: acc.total + item.total_signups,
        beta: acc.beta + item.beta_signups,
        production: acc.production + item.production_signups
      };
    }, { total: 0, beta: 0, production: 0 });
  }, []);

  const fetchSignupData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In development mode, always use mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Using mock signup data');
        const mockData = generateMockData();
        setSignupData(mockData);
        setTotalSignups(calculateTotals(mockData));
        return;
      }
      
      // In production, try to fetch real data
      const { data, error } = await supabase
        .from('signup_analytics')
        .select('*')
        .order('day', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      
      setSignupData(data || []);
      setTotalSignups(calculateTotals(data || []));
    } catch (error: unknown) {
      console.error('Error fetching signup data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error loading signup data: ${errorMessage}`);
      
      // Use mock data if database fetch fails
      const mockData = generateMockData();
      setSignupData(mockData);
      setTotalSignups(calculateTotals(mockData));
    } finally {
      setIsLoading(false);
    }
  }, [generateMockData, calculateTotals]);

  useEffect(() => {
    fetchSignupData();
  }, [fetchSignupData]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">{totalSignups.total}</div>
              <div className="text-sm text-gray-500">Total Signups</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">{totalSignups.beta}</div>
              <div className="text-sm text-gray-500">Beta Signups</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">{totalSignups.production}</div>
              <div className="text-sm text-gray-500">Production Signups</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different views */}
      <Card>
        <CardHeader>
          <CardTitle>Signup Trends</CardTitle>
          <CardDescription>Track user signup patterns over time</CardDescription>
          <div className="mt-4 flex space-x-2 border-b pb-2">
            <Button 
              variant={activeTab === 'daily' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveTab('daily')} 
              className="flex items-center gap-1"
            >
              <BarChart className="h-4 w-4" />
              Daily
            </Button>
            <Button 
              variant={activeTab === 'cumulative' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveTab('cumulative')} 
              className="flex items-center gap-1"
            >
              <LineChart className="h-4 w-4" />
              Cumulative
            </Button>
            <Button 
              variant={activeTab === 'distribution' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveTab('distribution')} 
              className="flex items-center gap-1"
            >
              <PieChart className="h-4 w-4" />
              Distribution
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="mt-0">
              {activeTab === 'daily' && (
                <div className="h-64">
                  {/* Simplified chart representation */}
                  <div className="h-full flex items-end gap-1">
                    {signupData.slice(0, 14).map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col items-center" style={{ height: '90%' }}>
                          <div 
                            className="w-full bg-blue-500 rounded-t" 
                            style={{ height: `${(day.production_signups / Math.max(...signupData.map(d => d.total_signups))) * 100}%` }}
                          ></div>
                          <div 
                            className="w-full bg-green-500" 
                            style={{ height: `${(day.beta_signups / Math.max(...signupData.map(d => d.total_signups))) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs mt-1 transform -rotate-45 origin-top-left">
                          {new Date(day.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-4 gap-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 mr-1"></div>
                      <span className="text-xs">Beta</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 mr-1"></div>
                      <span className="text-xs">Production</span>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'cumulative' && (
                <div className="h-64">
                  {/* Simplified cumulative chart representation */}
                  <div className="h-full flex items-end gap-1">
                    {signupData.slice(0, 14).map((day, index) => {
                      // Calculate cumulative values
                      const cumulativeTotal = signupData
                        .slice(0, signupData.length - index)
                        .reduce((sum, d) => sum + d.total_signups, 0);
                      const cumulativeBeta = signupData
                        .slice(0, signupData.length - index)
                        .reduce((sum, d) => sum + d.beta_signups, 0);
                      const cumulativeProduction = signupData
                        .slice(0, signupData.length - index)
                        .reduce((sum, d) => sum + d.production_signups, 0);
                      
                      const maxCumulative = signupData
                        .reduce((sum, d) => sum + d.total_signups, 0);
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex flex-col items-center" style={{ height: '90%' }}>
                            <div 
                              className="w-full bg-blue-500 rounded-t" 
                              style={{ height: `${(cumulativeProduction / maxCumulative) * 100}%` }}
                            ></div>
                            <div 
                              className="w-full bg-green-500" 
                              style={{ height: `${(cumulativeBeta / maxCumulative) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs mt-1 transform -rotate-45 origin-top-left">
                            {new Date(day.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center mt-4 gap-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 mr-1"></div>
                      <span className="text-xs">Beta</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 mr-1"></div>
                      <span className="text-xs">Production</span>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'distribution' && (
                <div className="h-64 flex justify-center items-center">
                  {/* Simplified pie chart representation */}
                  <div className="relative w-40 h-40">
                    <div 
                      className="absolute inset-0 bg-green-500 rounded-full"
                      style={{ clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(2 * Math.PI * totalSignups.beta / totalSignups.total)}% ${50 - 50 * Math.sin(2 * Math.PI * totalSignups.beta / totalSignups.total)}%, 50% 50%)` }}
                    ></div>
                    <div 
                      className="absolute inset-0 bg-blue-500 rounded-full"
                      style={{ clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(2 * Math.PI * totalSignups.beta / totalSignups.total)}% ${50 - 50 * Math.sin(2 * Math.PI * totalSignups.beta / totalSignups.total)}%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 50%)` }}
                    ></div>
                  </div>
                  <div className="ml-8">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-green-500 mr-2"></div>
                      <span>Beta: {Math.round(totalSignups.beta / totalSignups.total * 100)}%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 mr-2"></div>
                      <span>Production: {Math.round(totalSignups.production / totalSignups.total * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
