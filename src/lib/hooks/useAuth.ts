'use client';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserData } from '@/lib/firebase/auth';
import { useAuthStore } from '@/lib/store';
import { User } from '@/types';

export function useAuthProvider() {
  const { setUserData, setLoading, setInitialized, reset } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser.uid);
          if (userData) {
            setUserData(userData as User);
          } else {
            // User authenticated but no Firestore doc yet - create minimal user data
            setUserData({
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email || '',
              role: 'admin',
              companyId: firebaseUser.uid,
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
            } as unknown as User);
          }
        } catch (err) {
          console.error('Error loading user data:', err);
          // Even if Firestore fails, keep user logged in with basic info
          setUserData({
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email || '',
            role: 'admin',
            companyId: firebaseUser.uid,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          } as unknown as User);
        }
      } else {
        reset();
      }
      setLoading(false);
      setInitialized(true);
    });
    return unsubscribe;
  }, []);
}

export function useAuth() {
  const { userData, loading, initialized } = useAuthStore();
  return {
    user: userData,
    loading,
    initialized,
    isAuthenticated: !!userData,
    companyId: userData?.companyId,
    role: userData?.role,
    isAdmin: userData?.role === 'admin',
    isManager: userData?.role === 'manager' || userData?.role === 'admin',
    canAccessFinance: userData?.role === 'admin' || userData?.role === 'finance' || userData?.role === 'manager',
  };
}
