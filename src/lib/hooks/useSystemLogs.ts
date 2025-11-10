// src/lib/hooks/useSystemLogs.ts
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'DEBUG';
  message: string;
  data: string | null;
  metadata: Record<string, unknown>;
  timestamp: Date;
  date: string;
  hour: number;
  environment: string;
}

interface UseSystemLogsOptions {
  limitCount?: number;
  level?: string | null;
  realtime?: boolean;
}

export function useSystemLogs(options: UseSystemLogsOptions = {}) {
  const { limitCount = 100, level = null, realtime = true } = options;
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      let q = query(
        collection(db, 'system_logs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      if (level) {
        q = query(
          collection(db, 'system_logs'),
          where('level', '==', level),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      }

      if (!realtime) {
        // One-time fetch
        import('firebase/firestore').then(({ getDocs }) => {
          getDocs(q).then(snapshot => {
            const logsData: SystemLog[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                level: data.level,
                message: data.message,
                data: data.data,
                metadata: data.metadata || {},
                timestamp: data.timestamp?.toDate() || new Date(),
                date: data.date,
                hour: data.hour,
                environment: data.environment
              };
            });
            setLogs(logsData);
            setLoading(false);
          }).catch((err: unknown) => {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage);
            setLoading(false);
          });
        });
        return;
      }

      // Real-time subscription
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const logsData: SystemLog[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              level: data.level,
              message: data.message,
              data: data.data,
              metadata: data.metadata || {},
              timestamp: data.timestamp?.toDate() || new Date(),
              date: data.date,
              hour: data.hour,
              environment: data.environment
            };
          });
          setLogs(logsData);
          setLoading(false);
        },
        (err: unknown) => {
          console.error('Error fetching logs:', err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          setError(errorMessage);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setLoading(false);
    }
  }, [limitCount, level, realtime]);

  return { logs, loading, error };
}
