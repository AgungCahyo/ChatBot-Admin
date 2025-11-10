import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // sesuaikan path-nya
import { KeywordStat } from '@/types';

export function useKeywordStats(days: number = 7) {
  const [keywordStats, setKeywordStats] = useState<KeywordStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Jika field "date" di Firestore disimpan sebagai string ISO (YYYY-MM-DD)
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];

        const q = query(
          collection(db, 'keyword_stats'),
          where('date', '>=', start),
          where('date', '<=', end)
        );

        const snapshot = await getDocs(q);
        const statsMap: Record<string, KeywordStat> = {};

        snapshot.docs.forEach((doc) => {
          const data = doc.data() as Partial<KeywordStat> & { date?: string; keyword?: string };

          if (!data.keyword) return; // skip kalau gak ada keyword
          if (!statsMap[data.keyword]) {
            statsMap[data.keyword] = { keyword: data.keyword, count: 0, conversions: 0 };
          }

          statsMap[data.keyword].count += data.count || 0;
          statsMap[data.keyword].conversions += data.conversions || 0;
        });

        const statsArray = Object.values(statsMap).sort((a, b) => b.count - a.count);

        if (isMounted) {
          setKeywordStats(statsArray);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching keyword stats:', error);
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [days]);

  return { keywordStats, loading };
}
