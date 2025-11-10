// ============================================================================
// src/lib/hooks/useMessages.ts
// ============================================================================
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Message } from '@/types';
import { useEffect, useState } from 'react';
import { db } from '../firebase';

export function useMessages(limitCount: number = 50) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          messageId: data.messageId,
          from: data.from,
          type: data.type,
          textBody: data.textBody,
          keyword: data.keyword,
          timestamp: data.timestamp?.toDate(),
          date: data.date,
          hour: data.hour,
          status: data.status
        };
      });
      setMessages(messagesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [limitCount]);

  return { messages, loading };
}
