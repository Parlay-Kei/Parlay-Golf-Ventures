import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { ErrorType } from '@/lib/utils/errorHandler';
import { captureException } from '@/lib/services/errorMonitoring';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AdminToolsFallback } from '@/components/fallbacks';

/**
 * Error Monitoring Dashboard Component
 * 
 * This component provides administrators with a dashboard to monitor errors
 * across the platform. It displays error trends, recent errors, and allows
 * filtering by error type.
 */

enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

interface ErrorRecord {
  id: string;
  type: ErrorType;
  component: string;
  message: string;
  timestamp: Date;
  count: number;
  users_affected: number;
  resolved: boolean;
}

const ErrorMonitoringDashboardContent = () => {
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [errors, setErrors] = useState<ErrorRecord[]>([]);
  const [errorStats, setErrorStats] = useState<Record<string, number>>({
    total: 0,
    authentication: 0,
    validation: 0,
    server_error: 0,
    network_error: 0,
    not_found: 0,
    rate_limit: 0,
    unknown: 0
  });
  
  useEffect(() => {
    // Fetch error data when the component mounts
    fetchErrorData();
  }, [activeTab, fetchErrorData]);
  
  const fetchErrorData = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch data from Sentry or another error monitoring service
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Generate mock error data
      const mockErrors = generateMockErrors();
      
      // Filter errors based on the active tab
      const filteredErrors = activeTab === 'all' 
        ? mockErrors 
        : mockErrors.filter(error => error.type === activeTab);
      
      setErrors(filteredErrors);
      
      // Calculate error statistics
      const stats: Record<string, number> = {
        total: mockErrors.length,
        authentication: 0,
        validation: 0,
        server_error: 0,
        network_error: 0,
        not_found: 0,
        rate_limit: 0,
        unknown: 0
      };
      
      mockErrors.forEach(error => {
        if (stats[error.type] !== undefined) {
          stats[error.type]++;
        }
      });
      
      setErrorStats(stats);
    } catch (error) {
      console.error('Error fetching error data:', error);
      captureException(error as Error, { component: 'ErrorMonitoringDashboard' });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);
  
  const generateMockErrors = () => {
    // Generate random mock errors for demonstration purposes
    const errorTypes = Object.values(ErrorType);
    const components = ['AuthForm', 'ContributionForm', 'PaymentProcessor', 'UserProfile', 'ContentLoader'];
    const messages = [
      'Failed to authenticate user',
      'Invalid form submission',
      'Server responded with 500',
      'Network request failed',
      'Resource not found',
      'Rate limit exceeded',
      'Unknown error occurred'
    ];
    
    return Array.from({ length: 20 }, (_, i) => {
      const type = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      const component = components[Math.floor(Math.random() * components.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      const date = new Date();
      date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 60 * 24)); // Random time in the last 24 hours
      
      return {
        id: `error-${i}`,
        type,
        component,
        message,
        timestamp: date,
        count: Math.floor(Math.random() * 10) + 1,
        users_affected: Math.floor(Math.random() * 5) + 1,
        resolved: Math.random() > 0.7 // 30% chance of being resolved
      };
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by most recent
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getErrorTypeLabel = (type: string) => {
    switch (type) {
      case ErrorType.AUTHENTICATION: return 'Authentication';
      case ErrorType.AUTHORIZATION: return 'Authorization';
      case ErrorType.VALIDATION: return 'Validation';
      case ErrorType.NOT_FOUND: return 'Not Found';
      case ErrorType.SERVER_ERROR: return 'Server Error';
      case ErrorType.NETWORK_ERROR: return 'Network Error';
      case ErrorType.RATE_LIMIT: return 'Rate Limit';
      case ErrorType.UNKNOWN: return 'Unknown';
      default: return type;
    }
  };
  
  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case ErrorType.AUTHENTICATION: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case ErrorType.AUTHORIZATION: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case ErrorType.VALIDATION: return 'bg-blue-100 text-blue-800 border-blue-300';
      case ErrorType.NOT_FOUND: return 'bg-purple-100 text-purple-800 border-purple-300';
      case ErrorType.SERVER_ERROR: return 'bg-red-100 text-red-800 border-red-300';
      case ErrorType.NETWORK_ERROR: return 'bg-orange-100 text-orange-800 border-orange-300';
      case ErrorType.RATE_LIMIT: return 'bg-green-100 text-green-800 border-green-300';
      case ErrorType.UNKNOWN: return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Error Monitoring Dashboard</h1>
          <p className="text-muted-foreground">Monitor and analyze errors across the platform</p>
        </div>
        <Button onClick={fetchErrorData} variant="outline" className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {/* Error Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{errorStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Server Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{errorStats.server_error}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Auth Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{errorStats.authentication}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Network Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{errorStats.network_error}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Error List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
          <CardDescription>View and filter recent errors by type</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value={ErrorType.SERVER_ERROR}>Server</TabsTrigger>
              <TabsTrigger value={ErrorType.AUTHENTICATION}>Auth</TabsTrigger>
              <TabsTrigger value={ErrorType.NETWORK_ERROR}>Network</TabsTrigger>
              <TabsTrigger value={ErrorType.VALIDATION}>Validation</TabsTrigger>
              <TabsTrigger value={ErrorType.NOT_FOUND}>Not Found</TabsTrigger>
              <TabsTrigger value={ErrorType.RATE_LIMIT}>Rate Limit</TabsTrigger>
              <TabsTrigger value={ErrorType.UNKNOWN}>Unknown</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-pgv-green" />
                </div>
              ) : errors.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No errors found</h3>
                  <p className="text-muted-foreground">There are no errors matching your filter criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {errors.map((error) => (
                    <div key={error.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                          <h3 className="font-medium">{error.message}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getErrorTypeColor(error.type)} border`}>
                            {getErrorTypeLabel(error.type)}
                          </Badge>
                          {error.resolved && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Component:</span> {error.component} • 
                        <span className="font-medium">Time:</span> {formatDate(error.timestamp)} • 
                        <span className="font-medium">Occurrences:</span> {error.count} • 
                        <span className="font-medium">Users Affected:</span> {error.users_affected}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {!error.resolved && (
                          <Button size="sm">
                            Mark as Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Error Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Error Trends</CardTitle>
          <CardDescription>View error trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted rounded-md">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Error trend visualization will be available in a future update.</p>
              <p className="text-sm text-muted-foreground">This will show error frequency over time by error type.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ErrorMonitoringDashboard = () => {
  return (
    <ErrorBoundary routeName="error-monitoring-dashboard" fallback={<AdminToolsFallback />}>
      <ErrorMonitoringDashboardContent />
    </ErrorBoundary>
  );
};

export default ErrorMonitoringDashboard;
