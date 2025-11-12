'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Send, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react';
import { useUsers } from '@/lib/hooks/useUsers';
import { useBroadcast } from '@/lib/hooks/useBroadcast';

export default function BroadcastPage() {
  const { users } = useUsers(1000);
  const { broadcasts, sending, sendBroadcast } = useBroadcast();
  
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'active' | 'inactive' | 'converted' | 'custom'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: number; failed: number; total: number } | null>(null);

  // Filter users based on target audience
  const filteredUsers = useMemo(() => {
    if (targetAudience === 'all') return users;
    if (targetAudience === 'custom') {
      return users.filter(u => selectedUsers.includes(u.userId));
    }
    return users.filter(u => u.status === targetAudience);
  }, [users, targetAudience, selectedUsers]);

  const recipientCount = useMemo(() => {
    if (targetAudience === 'custom') return selectedUsers.length;
    return filteredUsers.length;
  }, [targetAudience, selectedUsers, filteredUsers]);

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    if (recipientCount === 0) {
      alert('No recipients selected');
      return;
    }

    const confirmMsg = `Are you sure you want to send this message to ${recipientCount} user(s)?`;
    if (!confirm(confirmMsg)) return;

    try {
      const userIds = targetAudience === 'custom' 
        ? selectedUsers 
        : filteredUsers.map(u => u.userId);

      const result = await sendBroadcast(message, userIds);
      setSendResult(result);
      
      if (result.failed === 0) {
        alert(`✅ Broadcast sent successfully to ${result.success} users!`);
        setMessage('');
        setSelectedUsers([]);
      } else {
        alert(`⚠️ Broadcast completed:\n✅ Success: ${result.success}\n❌ Failed: ${result.failed}`);
      }
    } catch (error) {
      console.error('Broadcast error:', error);
      alert('Failed to send broadcast. Please try again.');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    setSelectedUsers(filteredUsers.map(u => u.userId));
  };

  const deselectAll = () => {
    setSelectedUsers([]);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Send className="w-8 h-8 text-blue-500" />
            Broadcast Message
          </h1>
          <p className="text-gray-500 mt-1">Send messages to multiple users at once</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recipients</p>
                <p className="text-2xl font-bold text-blue-600">{recipientCount}</p>
              </div>
              <Send className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sent Today</p>
                <p className="text-2xl font-bold text-purple-600">
                  {broadcasts.filter(b => {
                    const today = new Date().toDateString();
                    return b.sentAt && b.sentAt.toDateString() === today;
                  }).length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Compose Message */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Compose Message</h2>
          
          {/* Target Audience */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Target Audience
            </label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'active', 'inactive', 'converted', 'custom'].map(audience => (
                <button
                  key={audience}
                  onClick={() => setTargetAudience(audience as typeof targetAudience)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    targetAudience === audience
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {audience}
                  {audience !== 'custom' && ` (${
                    audience === 'all' 
                      ? users.length 
                      : users.filter(u => u.status === audience).length
                  })`}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Selection */}
          {targetAudience === 'custom' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-700">
                  Selected: {selectedUsers.length} users
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {users.map(user => (
                  <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.userId)}
                      onChange={() => toggleUserSelection(user.userId)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-mono text-gray-900">{user.userId}</span>
                    <span className={`ml-auto px-2 py-1 rounded-full text-xs ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' :
                      user.status === 'converted' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.status}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="Type your broadcast message here...&#10;&#10;You can use *bold*, _italic_ for WhatsApp formatting."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Character count: {message.length} / 4096 (WhatsApp limit)
              </p>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>
          </div>

          {/* Preview */}
          {showPreview && message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-semibold text-green-700 mb-2">PREVIEW (WhatsApp format):</p>
              <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-4 rounded border border-green-200">
                {message}
              </div>
            </div>
          )}

          {/* Send Result */}
          {sendResult && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📊 Broadcast Result</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-blue-700">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{sendResult.total}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Success</p>
                  <p className="text-2xl font-bold text-green-900">{sendResult.success}</p>
                </div>
                <div>
                  <p className="text-xs text-red-700">Failed</p>
                  <p className="text-2xl font-bold text-red-900">{sendResult.failed}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Will send to <strong>{recipientCount}</strong> user(s)
            </div>
            <button
              onClick={handleSendBroadcast}
              disabled={sending || !message.trim() || recipientCount === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
            >
              {sending ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Broadcast
                </>
              )}
            </button>
          </div>
        </div>

        {/* Broadcast History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Broadcast History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Message</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Recipients</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Result</th>
                </tr>
              </thead>
              <tbody>
                {broadcasts.map(broadcast => (
                  <tr key={broadcast.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {broadcast.sentAt 
                        ? new Date(broadcast.sentAt).toLocaleString('id-ID')
                        : new Date(broadcast.createdAt).toLocaleString('id-ID')
                      }
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 max-w-md truncate">
                      {broadcast.message}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {broadcast.totalRecipients}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        broadcast.status === 'sent' ? 'bg-green-100 text-green-700' :
                        broadcast.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                        broadcast.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {broadcast.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          {broadcast.sentCount}
                        </span>
                        {broadcast.failedCount > 0 && (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            {broadcast.failedCount}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {broadcasts.length === 0 && (
              <div className="text-center py-12">
                <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No broadcast history yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes:</h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Broadcast messages are sent immediately and cannot be recalled</li>
                <li>Respect WhatsApp rate limits to avoid being blocked</li>
                <li>Test with a small group before sending to all users</li>
                <li>Avoid sending spam or promotional content excessively</li>
                <li>Messages longer than 4096 characters will be truncated</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}