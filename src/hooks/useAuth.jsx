import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthCtx = createContext({ user: null, session: null, loading: true });

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Always send Supabase the full app URL — including the subpath — so it
  // can't strip the path back to the origin (which it does when only Site URL
  // is configured).
  const redirectTo =
    typeof window !== 'undefined' ? window.location.origin + import.meta.env.BASE_URL : undefined;

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signInWithPassword: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) =>
      supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } }),
    signInWithMagicLink: (email) =>
      supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } }),
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
