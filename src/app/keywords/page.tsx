'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  TrendingUp, 
  Search, 
  Download,
  Filter,
  Target,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { useKeywordStats } from '@/lib/hooks/useKeywordStats';
import { 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function KeywordsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'count' | 'conversions' | 'rate'>('count');
  
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const { keywordStats, loading } = useKeywordStats(days);

  // Filter and sort keywords
  const filteredKeywords = useMemo(() => {
    const filtered = keywordStats.filter(stat =>
      stat.keyword.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'count') return b.count - a.count;
      if (sortBy === 'conversions') return b.conversions - a.conversions;
      // Conversion rate
      const rateA = a.count > 0 ? (a.conversions / a.count) * 100 : 0;
      const rateB = b.count > 0 ? (b.conversions / b.count) * 100 : 0;
      return rateB - rateA;
    });

    return filtered;
  }, [keywordStats, searchQuery, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalUsage = keywordStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalConversions = keywordStats.reduce((sum, stat) => sum + stat.conversions, 0);
    const avgConversionRate = totalUsage > 0 ? (totalConversions / totalUsage) * 100 : 0;

    return {
      totalKeywords: keywordStats.length,
      totalUsage,
      totalConversions,
      avgConversionRate: avgConversionRate.toFixed(1)
    };
  }, [keywordStats]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Keyword', 'Usage Count', 'Conversions', 'Conversion Rate (%)'];
    const rows = filteredKeywords.map(stat => {
      const rate = stat.count > 0 ? ((stat.conversions / stat.count) * 100).toFixed(1) : '0.0';
      return [stat.keyword, stat.count.toString(), stat.conversions.toString(), rate];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keywords-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Keyword Analytics</h1>
              <p className="text-gray-500 mt-1">Detailed keyword performance and insights</p>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Keywords</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalKeywords}</p>
              </div>
              <Target className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsage.toLocaleString()}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConversions}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgConversionRate}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Keyword Usage</h2>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredKeywords.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="keyword" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Usage" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="conversions" fill="#10b981" name="Conversions" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Distribution</h2>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={filteredKeywords.map(stat => ({
                      name: stat.keyword,
                      value: stat.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
        `${name}: ${(percent ?? 0 * 100).toFixed(0)}%`
      }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {filteredKeywords.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'count' | 'conversions' | 'rate')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="count">Usage Count</option>
                <option value="conversions">Conversions</option>
                <option value="rate">Conversion Rate</option>
              </select>
            </div>
          </div>
        </div>

        {/* Keywords Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Keyword</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Usage Count</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Conversions</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Conversion Rate</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeywords.map((stat, index) => {
                    const conversionRate = stat.count > 0 ? (stat.conversions / stat.count * 100).toFixed(1) : '0.0';
                    const performance = parseFloat(conversionRate) >= 20 ? 'excellent' :
                                      parseFloat(conversionRate) >= 10 ? 'good' : 'needs-improvement';
                    
                    return (
                      <tr key={stat.keyword} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">#{index + 1}</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            {stat.keyword}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">{stat.count.toLocaleString()}</td>
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            performance === 'excellent' ? 'bg-green-100 text-green-700' :
                            performance === 'good' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {performance === 'excellent' ? '🎯 Excellent' :
                             performance === 'good' ? '👍 Good' :
                             '⚠️ Needs Work'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredKeywords.length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No keywords found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Keyword Insights</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• <strong>Best Performer:</strong> {filteredKeywords[0]?.keyword || 'N/A'} with {filteredKeywords[0]?.conversions || 0} conversions</li>
            <li>• <strong>Most Used:</strong> {filteredKeywords.sort((a, b) => b.count - a.count)[0]?.keyword || 'N/A'} ({filteredKeywords[0]?.count || 0} times)</li>
            <li>• <strong>Average Conversion Rate:</strong> {stats.avgConversionRate}% across all keywords</li>
            <li>• <strong>Recommendation:</strong> Focus optimization efforts on keywords with high usage but low conversion rates</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}