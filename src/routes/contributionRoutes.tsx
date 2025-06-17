import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ContentPageFallback } from '@/components/fallbacks';

// Lazy load all contribution components
const ContributionLandingPage = lazy(() => import('@/components/contribution/ContributionLandingPage'));
const MemberContributionPage = lazy(() => import('@/components/contribution/MemberContributionPage'));
const GuestContributionPage = lazy(() => import('@/components/contribution/GuestContributionPage'));
const MentorContributionPage = lazy(() => import('@/components/contribution/MentorContributionPage'));
const ContentCreatorPage = lazy(() => import('@/components/contribution/ContentCreatorPage'));
const ModerationQueue = lazy(() => import('@/components/contribution/moderation/ModerationQueue'));
const CommunityContentHub = lazy(() => import('@/components/contribution/CommunityContentHub'));
const ContributionDetailView = lazy(() => import('@/components/contribution/ContributionDetailView'));

// Loading component for Suspense fallback
const ComponentLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pgv-green"></div>
  </div>
);

// Wrap route with ErrorBoundary
const RouteWithErrorBoundary = ({ 
  children, 
  routeName 
}: { 
  children: React.ReactNode, 
  routeName: string 
}) => {
  return (
    <ErrorBoundary 
      routeName={routeName}
      fallback={<ContentPageFallback title={`${routeName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Unavailable`} />}
    >
      {children}
    </ErrorBoundary>
  );
};

// Use a single Routes component without nesting
const ContributionRoutes = () => {
  return (
    <ErrorBoundary 
      routeName="contribution-routes"
      fallback={<ContentPageFallback title="Contributions Temporarily Unavailable" />}
    >
      <ErrorBoundary routeName="contribution-suspense">
        <Suspense fallback={<ComponentLoader />}>
          <Routes>
            <Route index element={
              <RouteWithErrorBoundary routeName="contribution-landing">
                <ContributionLandingPage />
              </RouteWithErrorBoundary>
            } />
            <Route path="member" element={
              <RouteWithErrorBoundary routeName="member-contribution">
                <ProtectedRoute>
                  <MemberContributionPage />
                </ProtectedRoute>
              </RouteWithErrorBoundary>
            } />
            <Route path="guest" element={
              <RouteWithErrorBoundary routeName="guest-contribution">
                <GuestContributionPage />
              </RouteWithErrorBoundary>
            } />
            <Route path="mentor" element={
              <RouteWithErrorBoundary routeName="mentor-contribution">
                <ProtectedRoute requiredRole="mentor">
                  <MentorContributionPage />
                </ProtectedRoute>
              </RouteWithErrorBoundary>
            } />
            <Route path="creator" element={
              <RouteWithErrorBoundary routeName="creator-contribution">
                <ProtectedRoute requiredRole="creator">
                  <ContentCreatorPage />
                </ProtectedRoute>
              </RouteWithErrorBoundary>
            } />
            <Route path="moderation" element={
              <RouteWithErrorBoundary routeName="moderation-queue">
                <ProtectedRoute requireAdmin={true}>
                  <ModerationQueue />
                </ProtectedRoute>
              </RouteWithErrorBoundary>
            } />
            <Route path="hub" element={
              <RouteWithErrorBoundary routeName="community-content-hub">
                <CommunityContentHub />
              </RouteWithErrorBoundary>
            } />
            <Route path="hub/:id" element={
              <RouteWithErrorBoundary routeName="contribution-detail">
                <ContributionDetailView />
              </RouteWithErrorBoundary>
            } />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </ErrorBoundary>
  );
};

export default ContributionRoutes;