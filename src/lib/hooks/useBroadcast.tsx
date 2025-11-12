// src/lib/hooks/useBroadcast.ts
import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { BroadcastMessage, BroadcastResult } from '@/types';

export function useBroadcast() {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch broadcast history
  useEffect(() => {
    const q = query(
      collection(db, 'broadcasts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const broadcastsData: BroadcastMessage[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          message: data.message,
          targetAudience: data.targetAudience,
          customUserIds: data.customUserIds,
          scheduledAt: data.scheduledAt?.toDate(),
          sentAt: data.sentAt?.toDate(),
          status: data.status,
          totalRecipients: data.totalRecipients,
          sentCount: data.sentCount,
          failedCount: data.failedCount,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate()
        };
      });
      setBroadcasts(broadcastsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Send broadcast
  const sendBroadcast = async (
    message: string,
    userIds: string[]
  ): Promise<BroadcastResult> => {
    setSending(true);
    try {
      // Save to Firebase first
      const broadcastRef = await addDoc(collection(db, 'broadcasts'), {
        message,
        targetAudience: 'custom',
        customUserIds: userIds,
        status: 'sending',
        totalRecipients: userIds.length,
        sentCount: 0,
        failedCount: 0,
        createdBy: 'admin-dashboard',
        createdAt: serverTimestamp()
      });

      // Send via API
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, userIds })
      });

      if (!response.ok) {
        throw new Error('Failed to send broadcast');
      }

      const result: BroadcastResult = await response.json();

      // Update broadcast record
      await import('firebase/firestore').then(({ updateDoc, doc }) => {
        updateDoc(doc(db, 'broadcasts', broadcastRef.id), {
          status: result.failed > 0 ? 'failed' : 'sent',
          sentCount: result.success,
          failedCount: result.failed,
          sentAt: serverTimestamp()
        });
      });

      return result;
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  return { broadcasts, loading, sending, sendBroadcast };
}