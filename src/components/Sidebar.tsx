// src/components/Sidebar.tsx - UPDATED WITH RBAC
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Phone, 
  Settings,
  Activity,
  TrendingUp,
  Terminal,
  Send,
  LogOut,
  ChevronDown,
  Shield,
  MessageSquare,
  Hash
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { RolePermissions } from '@/types/auth';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: keyof RolePermissions; // Optional: if not set, visible to all
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, logout, hasPermission } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigation: NavItem[] = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: LayoutDashboard,
      permission: 'canViewDashboard'
    },
    { 
      name: 'Broadcast', 
      href: '/broadcast', 
      icon: Send,
      permission: 'canSendBroadcast'
    },
    { 
      name: 'Consultations', 
      href: '/consultations', 
      icon: Phone,
      permission: 'canViewConsultations'
    },
    { 
      name: 'All Messages', 
      href: '/all-messages', 
      icon: MessageSquare,
      permission: 'canViewMessages'
    },
    { 
      name: 'Keywords', 
      href: '/keywords', 
      icon: Hash,
      permission: 'canViewAnalytics'
    },
    { 
      name: 'Users', 
      href: '/users', 
      icon: Users,
      permission: 'canViewUsers'
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: TrendingUp,
      permission: 'canViewAnalytics'
    },
    { 
      name: 'Messages Config', 
      href: '/messages-configuration', 
      icon: Settings,
      permission: 'canEditConfig'
    },
    { 
      name: 'System Logs', 
      href: '/logs', 
      icon: Terminal,
      permission: 'canViewLogs'
    },
    { 
      name: 'User Management', 
      href: '/user-management', 
      icon: Shield,
      permission: 'canManageUsers'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings
      // No permission check - all users can access settings
    },
  ];

  // Filter navigation based on permissions
  const visibleNavigation = navigation.filter(item => {
    if (!item.permission) return true; // No permission required
    return hasPermission(item.permission);
  });

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      setLoggingOut(true);
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout');
      } finally {
        setLoggingOut(false);
      }
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user?.displayName) return user?.email?.charAt(0).toUpperCase() || 'U';
    return user.displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch (userProfile?.role) {
      case 'admin': return 'bg-red-500';
      case 'editor': return 'bg-blue-500';
      case 'viewer': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Activity className="w-8 h-8 text-blue-500" />
        <span className="ml-3 text-xl font-bold">Bot Dashboard</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-visible">
        {visibleNavigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg
                transition-colors duration-150
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Menu Footer */}
      <div className="border-t border-gray-800 p-4">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center w-full hover:bg-gray-800 rounded-lg p-2 transition-colors"
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold">{getUserInitials()}</span>
              </div>
              {/* Role Badge */}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getRoleBadgeColor()} rounded-full border-2 border-gray-900`}></div>
            </div>
            <div className="ml-3 flex-1 text-left">
              <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{userProfile?.role || 'viewer'}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
              <div className="p-3 border-b border-gray-700">
                <p className="text-sm font-medium">{user?.displayName || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                <div className="mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userProfile?.role === 'admin' ? 'bg-red-100 text-red-700' :
                    userProfile?.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {userProfile?.role?.toUpperCase() || 'VIEWER'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  router.push('/settings');
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </button>
              
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}