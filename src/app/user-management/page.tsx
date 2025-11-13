// src/app/user-management/page.tsx - NEW FILE
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, UserRole } from '@/types/auth';

export default function UserManagementPage() {
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  // Check permission
  if (!hasPermission('canManageUsers')) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-500">You dont have permission to manage users</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'user_profiles'));
      const usersData: UserProfile[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          approved: data.approved,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          approvedBy: data.approvedBy,
          approvedAt: data.approvedAt?.toDate(),
        };
      });
      setUsers(usersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (uid: string, role: UserRole) => {
    if (!confirm(`Change user role to ${role}?`)) return;
    
    setUpdating(uid);
    try {
      await updateDoc(doc(db, 'user_profiles', uid), {
        role: role,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid
      });
      
      await fetchUsers();
      alert('User role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  const approveUser = async (uid: string) => {
    if (!confirm('Approve this user?')) return;
    
    setUpdating(uid);
    try {
      await updateDoc(doc(db, 'user_profiles', uid), {
        approved: true,
        role: 'viewer', // Default to viewer on approval
        approvedBy: user?.uid,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      await fetchUsers();
      alert('User approved successfully');
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    } finally {
      setUpdating(null);
    }
  };

  const rejectUser = async (uid: string) => {
    if (!confirm('Reject this user? This will delete their account.')) return;
    
    setUpdating(uid);
    try {
      await deleteDoc(doc(db, 'user_profiles', uid));
      await fetchUsers();
      alert('User rejected and deleted');
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'editor': return 'bg-blue-100 text-blue-700';
      case 'viewer': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    total: users.length,
    pending: users.filter(u => !u.approved).length,
    admins: users.filter(u => u.role === 'admin').length,
    approved: users.filter(u => u.approved).length,
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            User Management
          </h1>
          <p className="text-gray-500 mt-1">Manage user access and permissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
              </div>
              <Shield className="w-10 h-10 text-red-500" />
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Last Login</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.uid} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {userItem.displayName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {userItem.email}
                      </td>
                      <td className="py-3 px-4">
                        {updating === userItem.uid ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-gray-500">Updating...</span>
                          </div>
                        ) : (
                          <select
                            value={userItem.role}
                            onChange={(e) => updateUserRole(userItem.uid, e.target.value as UserRole)}
                            disabled={userItem.uid === user?.uid}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userItem.role)} border-0 focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                            <option value="pending">Pending</option>
                          </select>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {userItem.approved ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Approved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-600 text-sm">
                            <Clock className="w-4 h-4" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {userItem.createdAt.toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {userItem.lastLogin 
                          ? userItem.lastLogin.toLocaleDateString('id-ID')
                          : '-'
                        }
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {!userItem.approved && (
                            <>
                              <button
                                onClick={() => approveUser(userItem.uid)}
                                disabled={updating === userItem.uid}
                                className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => rejectUser(userItem.uid)}
                                disabled={updating === userItem.uid}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title="Reject & Delete"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">User Role Permissions</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Admin:</strong> Full access to all features</li>
                <li>• <strong>Editor:</strong> Can view and send broadcasts, but cant edit config</li>
                <li>• <strong>Viewer:</strong> Read-only access to dashboard and analytics</li>
                <li>• <strong>Pending:</strong> No access until approved</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}