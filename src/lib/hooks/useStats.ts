// ============================================================================
// src/lib/hooks/useStats.ts
// ============================================================================
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { BotStats } from '@/types';

export function useStats() {
  const [stats, setStats] = useState<BotStats>({
    totalMessages: 0,
    totalUsers: 0,
    consultationRequests: 0,
    conversionRate: 0,
    activeNow: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const statsRef = doc(db, 'stats', 'global');
    
    const unsubscribe = onSnapshot(
      statsRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStats({
            totalMessages: data.totalMessages || 0,
            totalUsers: data.totalUsers || 0,
            consultationRequests: data.consultationRequests || 0,
            conversionRate: data.conversionRate || 0,
            activeNow: data.activeNow || 0,
            lastUpdated: data.lastUpdated?.toDate()
          });
        }
        setLoading(false);
      }, 
      (err) => {
        console.error('Error fetching stats:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { stats, loading, error };
}
