import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminToolsFallback } from '@/components/fallbacks';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import admin components directly
import AdminDashboard from '../pages/admin/DashboardFix';
import AdminLogin from '../pages/AdminLogin';
import BetaInvites from '../pages/admin/BetaInvites';
import ErrorMonitoringDashboard from '../components/admin/ErrorMonitoringDashboard';

/**
 * AdminRoutes Component
 * 
 * This component defines all admin routes in a standalone component
 * to prevent routing conflicts with other parts of the application.
 * Components are directly imported for better reliability in development.
 */
export default function AdminRoutes() {
  console.log('AdminRoutes component rendered');
  
  return (
    <ErrorBoundary 
      routeName="admin-routes" 
      fallback={<AdminToolsFallback />}
    >
      <Routes>
        <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="login" element={<AdminLogin />} />
        <Route path="error-monitoring" element={
          <ProtectedRoute requireAdmin={true}>
            <ErrorMonitoringDashboard />
          </ProtectedRoute>
        } />
        <Route path="beta-invites" element={
          <ProtectedRoute requireAdmin={true}>
            <BetaInvites />
          </ProtectedRoute>
        } />
        <Route path="academy" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
