// Admin/service key for server-side route handlers ONLY
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!supabaseUrl || !serviceRole) {
		return null;
	}
	if (!cachedAdmin) {
		cachedAdmin = createClient(supabaseUrl, serviceRole, {
			auth: { persistSession: false, autoRefreshToken: false },
		});
	}
	return cachedAdmin;
}

export const supabaseAdmin = getSupabaseAdmin();
