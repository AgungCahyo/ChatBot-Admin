'use client';

import { useState, useEffect } from 'react';

export default function LastUpdated() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // setTimeout untuk delay sedikit bisa hilangkan warning Strict Mode
    const id = setTimeout(() => {
      setLastUpdated(new Date().toLocaleString('id-ID'));
    }, 0);

    return () => clearTimeout(id);
  }, []);

  if (!lastUpdated) return null;

  return <p className="text-xs text-gray-500">Last updated: {lastUpdated}</p>;
}
