import { createClient } from '@supabase/supabase-js';
export function getSupabaseAdmin(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession:false } });
}