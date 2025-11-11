'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  MessageSquare, 
  Search, 
  Download,
  Filter,
  Clock,
  User,
  Hash,
  ExternalLink
} from 'lucide-react';
import { useMessages } from '@/lib/hooks/useMessages';

export default function AllMessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [keywordFilter, setKeywordFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [limitCount, setLimitCount] = useState(100);
  
  const { messages, loading } = useMessages(limitCount);

  // Get unique keywords for filter
  const uniqueKeywords = useMemo(() => {
    const keywords = new Set(messages.map(m => m.keyword));
    return Array.from(keywords).sort();
  }, [messages]);

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const matchesSearch = 
        msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.textBody.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.messageId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesKeyword = !keywordFilter || msg.keyword === keywordFilter;
      const matchesType = !typeFilter || msg.type === typeFilter;
      
      return matchesSearch && matchesKeyword && matchesType;
    });
  }, [messages, searchQuery, keywordFilter, typeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const textMessages = messages.filter(m => m.type === 'text').length;
    const interactiveMessages = messages.filter(m => m.type === 'interactive').length;
    const uniqueUsers = new Set(messages.map(m => m.from)).size;
    
    return {
      total: messages.length,
      text: textMessages,
      interactive: interactiveMessages,
      uniqueUsers
    };
  }, [messages]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Type', 'Message', 'Keyword', 'Status'];
    const rows = filteredMessages.map(msg => [
      msg.timestamp ? msg.timestamp.toISOString() : '',
      msg.from,
      msg.type,
      msg.textBody.replace(/"/g, '""'), // Escape quotes
      msg.keyword,
      msg.status
    ]);

    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setKeywordFilter(null);
    setTypeFilter(null);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Messages</h1>
              <p className="text-gray-500 mt-1">Complete message history and logs</p>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={limitCount}
                onChange={(e) => setLimitCount(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value={50}>Last 50</option>
                <option value={100}>Last 100</option>
                <option value={200}>Last 200</option>
                <option value={500}>Last 500</option>
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
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Text Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.text}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Interactive</p>
                <p className="text-2xl font-bold text-gray-900">{stats.interactive}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsers}</p>
              </div>
              <User className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by user, message, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              {/* Keyword Filter */}
              <select
                value={keywordFilter || ''}
                onChange={(e) => setKeywordFilter(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Keywords</option>
                {uniqueKeywords.map(keyword => (
                  <option key={keyword} value={keyword}>{keyword}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter || ''}
                onChange={(e) => setTypeFilter(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="text">Text</option>
                <option value="interactive">Interactive</option>
              </select>

              {/* Clear Filters */}
              {(searchQuery || keywordFilter || typeFilter) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Clear Filters
                </button>
              )}

              <div className="ml-auto text-sm text-gray-600">
                Showing {filteredMessages.length} of {messages.length} messages
              </div>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Timestamp
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        User
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Type
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Keyword</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMessages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                        {msg.timestamp ? (
                          <div>
                            <div>{msg.timestamp.toLocaleDateString('id-ID')}</div>
                            <div className="text-xs text-gray-400">
                              {msg.timestamp.toLocaleTimeString('id-ID', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <div className="font-mono text-gray-900">{msg.from.substring(0, 15)}...</div>
                          <div className="text-xs text-gray-500">ID: {msg.messageId.substring(0, 10)}...</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          msg.type === 'text' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-purple-50 text-purple-700'
                        }`}>
                          {msg.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 max-w-md">
                        <div className="truncate" title={msg.textBody}>
                          {msg.textBody}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          {msg.keyword}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`flex items-center gap-1 text-xs font-medium ${
                          msg.status === 'success' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            msg.status === 'success' 
                              ? 'bg-green-500' 
                              : 'bg-red-500'
                          }`}></div>
                          {msg.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={`https://wa.me/${msg.from}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Chat
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredMessages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No messages found</p>
                  {(searchQuery || keywordFilter || typeFilter) && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Clear filters to see all messages
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Message Insights</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Messages are ordered by most recent first</li>
            <li>• Use filters to narrow down specific message types or keywords</li>
            <li>• Export functionality includes all filtered messages</li>
            <li>• Click  to open WhatsApp conversation with the user</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}