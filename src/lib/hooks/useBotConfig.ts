// ============================================================================
// src/lib/hooks/useBotConfig.ts - UPDATED VERSION
// ============================================================================
import { BotConfig } from '@/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';

export function useBotConfig() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const configRef = doc(db, 'bot_config', 'messages');
    
    const unsubscribe = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({
          ebook_link: data.ebook_link,
          bonus_link: data.bonus_link,
          konsultan_wa: data.konsultan_wa,
          funnel: data.funnel,
          errors: data.errors,
          system_messages: data.system_messages, // ✅ ADDED: Support for system_messages
          last_updated: data.last_updated?.toDate(),
          updated_by: data.updated_by
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { config, loading };
}