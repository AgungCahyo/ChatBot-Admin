// src/app/configuration/page.tsx - COMPLETE VERSION
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Save,
  Edit2,
  Eye,
  AlertCircle,
  RefreshCw,
  X,
  Settings,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { useBotConfig } from '@/lib/hooks/useBotConfig';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, FieldValue } from 'firebase/firestore';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Sunday', shortName: 'Sun' },
  { id: 1, name: 'Monday', shortName: 'Mon' },
  { id: 2, name: 'Tuesday', shortName: 'Tue' },
  { id: 3, name: 'Wednesday', shortName: 'Wed' },
  { id: 4, name: 'Thursday', shortName: 'Thu' },
  { id: 5, name: 'Friday', shortName: 'Fri' },
  { id: 6, name: 'Saturday', shortName: 'Sat' },
];

const TIMEZONES = [
  { value: 'Asia/Jakarta', label: 'WIB (Jakarta, UTC+7)' },
  { value: 'Asia/Makassar', label: 'WITA (Makassar, UTC+8)' },
  { value: 'Asia/Jayapura', label: 'WIT (Jayapura, UTC+9)' },
];

type TabType = 'funnel' | 'system' | 'links' | 'hours' | 'errors';

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
  label, path, value, placeholder, type = 'text', className = '',
  editingKey, editValue, saving, previewKey,
  onEdit, onSave, onCancel, onEditValueChange, onPreviewToggle, description
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
              rows={8}
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
            <button onClick={() => onSave(path)} disabled={saving || !editValue.trim()} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onCancel} disabled={saving} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2 transition-colors">
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button onClick={() => onPreviewToggle(isPreviewing ? null : path)} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2 transition-colors">
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
          <button onClick={() => onEdit(path, value)} className="absolute right-2 top-2 p-2 bg-white border border-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 hover:border-blue-400">
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}
      {isPreviewing && (
        <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-green-700">PREVIEW (WhatsApp format):</p>
            <button onClick={() => onPreviewToggle(null)} className="text-green-600 hover:text-green-800">
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

export default function ConfigurationPage() {
  const { config, loading } = useBotConfig();
  const [activeTab, setActiveTab] = useState<TabType>('funnel');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [whEnabled, setWhEnabled] = useState(true);
  const [whStartHour, setWhStartHour] = useState(8);
  const [whEndHour, setWhEndHour] = useState(17);
  const [whTimezone, setWhTimezone] = useState('Asia/Jakarta');
  const [whSelectedDays, setWhSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (config?.working_hours) {
      const wh = config.working_hours;
      setWhEnabled(wh.enabled ?? true);
      setWhStartHour(wh.start_hour ?? 8);
      setWhEndHour(wh.end_hour ?? 17);
      setWhTimezone(wh.timezone ?? 'Asia/Jakarta');
      setWhSelectedDays(wh.days ?? [1, 2, 3, 4, 5]);
    }
  }, [config]);

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
      const updateData: { [key: string]: string | FieldValue; last_updated: FieldValue; updated_by: string } = {
        last_updated: serverTimestamp(),
        updated_by: 'admin-dashboard',
      };
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
      setErrorMessage('❌ Failed to save');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
    setPreviewKey(null);
  };

  const handleSaveWorkingHours = async () => {
    if (whStartHour >= whEndHour) {
      setErrorMessage('Start hour must be before end hour');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (whSelectedDays.length === 0) {
      setErrorMessage('Please select at least one working day');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setSaving(true);
    setErrorMessage('');
    try {
      const configRef = doc(db, 'bot_config', 'messages');
      await updateDoc(configRef, {
        'working_hours.enabled': whEnabled,
        'working_hours.start_hour': whStartHour,
        'working_hours.end_hour': whEndHour,
        'working_hours.timezone': whTimezone,
        'working_hours.days': whSelectedDays,
        'last_updated': serverTimestamp(),
        'updated_by': 'admin-dashboard'
      });
      setSuccessMessage('✅ Working hours updated!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setErrorMessage('❌ Failed to save');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayId: number) => {
    setWhSelectedDays(prev => prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId].sort());
  };

  const getCurrentTime = () => {
    try {
      return new Date().toLocaleString('id-ID', {
        timeZone: whTimezone, hour: '2-digit', minute: '2-digit', second: '2-digit',
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return 'Invalid timezone';
    }
  };

  const isCurrentlyWithinHours = () => {
    if (!whEnabled) return true;
    try {
      const now = new Date().toLocaleString('en-US', { timeZone: whTimezone });
      const currentDate = new Date(now);
      const currentHour = currentDate.getHours();
      const currentDay = currentDate.getDay();
      const isWorkingDay = whSelectedDays.includes(currentDay);
      const isWorkingHour = currentHour >= whStartHour && currentHour < whEndHour;
      return isWorkingDay && isWorkingHour;
    } catch {
      return false;
    }
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

  const systemMessages = typeof config.system_messages === 'string'
    ? JSON.parse(config.system_messages)
    : (config.system_messages as Record<string, unknown>);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-500" />
                Bot Configuration
              </h1>
              <p className="text-gray-500 mt-1">Manage all bot settings in one place</p>
            </div>
            <div className="flex items-center gap-4">
              {successMessage && (
                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />{successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />{errorMessage}
                </div>
              )}
              <div className="text-sm text-gray-500">
                Last updated: {config.last_updated ? new Date(config.last_updated).toLocaleString('id-ID') : 'Never'}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'funnel', label: 'Funnel Messages' },
              { id: 'system', label: 'System Messages' },
              { id: 'links', label: 'Links & Variables' },
              { id: 'hours', label: 'Working Hours' },
              { id: 'errors', label: 'Error Messages' }
            ].map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id as TabType); setEditingKey(null); setEditValue(''); setPreviewKey(null); }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'funnel' && (
          <div className="space-y-6">
            {Object.entries(config.funnel).map(([key, data]) => (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 capitalize">{key}</h2>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">Keyword: {key}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <InputField label="Message" path={`funnel.${key}.message`} value={data.message} placeholder="Enter message text..." type="textarea" className="text-black"
                      editingKey={editingKey} editValue={editValue} saving={saving} previewKey={previewKey}
                      onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel} onEditValueChange={setEditValue} onPreviewToggle={setPreviewKey} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reaction Emoji</label>
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

        {activeTab === 'system' && systemMessages && (
          <div className="space-y-6">
            {systemMessages.offline_hours && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Offline Hours Auto-Reply</h2>
                <InputField label="Offline Message" path="system_messages.offline_hours.message"
                  value={(systemMessages.offline_hours as Record<string, string>).message || ''} placeholder="Enter offline hours message..." type="textarea" className="text-black"
                  editingKey={editingKey} editValue={editValue} saving={saving} previewKey={previewKey}
                  onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel} onEditValueChange={setEditValue} onPreviewToggle={setPreviewKey}
                  description="Use {name} placeholder for personalization" />
              </div>
            )}
            {systemMessages.consultation_notification && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Consultation Admin Notification</h2>
                <InputField label="Admin Notification Template" path="system_messages.consultation_notification.template"
                  value={(systemMessages.consultation_notification as Record<string, string>).template || ''} placeholder="Enter admin notification template..." type="textarea" className="text-black"
                  editingKey={editingKey} editValue={editValue} saving={saving} previewKey={previewKey}
                  onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel} onEditValueChange={setEditValue} onPreviewToggle={setPreviewKey} />
              </div>
            )}
            {systemMessages.button_text && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Button Texts (Max 20 chars)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(systemMessages.button_text as Record<string, string>).map(([key, value]) => (
                    <InputField key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} path={`system_messages.button_text.${key}`} value={value} placeholder={`Enter ${key}...`} className="text-black"
                      editingKey={editingKey} editValue={editValue} saving={saving} previewKey={previewKey}
                      onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel} onEditValueChange={setEditValue} onPreviewToggle={setPreviewKey} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Global Variables</h2>
            <div className="space-y-6">
              <InputField label="Ebook Link" path="ebook_link" value={config.ebook_link} placeholder="https://lynk.id/your-ebook-link" className="text-black"
                editingKey={editingKey} editValue={editValue} saving={saving} previewKey={previewKey}
                onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel} onEditValueChange={setEditValue} onPreviewToggle={setPreviewKey} />
              <InputField label="Bonus Link" path="bonus_link" value={config.bonus_link} placeholder="https://drive.google.com/your-bonus-link" className="text-black"
                editingKey={editingKey} editValue={editValue} saving={saving} previewKey={previewKey}
                onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel} onEditValueChange={setEditValue} onPreviewToggle={setPreviewKey} />
              <InputField label="Konsultan WhatsApp" path="konsultan_wa" value={config.konsultan_wa} placeholder="https://wa.me/628123456789" className="text-black"
                editingKey={editingKey} editValue={editValue} saving={saving} previewKey={previewKey}
                onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel} onEditValueChange={setEditValue} onPreviewToggle={setPreviewKey} />
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border-2 ${isCurrentlyWithinHours() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-semibold mb-1 ${isCurrentlyWithinHours() ? 'text-green-900' : 'text-red-900'}`}>
                    {isCurrentlyWithinHours() ? '✅ Bot Active' : '🔴 Outside Working Hours'}
                  </h3>
                  <p className={`text-sm ${isCurrentlyWithinHours() ? 'text-green-700' : 'text-red-700'}`}>Current time: {getCurrentTime()}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isCurrentlyWithinHours() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <div className={`w-3 h-3 rounded-full ${isCurrentlyWithinHours() ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">{isCurrentlyWithinHours() ? 'Accepting messages' : 'Auto-reply active'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuration</h2>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={whEnabled} onChange={(e) => setWhEnabled(e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                  <span className="ml-3 text-sm font-medium text-gray-900">Enable working hours restriction</span>
                </label>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select value={whTimezone} onChange={(e) => setWhTimezone(e.target.value)} disabled={!whEnabled} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black disabled:bg-gray-100">
                  {TIMEZONES.map(tz => (<option key={tz.value} value={tz.value}>{tz.label}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Hour</label>
                  <input type="number" min="0" max="23" value={whStartHour} onChange={(e) => setWhStartHour(parseInt(e.target.value))} disabled={!whEnabled} className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                  <p className="text-xs text-gray-500 mt-1">{String(whStartHour).padStart(2, '0')}:00</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Hour</label>
                  <input type="number" min="0" max="23" value={whEndHour} onChange={(e) => setWhEndHour(parseInt(e.target.value))} disabled={!whEnabled} className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                  <p className="text-xs text-gray-500 mt-1">{String(whEndHour).padStart(2, '0')}:00</p>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />Working Days
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button key={day.id} onClick={() => toggleDay(day.id)} disabled={!whEnabled}
                      className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors ${whSelectedDays.includes(day.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} ${!whEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <div className="font-bold">{day.shortName}</div>
                      <div className="text-xs mt-1">{day.name.substring(0, 3)}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Selected: {whSelectedDays.length} day{whSelectedDays.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📅 Summary</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Status:</strong> {whEnabled ? 'Enabled' : 'Disabled (24/7 mode)'}</li>
                  <li>• <strong>Hours:</strong> {String(whStartHour).padStart(2, '0')}:00 - {String(whEndHour).padStart(2, '0')}:00</li>
                  <li>• <strong>Duration:</strong> {whEndHour - whStartHour} hours per day</li>
                  <li>• <strong>Days:</strong> {whSelectedDays.map(d => DAYS_OF_WEEK[d].shortName).join(', ')}</li>
                  <li>• <strong>Timezone:</strong> {whTimezone}</li>
                </ul>
              </div>
              <button onClick={handleSaveWorkingHours} disabled={saving} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors">
                {saving ? (<><RefreshCw className="w-5 h-5 animate-spin" />Saving...</>) : (<><Save className="w-5 h-5" />Save Working Hours</>)}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-6">
            {Object.entries(config.errors).map(([key, value]) => (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 capitalize mb-4">{key.replace(/_/g, ' ')}</h2>
                <InputField label="Error Message" path={`errors.${key}`} value={value} placeholder="Enter error message..." type="textarea" className="text-black"
                  editingKey={editingKey} editValue={editValue} saving={saving} previewKey={previewKey}
                  onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel} onEditValueChange={setEditValue} onPreviewToggle={setPreviewKey} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Important Notes:</h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>All changes are saved to Firebase and applied immediately to the bot</li>
                <li>Use *bold*, _italic_ for WhatsApp formatting in messages</li>
                <li>Button texts have a 20-character limit imposed by WhatsApp</li>
                <li>Test all changes on a personal number before going live</li>
                <li>Working hours timezone must match your location</li>
                <li>Outside working hours, bot sends offline auto-reply message</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}