// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Phone, 
  Settings,
  Activity,
  TrendingUp,
  Terminal
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function Sidebar() {
  const pathname = usePathname();

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Mess', href: '/messages-template', icon: MessageSquare },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Consultations', href: '/consultations', icon: Phone },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Logs', href: '/logs', icon: Terminal },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Activity className="w-8 h-8 text-blue-500" />
        <span className="ml-3 text-xl font-bold">Bot Dashboard</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
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

      {/* Footer */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center">
          <div className="flex">
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium">A</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-gray-400">admin@photobox.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}