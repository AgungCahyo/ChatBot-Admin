'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Save, Edit2, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { useBotConfig } from '@/lib/hooks/useBotConfig';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, FieldValue } from 'firebase/firestore';

export default function MessagesPage() {
  const { config, loading } = useBotConfig();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'funnel' | 'errors' | 'links'>('funnel');
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleEdit = (path: string, currentValue: string) => {
    setEditingKey(path);
    setEditValue(currentValue);
  };

  const handleSave = async (path: string) => {
    setSaving(true);
    try {
      const configRef = doc(db, 'bot_config', 'messages');
      const pathParts = path.split('.');

      // Build nested update object
      const updateData: Record<string, string | FieldValue> = {};
      if (pathParts.length === 1) {
        updateData[pathParts[0]] = editValue;
      } else if (pathParts.length === 2) {
        updateData[`${pathParts[0]}.${pathParts[1]}`] = editValue;
      } else if (pathParts.length === 3) {
        updateData[`${pathParts[0]}.${pathParts[1]}.${pathParts[2]}`] = editValue;
      }

      updateData.last_updated = serverTimestamp();
      updateData.updated_by = 'admin';

      await updateDoc(configRef, updateData);

      setEditingKey(null);
      setSuccessMessage('✅ Saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!config) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">No configuration found</p>
        </div>
      </DashboardLayout>
    );
  }

  const InputField = ({ 
    label, 
    path, 
    value, 
    placeholder, 
    type = 'text',
    className = '', // ← tambahin ini
  }: { 
    label: string; 
    path: string; 
    value: string; 
    placeholder: string; 
    type?: 'text' | 'textarea';
    className?: string; // ← dan ini
  }) => {
    const isEditing = editingKey === path;
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        {isEditing ? (
          <div className="space-y-2">
            {type === 'textarea' ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={10}
                className={`w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 font-mono text-sm ${className}`}
                placeholder={placeholder}
              />
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className={`w-full font-mono px-3 py-2 border border-blue-300 rounded-lg focus:border-none ${className}`}
                placeholder={placeholder}
              />
            )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(path)}
                  disabled={saving || !editValue.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setPreviewKey(previewKey === path ? null : path)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50  whitespace-pre-wrap font-mono text-sm text-black">
                {value || <span className="text-gray-400">{placeholder}</span>}
              </div>
              <button
                onClick={() => handleEdit(path, value)}
                className="absolute right-2 top-2 p-2 bg-white border border-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
          {previewKey === path && (
            <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-semibold text-green-700 mb-2">PREVIEW (WhatsApp format):</p>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">{editValue || value}</div>
            </div>
          )}
        </div>
      );
    };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Message Editor</h1>
              <p className="text-gray-500 mt-1">Edit bot responses in real-time</p>
            </div>
            <div className="flex items-center gap-4">
              {successMessage && (
                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium animate-fade-in">
                  {successMessage}
                </div>
              )}
              <div className="text-sm text-gray-500">
                Last updated: {config.last_updated ? new Date(config.last_updated).toLocaleString('id-ID') : 'Never'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['funnel', 'errors', 'links'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab === 'funnel' ? 'Funnel Messages' : tab === 'errors' ? 'Error Messages' : 'Links & Variables'}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'links' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Global Variables</h2>
            <div className="space-y-6">
              <InputField
                label="Ebook Link"
                path="ebook_link"
                value={config.ebook_link}
                placeholder="https://lynk.id/your-ebook-link"
              />
              <InputField
                label="Bonus Link"
                path="bonus_link"
                value={config.bonus_link}
                placeholder="https://drive.google.com/your-bonus-link"

              />
              <InputField
                label="Konsultan WhatsApp"
                path="konsultan_wa"
                value={config.konsultan_wa}
                placeholder="https://wa.me/628123456789"
              />
            </div>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Use placeholders {'{{'} ebook_link {'}}'}, {'{{'} bonus_link {'}}'}, {'{{'} konsultan_wa {'}}'} in messages for auto-replace
              </p>
            </div>
          </div>
        )}

        {activeTab === 'funnel' && (
          <div className="space-y-6">
            {Object.entries(config.funnel).map(([key, data]) => (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 capitalize">{key}</h2>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    Keyword: {key}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <InputField
                      label="Message"
                      path={`funnel.${key}.message`}
                      value={data.message}
                      placeholder="Enter message text..."
                      type="textarea"
                      className="text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reaction Emoji
                    </label>
                    <div className="text-4xl mb-4">{data.reaction}</div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-2">Character count:</p>
                      <p className="text-2xl font-bold text-gray-900">{data.message.length}</p>
                      <p className="text-xs text-gray-500 mt-1">WhatsApp limit: 4096</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-6">
            {Object.entries(config.errors).map(([key, value]) => (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 capitalize mb-4">
                  {key.replace(/_/g, ' ')}
                </h2>
                <InputField
                  label="Error Message"
                  path={`errors.${key}`}
                  value={value}
                  placeholder="Enter error message..."
                  type="textarea"
                />
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Important Notes:</h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Changes are saved to Firebase and applied immediately to the bot</li>
                <li>Use *bold*, _italic_ for WhatsApp formatting</li>
                <li>Test messages on a personal number before going live</li>
                <li>Maximum message length: 4096 characters</li>
                <li>Emoji reactions must be single emoji (no text)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
