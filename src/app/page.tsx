'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { 
  MessageSquare, 
  Users, 
  Target, 
  Activity, 
  TrendingUp, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useStats } from '@/lib/hooks/useStats';
import { useKeywordStats } from '@/lib/hooks/useKeywordStats';
import { useHourlyActivity } from '@/lib/hooks/useHourlyActivity';
import { useMessages } from '@/lib/hooks/useMessages';

export default function Dashboard() {
  const { stats, loading: statsLoading } = useStats();
  const { keywordStats, loading: keywordLoading } = useKeywordStats(7);
  const { hourlyData, loading: hourlyLoading } = useHourlyActivity();
  const { messages, loading: messagesLoading } = useMessages(10);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Real-time bot analytics & monitoring</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Bot Active</span>
              </div>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={MessageSquare}
            title="Total Messages"
            value={statsLoading ? null : stats.totalMessages.toLocaleString()}
            subtitle="+12% vs yesterday"
            trend={1}
            color="blue"
          />
          <StatCard
            icon={Users}
            title="Total Users"
            value={statsLoading ? null : stats.totalUsers.toLocaleString()}
            subtitle="+8% vs yesterday"
            trend={1}
            color="green"
          />
          <StatCard
            icon={Target}
            title="Consultations"
            value={statsLoading ? null : stats.consultationRequests}
            subtitle={`${stats.conversionRate.toFixed(1)}% conversion`}
            trend={1}
            color="purple"
          />
          <StatCard
            icon={Activity}
            title="Active Now"
            value={statsLoading ? null : stats.activeNow}
            subtitle="Users chatting"
            trend={0}
            color="orange"
          />
          <StatCard
            icon={TrendingUp}
            title="Conversion Rate"
            value={statsLoading ? null : `${stats.conversionRate.toFixed(1)}%`}
            subtitle="+2.3% vs last week"
            trend={1}
            color="pink"
          />
          <StatCard
            icon={Clock}
            title="Avg Response Time"
            value="1.2s"
            subtitle="Lightning fast ⚡"
            trend={-1}
            color="cyan"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Keyword Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Keyword Performance</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </button>
            </div>
            {keywordLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={keywordStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="keyword" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Total" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="conversions" fill="#10b981" name="Conversions" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Hourly Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Hourly Activity</h2>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                Today
              </span>
            </div>
            {hourlyLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="messages" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </button>
          </div>
          {messagesLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Message</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Keyword</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                        {msg.from.substring(0, 12)}...
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                        {msg.textBody}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {msg.keyword}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {msg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
