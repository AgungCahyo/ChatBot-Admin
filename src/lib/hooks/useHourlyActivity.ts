// ============================================================================
// src/lib/hooks/useHourlyActivity.ts
// ============================================================================
import { HourlyActivity } from '@/types';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export function useHourlyActivity(date: string = new Date().toISOString().split('T')[0]) {
  const [hourlyData, setHourlyData] = useState<HourlyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHourly = async () => {
      try {
        const q = query(
          collection(db, 'messages'),
          where('date', '==', date)
        );

        const snapshot = await getDocs(q);
        const hourCounts = Array(24).fill(0);

        snapshot.docs.forEach(doc => {
          const hour = doc.data().hour;
          if (hour !== undefined) {
            hourCounts[hour]++;
          }
        });

        const chartData: HourlyActivity[] = hourCounts.map((count, hour) => ({
          hour: `${hour}:00`,
          messages: count
        }));

        setHourlyData(chartData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hourly activity:', error);
        setLoading(false);
      }
    };

    fetchHourly();
  }, [date]);

  return { hourlyData, loading };
}