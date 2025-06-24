import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FeatureProvider } from '@/lib/features.tsx';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { useScrollToTop } from './hooks/useScrollToTop';
import ErrorBoundary from '@/components/ErrorBoundary';
import { DEV_CONFIG } from '@/lib/config/env';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import ComingSoon from './pages/ComingSoon';
import { GlobalLoadingOverlay } from '@/components/ui/loading-state';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  UploadIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import ContributionLandingPage from './components/contribution/ContributionLandingPage';
import Upload from './pages/Upload';
import UsernameStep from './components/steps/UsernameStep';
import AvatarStep from './components/steps/AvatarStep';
import CrewStep from './components/steps/CrewStep';
import SwingUploadStep from './components/steps/SwingUploadStep';

// Import pages directly to avoid lazy loading issues
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Academy from './pages/Academy';
import AcademyDashboard from './pages/AcademyDashboard';
import Community from './pages/Community';
import Membership from './pages/Membership';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import SubscriptionNew from './pages/SubscriptionNew';

// Import global styles
import '@/styles/globals.css';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ScrollToTop component to handle scrolling on route changes
const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

// Maintenance mode component for pages that aren't fully restored yet
const MaintenancePage = ({ title }: { title: string }) => (
  <div className="p-8">
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This page is currently under maintenance. We're working to bring it back online soon.
            </p>
          </div>
        </div>
      </div>
      <p className="text-gray-600 mb-4">
        We're currently updating this feature to improve your experience. Please check back later.
      </p>
    </div>
  </div>
);

// Wrap route with ErrorBoundary
const RouteWithErrorBoundary = ({ 
  children, 
  routeName 
}: { 
  children: React.ReactNode, 
  routeName: string 
}) => (
  <ErrorBoundary routeName={routeName}>
    {children}
  </ErrorBoundary>
);

// App loading state wrapper
const AppContent = () => {
  const { loading, user } = useAuth();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<number | null>(null);
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <UsernameStep
            username={username}
            setUsername={setUsername}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <AvatarStep
            selectedAvatar={selectedAvatar}
            setSelectedAvatar={setSelectedAvatar}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <CrewStep
            selectedCrew={selectedCrew}
            setSelectedCrew={setSelectedCrew}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <SwingUploadStep
            onComplete={() => alert('Setup complete!')}
            onBack={prevStep}
          />
        );
      default:
        return <UsernameStep onNext={() => setStep(1)} />;
    }
  };

  if (loading) {
    return <GlobalLoadingOverlay message="Loading application..." />;
  }

  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={
              <RouteWithErrorBoundary routeName="Home">
                <Index />
              </RouteWithErrorBoundary>
            } 
          />
          <Route 
            path="/login" 
            element={
              <RouteWithErrorBoundary routeName="Login">
                <Login />
              </RouteWithErrorBoundary>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <RouteWithErrorBoundary routeName="SignUp">
                <SignUp />
              </RouteWithErrorBoundary>
            } 
          />
          <Route 
            path="/membership" 
            element={
              <RouteWithErrorBoundary routeName="Membership">
                <Membership />
              </RouteWithErrorBoundary>
            } 
          />
          <Route 
            path="/subscription" 
            element={
              <RouteWithErrorBoundary routeName="Subscription">
                <Subscription />
              </RouteWithErrorBoundary>
            } 
          />
          <Route 
            path="/subscription-new" 
            element={
              <RouteWithErrorBoundary routeName="SubscriptionNew">
                <SubscriptionNew />
              </RouteWithErrorBoundary>
            } 
          />

          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <RouteWithErrorBoundary routeName="Dashboard">
                  <Dashboard />
                </RouteWithErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/*" 
            element={
              <ProtectedRoute>
                <RouteWithErrorBoundary routeName="Profile">
                  <Profile />
                </RouteWithErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/academy" 
            element={
              <ProtectedRoute>
                <RouteWithErrorBoundary routeName="Academy">
                  <Academy />
                </RouteWithErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/academy/dashboard" 
            element={
              <ProtectedRoute>
                <RouteWithErrorBoundary routeName="AcademyDashboard">
                  <AcademyDashboard />
                </RouteWithErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/community" 
            element={
              <ProtectedRoute>
                <RouteWithErrorBoundary routeName="Community">
                  <Community />
                </RouteWithErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <RouteWithErrorBoundary routeName="AdminDashboard">
                  <AdminDashboard />
                </RouteWithErrorBoundary>
              </ProtectedRoute>
            } 
          />

          {/* Maintenance routes */}
          <Route 
            path="/upload-swing" 
            element={
              <ProtectedRoute>
                <RouteWithErrorBoundary routeName="UploadSwing">
                  <Upload />
                </RouteWithErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contribute" 
            element={
              <ProtectedRoute>
                <RouteWithErrorBoundary routeName="Contribute">
                  <ContributionLandingPage />
                </RouteWithErrorBoundary>
              </ProtectedRoute>
            } 
          />

          {/* Fallback routes */}
          <Route 
            path="/coming-soon" 
            element={
              <RouteWithErrorBoundary routeName="ComingSoon">
                <ComingSoon />
              </RouteWithErrorBoundary>
            } 
          />
          <Route 
            path="*" 
            element={
              <RouteWithErrorBoundary routeName="NotFound">
                <NotFound />
              </RouteWithErrorBoundary>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

// Main App component
function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Simulate initialization to ensure everything is loaded
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isInitialized) {
    return <GlobalLoadingOverlay message="Initializing application..." />;
  }
  
  return (
    <ErrorBoundary routeName="App">
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <TooltipProvider>
            <FeatureProvider>
              <LoadingProvider>
                <AuthProvider>
                  <AppContent />
                </AuthProvider>
              </LoadingProvider>
            </FeatureProvider>
          </TooltipProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}



export default App;
