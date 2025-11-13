// src/components/DashboardLayout.tsx - UPDATED WITH PROTECTION
'use client';

import Sidebar from './Sidebar';
import { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}