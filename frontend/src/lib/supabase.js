import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,       // keep the user logged in across refreshes
    autoRefreshToken: true,     // refresh the JWT before it expires
    detectSessionInUrl: true,   // handle the email-confirmation / OAuth callback
  },
});