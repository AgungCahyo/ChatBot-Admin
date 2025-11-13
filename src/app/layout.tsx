// src/app/layout.tsx - UPDATED WITH AUTH PROVIDER
import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WhatsApp Bot Dashboard - Jalan Pintas Juragan Photobox',
  description: 'Real-time analytics and management dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}