/* eslint-disable @typescript-eslint/no-explicit-any */
// src/contexts/AuthContext.tsx - UPDATED WITH RBAC
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { UserProfile, ROLE_PERMISSIONS, RolePermissions } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  permissions: RolePermissions | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  isAdmin: () => boolean;
  isApproved: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  permissions: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  hasPermission: () => false,
  isAdmin: () => false,
  isApproved: () => false,
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'user_profiles', uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const profile: UserProfile = {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          role: data.role || 'pending',
          approved: data.approved || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          approvedBy: data.approvedBy,
          approvedAt: data.approvedAt?.toDate(),
        };
        
        setUserProfile(profile);
        setPermissions(ROLE_PERMISSIONS[profile.role]);
        
        // Update last login
        await updateDoc(doc(db, 'user_profiles', uid), {
          lastLogin: serverTimestamp()
        });
      } else {
        // Profile doesn't exist, might be old user
        setUserProfile(null);
        setPermissions(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      setPermissions(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
        setPermissions(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      
      // Fetch profile to check approval status
      await fetchUserProfile(userCredential.user.uid);
      
      router.push('/');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to login');
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      // Create user profile in Firestore with 'pending' role
      await setDoc(doc(db, 'user_profiles', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        role: 'pending', // Default: pending approval
        approved: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
      
      setUser(userCredential.user);
      await fetchUserProfile(userCredential.user.uid);
      
      router.push('/pending-approval');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setPermissions(null);
      router.push('/login');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to logout');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  };

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    if (!permissions) return false;
    return permissions[permission];
  };

  const isAdmin = (): boolean => {
    return userProfile?.role === 'admin' && userProfile?.approved === true;
  };

  const isApproved = (): boolean => {
    return userProfile?.approved === true;
  };

  const value = {
    user,
    userProfile,
    permissions,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    hasPermission,
    isAdmin,
    isApproved,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}