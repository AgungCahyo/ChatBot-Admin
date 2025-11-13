// src/types/auth.ts - NEW FILE
export type UserRole = 'admin' | 'editor' | 'viewer' | 'pending';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  approved: boolean;
  createdAt: Date;
  lastLogin?: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface RolePermissions {
  canViewDashboard: boolean;
  canViewUsers: boolean;
  canViewMessages: boolean;
  canViewAnalytics: boolean;
  canViewConsultations: boolean;
  canViewLogs: boolean;
  canSendBroadcast: boolean;
  canEditConfig: boolean;
  canManageUsers: boolean;
  canDeleteData: boolean;
}

// Role permissions matrix
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewDashboard: true,
    canViewUsers: true,
    canViewMessages: true,
    canViewAnalytics: true,
    canViewConsultations: true,
    canViewLogs: true,
    canSendBroadcast: true,
    canEditConfig: true,
    canManageUsers: true,
    canDeleteData: true,
  },
  editor: {
    canViewDashboard: true,
    canViewUsers: true,
    canViewMessages: true,
    canViewAnalytics: true,
    canViewConsultations: true,
    canViewLogs: false,
    canSendBroadcast: true,
    canEditConfig: false,
    canManageUsers: false,
    canDeleteData: false,
  },
  viewer: {
    canViewDashboard: true,
    canViewUsers: false,
    canViewMessages: true,
    canViewAnalytics: true,
    canViewConsultations: true,
    canViewLogs: false,
    canSendBroadcast: false,
    canEditConfig: false,
    canManageUsers: false,
    canDeleteData: false,
  },
  pending: {
    canViewDashboard: false,
    canViewUsers: false,
    canViewMessages: false,
    canViewAnalytics: false,
    canViewConsultations: false,
    canViewLogs: false,
    canSendBroadcast: false,
    canEditConfig: false,
    canManageUsers: false,
    canDeleteData: false,
  },
};