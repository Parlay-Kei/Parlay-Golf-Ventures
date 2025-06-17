/**
 * Admin Layout Component
 * 
 * This component provides the standard layout structure for admin pages,
 * including admin header, navigation, and main content area.
 */

import React from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AdminToolsFallback } from '@/components/fallbacks';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayoutContent = ({ children }: AdminLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-pgv-green text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">PGV Admin Dashboard</h1>
            <span className="text-sm bg-pgv-gold text-pgv-green px-2 py-1 rounded">Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="text-white border-white hover:bg-pgv-green-dark">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
};

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ErrorBoundary routeName="admin-layout" fallback={<AdminToolsFallback />}>
      <AdminLayoutContent children={children} />
    </ErrorBoundary>
  );
}
