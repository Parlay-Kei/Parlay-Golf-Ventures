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
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedCrew, setSelectedCrew] = useState(null);
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
        return <UsernameStep />;
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

// Username Step Component
const UsernameStep = ({
  username = '',
  setUsername = () => {},
  onNext = () => {},
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onNext();
    }, 1000);
  };
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        PICK YOUR USERNAME
      </h2>
      <p className="text-gray-600 mb-6">
        Choose a unique username for your PGV profile
      </p>
      <form onSubmit={handleSubmit}>
        <label className="block text-gray-700 mb-2">Username</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-green-700 font-semibold">@</span>
          </div>
          <motion.input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full py-3 pl-8 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
            placeholder="golfmaster"
            whileFocus={{
              scale: 1.01,
              boxShadow: '0 0 0 2px rgba(22, 101, 52, 0.3)',
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 10,
            }}
          />
        </div>
        {/* Username badge animation */}
        {username && (
          <motion.div
            className="mt-6 bg-gradient-to-r from-green-700 to-green-600 text-white p-4 rounded-lg shadow-md text-center"
            initial={{
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              scale: isAnimating ? [1, 1.05, 1] : 1,
              opacity: 1,
              y: isAnimating ? [0, -10, 0] : 0,
              rotateY: isAnimating ? [0, 180, 360] : 0,
            }}
            transition={{
              duration: 0.8,
            }}
          >
            <p className="text-sm opacity-80">YOUR PGV BADGE</p>
            <p className="text-xl font-bold">@{username}</p>
          </motion.div>
        )}
        <p className="mt-4 text-sm text-gray-500">
          This will be your display name in the community
        </p>
        <div className="mt-8 flex justify-end">
          <motion.button
            type="submit"
            className="flex items-center bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.97,
            }}
            disabled={!username.trim()}
          >
            Next <ChevronRightIcon className="ml-2 h-5 w-5" />
          </motion.button>
        </div>
      </form>
    </div>
  );
};

// Avatar Step Component
const AvatarStep = ({
  selectedAvatar = null,
  setSelectedAvatar = () => {},
  onNext = () => {},
  onBack = () => {},
}) => {
  const avatars = [
    {
      id: 1,
      image: 'https://i.imgur.com/KtJeVt4.png',
      name: 'Pro',
    },
    {
      id: 2,
      image: 'https://i.imgur.com/7Iggt9J.png',
      name: 'Casual',
    },
    {
      id: 3,
      image: 'https://i.imgur.com/p7wu6EX.png',
      name: 'Vintage',
    },
    {
      id: 4,
      image: 'https://i.imgur.com/9HKgrGJ.png',
      name: 'Street',
    },
    {
      id: 5,
      image: 'https://i.imgur.com/3wVcZTY.png',
      name: 'Classic',
    },
    {
      id: 6,
      image: 'https://i.imgur.com/6YLsM0T.png',
      name: 'Modern',
    },
  ];
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        SELECT YOUR AVATAR
      </h2>
      <p className="text-gray-600 mb-6">
        Choose an avatar to represent you in the community
      </p>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {avatars.map((avatar) => (
          <motion.div
            key={avatar.id}
            className={`relative aspect-square border-2 rounded-lg cursor-pointer overflow-hidden ${selectedAvatar === avatar.id ? 'border-green-600' : 'border-gray-200'}`}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={() => setSelectedAvatar(avatar.id)}
          >
            <img
              src={avatar.image}
              alt={`Avatar ${avatar.name}`}
              className="w-full h-full object-cover"
            />
            {selectedAvatar === avatar.id && (
              <motion.div
                className="absolute inset-0 bg-green-600 bg-opacity-30 flex items-center justify-center"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                  }}
                  className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center"
                >
                  <UserIcon className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      {selectedAvatar && (
        <motion.div
          className="mb-6 p-4 bg-gray-100 rounded-lg flex items-center space-x-4"
          initial={{
            height: 0,
            opacity: 0,
          }}
          animate={{
            height: 'auto',
            opacity: 1,
          }}
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-600">
            <img
              src={avatars.find((a) => a.id === selectedAvatar)?.image}
              alt="Selected avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium">Preview Badge</p>
            <p className="text-sm text-gray-500">
              This is how you'll appear in the PGV community
            </p>
          </div>
        </motion.div>
      )}
      <div className="mt-8 flex justify-between">
        <motion.button
          onClick={onBack}
          className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium"
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: 0.97,
          }}
        >
          <ChevronLeftIcon className="mr-2 h-5 w-5" /> Back
        </motion.button>
        <motion.button
          onClick={onNext}
          className="flex items-center bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: 0.97,
          }}
          disabled={!selectedAvatar}
        >
          Next <ChevronRightIcon className="ml-2 h-5 w-5" />
        </motion.button>
      </div>
    </div>
  );
};

