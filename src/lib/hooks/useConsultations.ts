// ============================================================================
// src/lib/hooks/useConsultations.ts
// ============================================================================
import { Consultation } from '@/types';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';

export function useConsultations(status: string | null = null) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(
      collection(db, 'consultations'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    if (status) {
      q = query(
        collection(db, 'consultations'),
        where('status', '==', status),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const consultData: Consultation[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          from: data.from,
          message: data.message,
          timestamp: data.timestamp?.toDate(),
          date: data.date,
          status: data.status,
          notified: data.notified,
          notes: data.notes,
          followUpDate: data.followUpDate?.toDate()
        };
      });
      setConsultations(consultData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [status]);

  return { consultations, loading };
}