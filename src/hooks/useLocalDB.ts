import { useEffect } from 'react';
import { db } from '@/lib/db/index';
import { useAppStore } from '@/stores/appStore'; // Pour online status

export function useLocalDB() {
  const { isOnline } = useAppStore();

  useEffect(() => {
    // Initial pull si online (full impl in Step 9)
    if (isOnline) {
      // Fetch from Supabase, bulkPut in db
    }
  }, [isOnline]);

  return { db, isOnline };
}