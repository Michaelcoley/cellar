import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useBottles() {
  const { user } = useAuth();
  const [bottles, setBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setBottles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('bottles')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    if (error) setError(error);
    setBottles(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Realtime: keep local cache in sync across devices.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`bottles-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bottles', filter: `owner_id=eq.${user.id}` },
        (payload) => {
          setBottles((prev) => {
            if (payload.eventType === 'INSERT') {
              if (prev.some((b) => b.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((b) => (b.id === payload.new.id ? payload.new : b));
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((b) => b.id !== payload.old.id);
            }
            return prev;
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addBottle = useCallback(
    async (bottle) => {
      if (!user) throw new Error('Not authenticated');
      const insert = { ...bottle, owner_id: user.id };
      const { data, error } = await supabase.from('bottles').insert(insert).select().single();
      if (error) throw error;
      // Optimistic — realtime will dedupe.
      setBottles((prev) => (prev.some((b) => b.id === data.id) ? prev : [data, ...prev]));
      return data;
    },
    [user],
  );

  const updateBottle = useCallback(async (id, patch) => {
    const { data, error } = await supabase.from('bottles').update(patch).eq('id', id).select().single();
    if (error) throw error;
    setBottles((prev) => prev.map((b) => (b.id === id ? data : b)));
    return data;
  }, []);

  const deleteBottle = useCallback(async (id) => {
    const { error } = await supabase.from('bottles').delete().eq('id', id);
    if (error) throw error;
    setBottles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { bottles, loading, error, addBottle, updateBottle, deleteBottle, refresh: fetchAll };
}
