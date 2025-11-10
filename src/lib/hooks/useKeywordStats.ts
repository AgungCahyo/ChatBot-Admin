
// ============================================================================
// src/lib/hooks/useKeywordStats.ts
// ============================================================================
import { where, getDocs, collection, query } from 'firebase/firestore';
import { KeywordStat } from '@/types';
import { useEffect, useState } from 'react';
import { db } from '../firebase';

interface KeywordStatsMap {
  [key: string]: {
    keyword: string;
    count: number;
    conversions: number;
  };
}

export function useKeywordStats(days: number = 7) {
  const [keywordStats, setKeywordStats] = useState<KeywordStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const q = query(
          collection(db, 'keyword_stats'),
          where('date', '>=', startDate.toISOString().split('T')[0]),
          where('date', '<=', endDate.toISOString().split('T')[0])
        );

        const snapshot = await getDocs(q);
        const statsMap: KeywordStatsMap = {};

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!statsMap[data.keyword]) {
            statsMap[data.keyword] = { 
              keyword: data.keyword, 
              count: 0, 
              conversions: 0 
            };
          }
          statsMap[data.keyword].count += data.count || 0;
          statsMap[data.keyword].conversions += data.conversions || 0;
        });

        const statsArray = Object.values(statsMap).map(stat => ({
          ...stat,
          date: endDate.toISOString().split('T')[0]
        }));
        
        setKeywordStats(statsArray);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching keyword stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [days]);

  return { keywordStats, loading };
}
