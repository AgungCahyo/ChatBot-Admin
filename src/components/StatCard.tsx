
// ============================================================================
// src/components/StatCard.tsx
// ============================================================================
'use client';

import { StatCardProps } from '@/types';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color = 'blue' 
}: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    cyan: 'bg-cyan-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {value === null || value === undefined ? (
              <span className="inline-block w-20 h-8 bg-gray-200 animate-pulse rounded"></span>
            ) : (
              value
            )}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              {trend !== undefined && (
                <span className={trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}>
                  {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
                </span>
              )}
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
