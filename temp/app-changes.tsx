                import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "../src/components/ErrorBoundary";
import { LoadingScreen } from "../src/components/ui/loading-overlay";
import AdminRoutes from "../src/routes/adminRoutes";

// Simple PageLoader component
const PageLoader = () => {
  return <LoadingScreen />;
};

// Wrap route with ErrorBoundary
const RouteWithErrorBoundary = ({ 
  children, 
  routeName 
}: { 
  children: React.ReactNode, 
  routeName: string 
}) => {
  return (
    <ErrorBoundary routeName={routeName}>
      {children}
    </ErrorBoundary>
  );
};

// This is a code snippet for route changes
export const AdminRoutesComponent = () => {
  return (
    <ErrorBoundary routeName="root">
      {/* Routes with individual Suspense boundaries */}
      <Routes>
        {/* Admin Routes - Direct path to prevent 404 errors */}
        <Route path="/admin" element={
          <RouteWithErrorBoundary routeName="admin-redirect">
            <Navigate to="/admin/dashboard" replace />
          </RouteWithErrorBoundary>
        } />
        <Route path="/admin/*" element={
          <RouteWithErrorBoundary routeName="admin-routes">
            <ErrorBoundary routeName="app-suspense">
              <Suspense fallback={<PageLoader />}>
                <AdminRoutes />
              </Suspense>
            </ErrorBoundary>
          </RouteWithErrorBoundary>
        } />
      </Routes>
    </ErrorBoundary>
  );
};