// Crew Step Component
const CrewStep = ({
  selectedCrew = null,
  setSelectedCrew = () => {},
  onNext = () => {},
  onBack = () => {},
}) => {
  const crews = [
    {
      id: 1,
      name: 'BEGINNER CREW',
      description: 'Perfect for new golfers starting their journey',
      members: 45,
      topMembers: [
        'https://i.imgur.com/KtJeVt4.png',
        'https://i.imgur.com/7Iggt9J.png',
      ],
    },
    {
      id: 2,
      name: 'INTERMEDIATE CREW',
      description: 'For golfers looking to improve their game',
      members: 32,
      topMembers: [
        'https://i.imgur.com/p7wu6EX.png',
        'https://i.imgur.com/9HKgrGJ.png',
      ],
    },
    {
      id: 3,
      name: 'ADVANCED CREW',
      description: 'For experienced golfers pushing their limits',
      members: 28,
      topMembers: [
        'https://i.imgur.com/3wVcZTY.png',
        'https://i.imgur.com/KtJeVt4.png',
      ],
    },
    {
      id: 4,
      name: 'COMPETITIVE CREW',
      description: 'For tournament players and serious competitors',
      members: 19,
      topMembers: [
        'https://i.imgur.com/6YLsM0T.png',
        'https://i.imgur.com/3wVcZTY.png',
      ],
    },
    {
      id: 5,
      name: 'ELITE CREW',
      description: 'Invitation only for top performers',
      members: 7,
      inviteOnly: true,
      topMembers: ['https://i.imgur.com/p7wu6EX.png'],
    },
  ];
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">JOIN A CREW</h2>
      <p className="text-gray-600 mb-6">
        Connect with golfers at your skill level
      </p>
      <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
        {crews.map((crew) => (
          <motion.div
            key={crew.id}
            className={`border rounded-lg p-4 cursor-pointer ${selectedCrew === crew.id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={() => !crew.inviteOnly && setSelectedCrew(crew.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{crew.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{crew.description}</p>
                {crew.inviteOnly && (
                  <motion.div
                    className="mt-2 inline-block bg-gray-800 text-white text-xs px-2 py-1 rounded-full"
                    animate={{
                      backgroundColor: ['#1f2937', '#4b5563', '#1f2937'],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                      },
                    }}
                  >
                    Apply to Join
                  </motion.div>
                )}
              </div>
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-2">
                  {crew.topMembers.map((member, index) => (
                    <div
                      key={index}
                      className="w-7 h-7 rounded-full border-2 border-white overflow-hidden"
                    >
                      <img
                        src={member}
                        alt="Crew member"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-gray-500 text-sm flex items-center">
                  <UsersIcon className="h-4 w-4 mr-1" />
                  {crew.members}
                </div>
              </div>
            </div>
            {selectedCrew === crew.id && (
              <motion.div
                className="mt-3 pt-3 border-t border-green-200 text-sm text-green-700"
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                }}
              >
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  <span>You're joining this crew!</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="mt-8 flex justify-between">
        <motion.button
          onClick={onBack}
          className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium"
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: 0.97,
          }}
        >
          <ChevronLeftIcon className="mr-2 h-5 w-5" /> Back
        </motion.button>
        <motion.button
          onClick={onNext}
          className="flex items-center bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: 0.97,
          }}
          disabled={!selectedCrew}
        >
          Next <ChevronRightIcon className="ml-2 h-5 w-5" />
        </motion.button>
      </div>
    </div>
  );
};

// Swing Upload Step Component
const SwingUploadStep = ({ onComplete = () => {}, onBack = () => {} }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };
  const handleFileSelect = () => {
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        UPLOAD YOUR FIRST SWING
      </h2>
      <p className="text-gray-600 mb-6">
        Get started with swing analysis or skip for now
      </p>
      <div className="relative">
        {/* Background video loop */}
        <div className="absolute inset-0 overflow-hidden rounded-lg opacity-20">
          <video
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
            style={{
              filter: 'blur(5px)',
            }}
          >
            <source
              src="https://player.vimeo.com/external/436572488.sd.mp4?s=ebc11572e9d4a93f18c7c0ef44503a4c2d2ebe3f&profile_id=164&oauth2_token_id=57447761"
              type="video/mp4"
            />
          </video>
        </div>
        <motion.div
          className={`relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] bg-gradient-to-b from-green-800/10 to-green-600/10 ${isDragging ? 'border-green-500' : 'border-gray-300'}`}
          animate={{
            borderColor: isDragging ? '#16a34a' : '#d1d5db',
            backgroundColor: isDragging
              ? 'rgba(22, 163, 74, 0.05)'
              : 'rgba(22, 163, 74, 0.02)',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <motion.div
              className="text-center"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
            >
              <motion.div
                className="w-16 h-16 border-4 border-gray-300 border-t-green-600 rounded-full mx-auto mb-4"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <p className="text-green-800 font-medium">
                Uploading your swing...
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: 'rgba(22, 163, 74, 0.2)',
                }}
              >
                <UploadIcon className="h-8 w-8 text-green-700" />
              </motion.div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Upload Swing Video
              </h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Drop your swing video here or click to browse
              </p>
              <motion.button
                onClick={handleFileSelect}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: '#f9fafb',
                }}
                whileTap={{
                  scale: 0.95,
                }}
              >
                Choose File
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
      <div className="mt-6 text-center">
        <motion.button
          onClick={() => onComplete()}
          className="text-gray-500 hover:text-gray-700 text-sm"
          whileHover={{
            scale: 1.05,
          }}
        >
          Skip for now
        </motion.button>
      </div>
      <div className="mt-8 flex justify-between">
        <motion.button
          onClick={onBack}
          className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium"
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: 0.97,
          }}
        >
          <ChevronLeftIcon className="mr-2 h-5 w-5" /> Back
        </motion.button>
        <motion.button
          onClick={onComplete}
          className="flex items-center bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium group"
          whileHover={{
            scale: 1.03,
            backgroundColor: '#ca8a04',
            transition: {
              duration: 0.3,
            },
          }}
          whileTap={{
            scale: 0.97,
          }}
        >
          Complete Setup
          <motion.span
            className="ml-2"
            animate={{
              x: [0, 5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
            }}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
};

export default App;
