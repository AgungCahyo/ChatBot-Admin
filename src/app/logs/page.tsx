'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Terminal, 
  Filter, 
  Download, 
  RefreshCw, 
  Search,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Bug,
  Trash2
} from 'lucide-react';
import { useSystemLogs } from '@/lib/hooks/useSystemLogs';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Pastikan path ini benar
import LastUpdated from '@/components/LastUpdate';

export default function LogsPage() {
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [limitCount, setLimitCount] = useState(100);
  
  const { logs: allLogs, loading, error } = useSystemLogs({ 
    limitCount, 
    realtime: true 
  });

  // Filter logs by level and search
  const filteredLogs = useMemo(() => {
    let filtered = allLogs;
    
    if (levelFilter) {
      filtered = filtered.filter(log => log.level === levelFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(query) ||
        log.data?.toLowerCase().includes(query) ||
        log.level.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [allLogs, levelFilter, searchQuery]);

  // Stats (calculated from all logs, not filtered)
  const stats = useMemo(() => {
    return {
      total: allLogs.length,
      info: allLogs.filter(l => l.level === 'INFO').length,
      warn: allLogs.filter(l => l.level === 'WARN').length,
      error: allLogs.filter(l => l.level === 'ERROR').length,
      success: allLogs.filter(l => l.level === 'SUCCESS').length,
      debug: allLogs.filter(l => l.level === 'DEBUG').length,
    };
  }, [allLogs]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'INFO': return <Info className="w-4 h-4" />;
      case 'WARN': return <AlertTriangle className="w-4 h-4" />;
      case 'ERROR': return <XCircle className="w-4 h-4" />;
      case 'SUCCESS': return <CheckCircle className="w-4 h-4" />;
      case 'DEBUG': return <Bug className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'WARN': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'ERROR': return 'bg-red-50 text-red-700 border-red-200';
      case 'SUCCESS': return 'bg-green-50 text-green-700 border-green-200';
      case 'DEBUG': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const exportLogs = () => {
    const headers = ['Timestamp', 'Level', 'Message', 'Data', 'Environment'];
    const rows = filteredLogs.map(log => [
      log.timestamp.toISOString(),
      log.level,
      log.message,
      log.data || '',
      log.environment
    ]);

    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  const clearFilters = () => {
    setLevelFilter(null);
    setSearchQuery('');
  };

  const clearLogs = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus semua log? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const q = query(collection(db, 'system_logs'));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      alert('Semua log telah dihapus.');
      // Reload atau refresh data jika diperlukan
      window.location.reload();
    } catch (err) {
      console.error('Error deleting logs:', err);
      alert('Gagal menghapus log. Periksa console untuk detail.');
    }
  };

  const clearFilteredLogs = async () => {
    if (filteredLogs.length === 0) {
      alert('Tidak ada log yang sesuai dengan filter untuk dihapus.');
      return;
    }

    const filterDescription = levelFilter ? `level ${levelFilter}` : searchQuery ? `pencarian "${searchQuery}"` : 'semua';
    if (!confirm(`Apakah Anda yakin ingin menghapus ${filteredLogs.length} log yang sesuai dengan filter (${filterDescription})? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const deletePromises = filteredLogs.map(log => deleteDoc(doc(db, 'system_logs', log.id)));
      await Promise.all(deletePromises);
      alert(`${filteredLogs.length} log telah dihapus.`);
      // Reload atau refresh data jika diperlukan
      window.location.reload();
    } catch (err) {
      console.error('Error deleting filtered logs:', err);
      alert('Gagal menghapus log yang difilter. Periksa console untuk detail.');
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Logs</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Terminal className="w-8 h-8 text-blue-500" />
                System Logs
              </h1>
              <p className="text-gray-500 mt-1">Real-time system monitoring and diagnostics</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-4">
            <p className="text-sm text-blue-600">Info</p>
            <p className="text-2xl font-bold text-blue-900">{stats.info}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-100 p-4">
            <p className="text-sm text-yellow-600">Warnings</p>
            <p className="text-2xl font-bold text-yellow-900">{stats.warn}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-100 p-4">
            <p className="text-sm text-red-600">Errors</p>
            <p className="text-2xl font-bold text-red-900">{stats.error}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm border border-green-100 p-4">
            <p className="text-sm text-green-600">Success</p>
            <p className="text-2xl font-bold text-green-900">{stats.success}</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-100 p-4">
            <p className="text-sm text-purple-600">Debug</p>
            <p className="text-2xl font-bold text-purple-900">{stats.debug}</p>
          </div>
        </div>

    {/* Filters */}
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    
    {/* Search */}
    <div className="flex-1 min-w-[200px]">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    {/* Level Filter */}
    <div className="flex flex-col md:flex-row md:items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Level:</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {['INFO', 'WARN', 'ERROR', 'SUCCESS', 'DEBUG'].map(level => (
          <button
            key={level}
            onClick={() => setLevelFilter(levelFilter === level ? null : level)}
            className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
              levelFilter === level
                ? getLevelColor(level)
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>

    {/* Actions */}
    <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
      <button
        onClick={clearFilters}
        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs font-medium"
      >
        Clear Filters
      </button>
      <button
        onClick={clearFilteredLogs}
        className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center gap-1 text-xs font-medium"
        disabled={filteredLogs.length === 0}
      >
        <Trash2 className="w-3 h-3" />
        Clear ({filteredLogs.length})
      </button>
      <button
        onClick={clearLogs}
        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1 text-xs font-medium"
      >
        <Trash2 className="w-3 h-3" />
        Clear All
      </button>
      <button
        onClick={exportLogs}
        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 text-xs font-medium"
      >
        <Download className="w-3 h-3" />
        Export
      </button>
    </div>

  </div>
</div>



        {/* Logs List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Terminal className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <div className="font-mono text-sm">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Level Badge */}
                      <span className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                        {log.level}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <p className="text-gray-900 break-words">{log.message}</p>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {log.timestamp.toLocaleTimeString('id-ID')}
                          </span>
                        </div>
                        
                        {log.data && (
                          <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-green-400 overflow-x-auto">
                            <pre>{log.data}</pre>
                          </div>
                        )}

                        {Object.keys(log.metadata).length > 0 && (
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {Object.entries(log.metadata).map(([key, value]) => (
                              <span key={key} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Auto-scroll
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                Show last:
                <select
                  value={limitCount}
                  onChange={(e) => setLimitCount(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                </select>
                logs
              </label>
            </div>
           <LastUpdated/>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
