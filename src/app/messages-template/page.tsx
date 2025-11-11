'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Save, Edit2, Eye, AlertCircle, RefreshCw, X, Settings } from 'lucide-react';
import { useBotConfig } from '@/lib/hooks/useBotConfig';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, FieldValue } from 'firebase/firestore';

interface InputFieldProps {
  label: string;
  path: string;
  value: string;
  placeholder: string;
  type?: 'text' | 'textarea';
  className?: string;
  editingKey: string | null;
  editValue: string;
  saving: boolean;
  previewKey: string | null;
  onEdit: (path: string, value: string) => void;
  onSave: (path: string) => void;
  onCancel: () => void;
  onEditValueChange: (value: string) => void;
  onPreviewToggle: (path: string | null) => void;
  description?: string;
}

function InputField({
  label,
  path,
  value,
  placeholder,
  type = 'text',
  className = '',
  editingKey,
  editValue,
  saving,
  previewKey,
  onEdit,
  onSave,
  onCancel,
  onEditValueChange,
  onPreviewToggle,
  description
}: InputFieldProps) {
  const isEditing = editingKey === path;
  const isPreviewing = previewKey === path;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {description && <span className="text-xs text-gray-500 block mt-1">{description}</span>}
      </label>
      {isEditing ? (
        <div className="space-y-2">
          {type === 'textarea' ? (
            <textarea
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${className}`}
              placeholder={placeholder}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              className={`w-full font-mono px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
              placeholder={placeholder}
              autoFocus
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onSave(path)}
              disabled={saving || !editValue.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={() => onPreviewToggle(isPreviewing ? null : path)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {isPreviewing ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 whitespace-pre-wrap font-mono text-sm text-black min-h-[42px]">
            {value || <span className="text-gray-400">{placeholder}</span>}
          </div>
          <button
            onClick={() => onEdit(path, value)}
            className="absolute right-2 top-2 p-2 bg-white border border-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 hover:border-blue-400"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}
      {isPreviewing && (
        <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-green-700">PREVIEW (WhatsApp format):</p>
            <button
              onClick={() => onPreviewToggle(null)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border border-green-200">
            {editValue || value}
          </div>
        </div>
      )}
    </div>
  );
}

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return '';
    }
  }
  
  return typeof current === 'string' ? current : '';
}

export default function SystemMessagesPage() {
  const { config, loading } = useBotConfig();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'offline' | 'consultation' | 'buttons' | 'followup'>('offline');
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (editingKey && config) {
      const currentValue = getNestedValue(config as unknown as Record<string, unknown>, editingKey);
      
      if (editValue === '' && currentValue) {
        setEditValue(currentValue);
      }
    }
  }, [config, editingKey, editValue]);

  const handleEdit = (path: string, currentValue: string) => {
    setEditingKey(path);
    setEditValue(currentValue);
    setPreviewKey(null);
  };

  const handleSave = async (path: string) => {
    setSaving(true);
    try {
      const configRef = doc(db, 'bot_config', 'messages');
      const pathParts = path.split('.');

      const updateData: {
        [key: string]: string | FieldValue;
        last_updated: FieldValue;
        updated_by: string;
      } = {
        last_updated: serverTimestamp(),
        updated_by: 'admin-dashboard',
      };

      // Build nested path for Firestore
      if (pathParts.length === 1) {
        updateData[pathParts[0]] = editValue;
      } else {
        updateData[pathParts.join('.')] = editValue;
      }

      await updateDoc(configRef, updateData);

      setEditingKey(null);
      setEditValue('');
      setPreviewKey(null);
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
    setPreviewKey(null);
  };

  const handleEditValueChange = (value: string) => {
    setEditValue(value);
  };

  const handlePreviewToggle = (key: string | null) => {
    setPreviewKey(key);
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

  if (!config || !config.system_messages) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">System messages configuration not found</p>
        </div>
      </DashboardLayout>
    );
  }

const systemMessages =
  typeof config.system_messages === 'string'
    ? JSON.parse(config.system_messages)
    : (config.system_messages as Record<string, string>);


  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-500" />
                System Messages
              </h1>
              <p className="text-gray-500 mt-1">Edit automated responses and system texts</p>
            </div>
            <div className="flex items-center gap-4">
              {successMessage && (
                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium animate-fade-in flex items-center gap-2">
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
            {(['offline', 'consultation', 'buttons', 'followup'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setEditingKey(null);
                  setEditValue('');
                  setPreviewKey(null);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'offline' ? 'Offline Hours' : 
                 tab === 'consultation' ? 'Consultation' : 
                 tab === 'buttons' ? 'Button Texts' : 
                 'Follow-up Messages'}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'offline' && systemMessages.offline_hours && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Offline Hours Auto-Reply</h2>
            <InputField
              label="Offline Message"
              path="system_messages.offline_hours.message"
              value={(systemMessages.offline_hours as Record<string, string>).message as string || ''}
              placeholder="Enter offline hours message..."
              type="textarea"
              className="text-black"
              editingKey={editingKey}
              editValue={editValue}
              saving={saving}
              previewKey={previewKey}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
              onEditValueChange={handleEditValueChange}
              onPreviewToggle={handlePreviewToggle}
              description="Use {name} placeholder for personalization"
            />
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Available Placeholders:</strong>
                <br />• <code>{'{name}'}</code> - Users name (falls back to generic greeting if unknown)
                <br />• Working hours: 08:00 - 17:00 WIB
              </p>
            </div>
          </div>
        )}

        {activeTab === 'consultation' && systemMessages.consultation_notification && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Consultation Admin Notification</h2>
            <InputField
              label="Admin Notification Template"
              path="system_messages.consultation_notification.template"
              value={(systemMessages.consultation_notification as Record<string, unknown>).template as string || ''}
              placeholder="Enter admin notification template..."
              type="textarea"
              className="text-black"
              editingKey={editingKey}
              editValue={editValue}
              saving={saving}
              previewKey={previewKey}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
              onEditValueChange={handleEditValueChange}
              onPreviewToggle={handlePreviewToggle}
              description="Sent to admin when user requests consultation"
            />
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Available Placeholders:</strong>
                <br />• <code>{'{name}'}</code> - Users name
                <br />• <code>{'{phone}'}</code> - Users phone number
                <br />• <code>{'{message}'}</code> - Users message text
                <br />• <code>{'{timestamp}'}</code> - Request timestamp
              </p>
            </div>
          </div>
        )}

        {activeTab === 'buttons' && systemMessages.button_text && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Button Texts (Max 20 characters)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(systemMessages.button_text as Record<string, string>).map(([key, value]) => (
                  <InputField
                    key={key}
                    label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    path={`system_messages.button_text.${key}`}
                    value={value}
                    placeholder={`Enter ${key} button text...`}
                    className="text-black"
                    editingKey={editingKey}
                    editValue={editValue}
                    saving={saving}
                    previewKey={previewKey}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onEditValueChange={handleEditValueChange}
                    onPreviewToggle={handlePreviewToggle}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Button Footers</h2>
              <div className="space-y-6">
                {systemMessages.button_footer && Object.entries(systemMessages.button_footer as Record<string, string>).map(([key, value]) => (
                  <InputField
                    key={key}
                    label={`${key.charAt(0).toUpperCase() + key.slice(1)} Footer`}
                    path={`system_messages.button_footer.${key}`}
                    value={value}
                    placeholder={`Enter ${key} footer text...`}
                    type="textarea"
                    className="text-black"
                    editingKey={editingKey}
                    editValue={editValue}
                    saving={saving}
                    previewKey={previewKey}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onEditValueChange={handleEditValueChange}
                    onPreviewToggle={handlePreviewToggle}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'followup' && systemMessages.follow_up_messages && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Follow-up Messages</h2>
            <div className="space-y-6">
              {Object.entries(systemMessages.follow_up_messages as Record<string, string>).map(([key, value]) => (
                <InputField
                  key={key}
                  label={key.replace(/after_/g, 'After ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  path={`system_messages.follow_up_messages.${key}`}
                  value={value}
                  placeholder={`Enter ${key} message...`}
                  type="textarea"
                  className="text-black"
                  editingKey={editingKey}
                  editValue={editValue}
                  saving={saving}
                  previewKey={previewKey}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onEditValueChange={handleEditValueChange}
                  onPreviewToggle={handlePreviewToggle}
                  description="Sent after main message with button choices"
                />
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Important Notes:</h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Changes are saved to Firebase and applied immediately to the bot</li>
                <li>Button texts have a 20-character limit imposed by WhatsApp</li>
                <li>Use placeholders for dynamic content (e.g., {'{name}'}, {'{phone}'})</li>
                <li>Test all changes on a personal number before going live</li>
                <li>Footer texts appear below interactive buttons</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}