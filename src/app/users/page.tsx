'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Download, UserCircle, TrendingUp, MessageSquare } from 'lucide-react';
import { useUsers } from '@/lib/hooks/useUsers';

export default function UsersPage() {
  const { users, loading } = useUsers(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'converted'>('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    converted: users.filter(u => u.status === 'converted').length,
    avgMessages: Math.round(users.reduce((acc, u) => acc + u.messageCount, 0) / users.length) || 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'converted': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const exportToCSV = () => {
    const headers = ['User ID', 'First Seen', 'Last Seen', 'Messages', 'Status', 'Last Keyword'];
    const rows = filteredUsers.map(user => [
      user.name,
      new Date(user.firstSeen).toLocaleDateString('id-ID'),
      new Date(user.lastSeen).toLocaleDateString('id-ID'),
      user.messageCount.toString(),
      user.status,
      user.lastKeyword || '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-500 mt-1">Track and manage bot users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <UserCircle className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-blue-600">{stats.converted}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgMessages}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'converted')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="converted">Converted</option>
              </select>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User Number</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">First Seen</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Last Seen</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Messages</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Last Keyword</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                        {user.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                        {user.userId}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.firstSeen ? new Date(user.firstSeen).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.lastSeen ? new Date(user.lastSeen).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <span className="font-semibold">{user.messageCount}</span>
                      </td>
                      <td className="py-3 px-4">
                        {user.lastKeyword ? (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {user.lastKeyword}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {user.tags.length > 0 ? (
                            user.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">No tags</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
