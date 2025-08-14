// Browser client: use public anon key only
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton (do not export a function)
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);