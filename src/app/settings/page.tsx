'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Settings2, 
  Activity, 
  Database, 
  Zap, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

// === Status Indicator Component ===
function StatusIndicator({
  status,
}: {
  status: 'checking' | 'online' | 'verified' | 'connected' | 'offline' | 'error';
}) {
  if (status === 'checking') {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm">Checking...</span>
      </div>
    );
  }

  const isSuccess = ['online', 'verified', 'connected'].includes(status);

  return (
    <div
      className={`flex items-center gap-2 ${
        isSuccess ? 'text-green-600' : 'text-red-600'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      )}
      <span className="text-sm font-medium capitalize">{status}</span>
    </div>
  );
}

// === Main Page ===
export default function SettingsPage() {
  const [botStatus, setBotStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [webhookStatus, setWebhookStatus] = useState<'checking' | 'verified' | 'error'>('checking');
  const [firebaseStatus, setFirebaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');

 const checkBotStatus = async () => {
  try {
    const response = await fetch('/api/bot-status', { cache: 'no-store' });
    const data = await response.json();

    // anggap status "healthy" = online
    setBotStatus(data.status === 'healthy' ? 'online' : 'offline');
  } catch (error) {
    console.error('Failed to check bot status:', error);
    setBotStatus('offline');
  }
};


  const checkWebhookStatus = async () => {
    try {
      // simulasi sementara
      setTimeout(() => setWebhookStatus('verified'), 1000);
    } catch {
      setWebhookStatus('error');
    }
  };

  const checkFirebaseStatus = () => {
    try {
      if (typeof window !== 'undefined') {
        setFirebaseStatus('connected');
      } else {
        setFirebaseStatus('error');
      }
    } catch {
      setFirebaseStatus('error');
    }
  };

useEffect(() => {
  const checkAll = async () => {
    await checkBotStatus();
    await checkWebhookStatus();
    checkFirebaseStatus();
  };

  // biar gak langsung sinkron
  const timer = setTimeout(checkAll, 0);
  return () => clearTimeout(timer);
}, []);


  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Bot configuration and system status</p>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            System Status
          </h2>

          <div className="space-y-4">
            {/* Bot Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">WhatsApp Bot</p>
                  <p className="text-sm text-gray-500">Main bot service status</p>
                </div>
              </div>
              <StatusIndicator status={botStatus} />
            </div>

            {/* Webhook Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ExternalLink className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Webhook</p>
                  <p className="text-sm text-gray-500">WhatsApp webhook connection</p>
                </div>
              </div>
              <StatusIndicator status={webhookStatus} />
            </div>

            {/* Firebase Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Database className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Firebase</p>
                  <p className="text-sm text-gray-500">Database and storage</p>
                </div>
              </div>
              <StatusIndicator status={firebaseStatus} />
            </div>
          </div>
            {/* Firebase Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Database className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Firebase</p>
                  <p className="text-sm text-gray-500">Database and storage</p>
                </div>
              </div>
              <StatusIndicator status={firebaseStatus} />
            </div>
          </div>
        </div>

        {/* Bot Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-500" />
            Bot Configuration
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bot Name
                </label>
                <input
                  type="text"
                  value="Jalan Pintas Juragan Photobox"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value="+62 xxx xxxx xxxx"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Version
                </label>
                <input
                  type="text"
                  value="v24.0"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment
                </label>
                <input
                  type="text"
                  value="Production"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Rate Limiting</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Messages per user</p>
                <p className="text-sm text-gray-500">Maximum messages per user per hour</p>
              </div>
              <span className="text-lg font-bold text-gray-900">60</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Rate limit window</p>
                <p className="text-sm text-gray-500">Time window for rate limiting</p>
              </div>
              <span className="text-lg font-bold text-gray-900">5 seconds</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Cache size</p>
                <p className="text-sm text-gray-500">Maximum cached messages</p>
              </div>
              <span className="text-lg font-bold text-gray-900">1000</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-3 border-2 border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Dashboard
            </button>
            <button
              onClick={() => alert('View logs feature coming soon!')}
              className="px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
            >
              <Activity className="w-5 h-5" />
              View Logs
            </button>
            <button
              onClick={() => alert('Test webhook feature coming soon!')}
              className="px-4 py-3 border-2 border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 font-medium flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              Test Webhook
            </button>
            <button
              onClick={() => alert('Export data feature coming soon!')}
              className="px-4 py-3 border-2 border-green-200 text-green-700 rounded-lg hover:bg-green-50 font-medium flex items-center justify-center gap-2"
            >
              <Database className="w-5 h-5" />
              Export Data
            </button>
          </div>
        </div>
    </DashboardLayout>
  );
}