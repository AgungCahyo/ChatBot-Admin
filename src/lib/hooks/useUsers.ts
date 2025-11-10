// ============================================================================
// src/lib/hooks/useUsers.ts
// ============================================================================
import { User } from '@/types';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';

export function useUsers(limitCount: number = 100) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('lastSeen', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: User[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          firstSeen: data.firstSeen?.toDate(),
          lastSeen: data.lastSeen?.toDate(),
          name: data.name,
          messageCount: data.messageCount,
          conversationCount: data.conversationCount,
          lastKeyword: data.lastKeyword,
          tags: data.tags || [],
          status: data.status
        };
      });
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [limitCount]);

  return { users, loading };
}
