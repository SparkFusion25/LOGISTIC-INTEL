// Admin/service key for server-side route handlers ONLY
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Singleton admin client
export const supabaseAdmin = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});
