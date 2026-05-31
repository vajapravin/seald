import * as React from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Get any existing session on load (survives refresh)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // React to sign-in, sign-out, token refresh, and the confirmation callback
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = React.useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut: () => supabase.auth.signOut(),
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}