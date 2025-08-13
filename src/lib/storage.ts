import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function getSupabaseAdmin() {
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .storage.from('assets')
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
