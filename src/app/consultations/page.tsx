'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Phone, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, Filter } from 'lucide-react';
import { useConsultations } from '@/lib/hooks/useConsultations';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function ConsultationsPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { consultations, loading } = useConsultations(statusFilter);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const consultRef = doc(db, 'consultations', id);
      await updateDoc(consultRef, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const stats = {
    pending: consultations.filter(c => c.status === 'pending').length,
    contacted: consultations.filter(c => c.status === 'contacted').length,
    won: consultations.filter(c => c.status === 'won').length,
    total: consultations.length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'contacted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'won': return 'bg-green-100 text-green-700 border-green-200';
      case 'lost': return 'bg-red-100 text-red-700 border-red-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'contacted': return <Phone className="w-4 h-4" />;
      case 'won': return <CheckCircle className="w-4 h-4" />;
      case 'lost': return <XCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Consultations</h1>
          <p className="text-gray-500 mt-1">Manage and track consultation requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
              </div>
              <Phone className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Won</p>
                <p className="text-2xl font-bold text-green-600">{stats.won}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Phone className="w-10 h-10 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <div className="flex gap-2 flex-wrap">
              {['All', 'Pending', 'Contacted', 'Won', 'Lost', 'Closed'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status === 'All' ? null : status.toLowerCase())}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    (status === 'All' && statusFilter === null) || 
                    (status.toLowerCase() === statusFilter)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Consultations List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : consultations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No consultations found</p>
            </div>
          ) : (
            consultations.map((consultation) => (
              <div 
                key={consultation.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-mono font-semibold text-gray-900">
                        {consultation.from}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(consultation.status)}`}>
                        {getStatusIcon(consultation.status)}
                        {consultation.status}
                      </span>
                      {consultation.notified && (
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                          Admin Notified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{consultation.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {consultation.timestamp ? new Date(consultation.timestamp).toLocaleString('id-ID') : '-'}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span>{new Date(consultation.date).toLocaleDateString('id-ID', { 
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${consultation.from}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Chat on WhatsApp
                  </a>
                </div>

                {/* Status Update Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Update status:</span>
                  {['pending', 'contacted', 'won', 'lost', 'closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(consultation.id, status)}
                      disabled={updating === consultation.id || consultation.status === status}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                        consultation.status === status
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}