'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Download,
  Filter,
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useKeywordStats } from '@/lib/hooks/useKeywordStats'; 
import { useMessages } from '@/lib/hooks/useMessages';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState<'daily' | 'hourly' | 'keyword'>('daily');
  
  const { keywordStats } = useKeywordStats(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1);
  const { messages } = useMessages(500);

  // Process daily data
  const getDailyData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1;
    const dailyMap: { [key: string]: { messages: number; users: Set<string>; consultations: number } } = {};

    messages.forEach(msg => {
      if (msg.date) {
        if (!dailyMap[msg.date]) {
          dailyMap[msg.date] = { messages: 0, users: new Set(), consultations: 0 };
        }
        dailyMap[msg.date].messages++;
        dailyMap[msg.date].users.add(msg.from);
        if (msg.keyword === 'konsultasi') {
          dailyMap[msg.date].consultations++;
        }
      }
    });

    return Object.entries(dailyMap)
      .slice(-days)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        messages: data.messages,
        users: data.users.size,
        consultations: data.consultations
      }));
  };

  // Process hourly data (FIXED: Perbaiki kondisi untuk memeriksa msg.hour)
  const getHourlyData = () => {
    const hourlyMap: { [key: number]: number } = {};
    
    messages.forEach(msg => {
      if (msg.hour != null) { // Perbaikan: Cek jika hour ada (bukan null/undefined)
        hourlyMap[msg.hour] = (hourlyMap[msg.hour] || 0) + 1;
      }
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      messages: hourlyMap[i] || 0
    }));
  };

  // Conversion funnel data
  const getFunnelData = () => {
    const funnelCounts: { [key: string]: number } = {};
    
    messages.forEach(msg => {
      if (msg.keyword) {
        funnelCounts[msg.keyword] = (funnelCounts[msg.keyword] || 0) + 1;
      }
    });

    const total = Object.values(funnelCounts).reduce((a, b) => a + b, 0);
    
    return [
      { stage: 'Welcome', count: funnelCounts['welcome'] || 0, percentage: ((funnelCounts['welcome'] || 0) / total * 100).toFixed(1) },
      { stage: 'Mulai', count: funnelCounts['mulai'] || 0, percentage: ((funnelCounts['mulai'] || 0) / total * 100).toFixed(1) },
      { stage: 'Tips', count: funnelCounts['tips'] || 0, percentage: ((funnelCounts['tips'] || 0) / total * 100).toFixed(1) },
      { stage: 'Bonus', count: funnelCounts['bonus'] || 0, percentage: ((funnelCounts['bonus'] || 0) / total * 100).toFixed(1) },
      { stage: 'Autopilot', count: funnelCounts['autopilot'] || 0, percentage: ((funnelCounts['autopilot'] || 0) / total * 100).toFixed(1) },
      { stage: 'Konsultasi', count: funnelCounts['konsultasi'] || 0, percentage: ((funnelCounts['konsultasi'] || 0) / total * 100).toFixed(1) },
    ];
  };

  // Growth metrics
  const calculateGrowth = () => {
    const dailyData = getDailyData();
    if (dailyData.length < 2) return { messages: 0, users: 0, consultations: 0 };

    const latest = dailyData[dailyData.length - 1];
    const previous = dailyData[dailyData.length - 2];

    const safePercent = (latestVal: number, prevVal: number) => {
      if (!prevVal || prevVal === 0) return 0;
      return parseFloat(((latestVal - prevVal) / prevVal * 100).toFixed(1));
    };

    return {
      messages: safePercent(latest.messages, previous.messages),
      users: safePercent(latest.users, previous.users),
      consultations: safePercent(latest.consultations, previous.consultations)
    };
  };

  const dailyData = getDailyData();
  const hourlyData = getHourlyData();
  const funnelData = getFunnelData();
  const growth = calculateGrowth();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-500 mt-1">Deep dive into bot performance metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Messages Growth</p>
              {growth.messages >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className={`text-3xl font-bold ${growth.messages >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth.messages > 0 ? '+' : ''}{growth.messages}%
            </p>
            <p className="text-xs text-gray-500 mt-1">vs previous period</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Users Growth</p>
              {growth.users >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className={`text-3xl font-bold ${growth.users >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth.users > 0 ? '+' : ''}{growth.users}%
            </p>
            <p className="text-xs text-gray-500 mt-1">vs previous period</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Consultations Growth</p>
              {growth.consultations >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className={`text-3xl font-bold ${growth.consultations >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth.consultations > 0 ? '+' : ''}{growth.consultations}%
            </p>
            <p className="text-xs text-gray-500 mt-1">vs previous period</p>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex gap-2">
              {(['daily', 'hourly', 'keyword'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium capitalize transition-colors ${
                    chartType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              {chartType === 'daily' ? 'Daily Trend' : chartType === 'hourly' ? 'Hourly Activity' : 'Keyword Performance'}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'daily' ? (
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="messages" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMessages)" />
                  <Area type="monotone" dataKey="users" stroke="#10b981" fillOpacity={0.3} fill="#10b981" />
                  <Area type="monotone" dataKey="consultations" stroke="#f59e0b" fillOpacity={0.3} fill="#f59e0b" />
                </AreaChart>
              ) : chartType === 'hourly' ? (
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              ) : (
                <BarChart data={keywordStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="keyword" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="conversions" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Keyword Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Keyword Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={keywordStats.map(stat => ({
                    name: stat.keyword,
                    value: stat.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {keywordStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel Analysis</h2>
          <div className="space-y-3">
            {funnelData.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                    <span className="text-xs text-gray-500">{stage.count} messages</span>
                  </div>
                                 <span className="text-sm font-semibold text-gray-900">{stage.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500`}
                    style={{ 
                      width: `${stage.percentage}%`,
                      backgroundColor: COLORS[index]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 Insight:</strong> {funnelData[funnelData.length - 1].percentage}% of users reach consultation stage. 
              {parseFloat(funnelData[funnelData.length - 1].percentage) < 15 && ' Consider optimizing earlier funnel stages.'}
              {parseFloat(funnelData[funnelData.length - 1].percentage) >= 15 && parseFloat(funnelData[funnelData.length - 1].percentage) < 25 && ' Good conversion rate, room for improvement.'}
              {parseFloat(funnelData[funnelData.length - 1].percentage) >= 25 && ' Excellent conversion rate! 🎉'}
            </p>
          </div>
        </div>

        {/* Top Performing Keywords */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Keywords</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Keyword</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Usage</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Conversions</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Conversion Rate</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Trend</th>
                </tr>
              </thead>
              <tbody>
                {[...keywordStats]  // FIXED: Buat salinan array sebelum sorting untuk menghindari mutasi read-only
                  .sort((a, b) => b.count - a.count)
                  .map((stat, index) => {
                    const conversionRate = stat.count > 0 ? (stat.conversions / stat.count * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={stat.keyword} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">#{index + 1}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {stat.keyword}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">{stat.count}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{stat.conversions}</td>
                        <td className="py-3 px-4">
                          <span className={`text-sm font-semibold ${
                            parseFloat(conversionRate) >= 20 ? 'text-green-600' :
                            parseFloat(conversionRate) >= 10 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {conversionRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}