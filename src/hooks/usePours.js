import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function usePours(bottleId) {
  const { user } = useAuth();
  const [pours, setPours] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    let q = supabase.from('pours').select('*').eq('owner_id', user.id).order('poured_at', { ascending: false });
    if (bottleId) q = q.eq('bottle_id', bottleId);
    const { data } = await q;
    setPours(data ?? []);
    setLoading(false);
  }, [user, bottleId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const logPour = useCallback(
    async ({ bottle_id, oz = 1.5, note = null }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('pours')
        .insert({ owner_id: user.id, bottle_id, oz, note })
        .select()
        .single();
      if (error) throw error;
      setPours((prev) => [data, ...prev]);
      return data;
    },
    [user],
  );

  return { pours, loading, logPour, refresh: fetchAll };
}
