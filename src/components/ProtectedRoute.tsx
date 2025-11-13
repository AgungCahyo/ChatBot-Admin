// src/components/ProtectedRoute.tsx - UPDATED WITH APPROVAL CHECK
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Activity } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading, isApproved } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Not logged in
      if (!user) {
        router.push('/login');
        return;
      }

      // Logged in but not approved
      if (!isApproved() && pathname !== '/pending-approval') {
        router.push('/pending-approval');
        return;
      }

      // Approved but trying to access pending page
      if (isApproved() && pathname === '/pending-approval') {
        router.push('/');
        return;
      }
    }
  }, [user, userProfile, loading, isApproved, pathname, router]);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 animate-pulse">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-500">Checking authentication</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Show nothing if not approved and not on pending page (will redirect)
  if (!isApproved() && pathname !== '/pending-approval') {
    return null;
  }

  // User is authenticated and approved, render children
  return <>{children}</>;
}