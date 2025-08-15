import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function getSupabaseAdmin() {
	return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
}

const PUBLIC_BUCKET = 'public-assets';

export async function ensureBuckets() {
	const admin = getSupabaseAdmin();
	try {
		await admin.storage.createBucket(PUBLIC_BUCKET, { public: true });
	} catch {}
}

export async function signUploadPath(userId: string, path: string) {
	await ensureBuckets();
	return { bucket: PUBLIC_BUCKET, path };
}

export async function putPublicAsset(path: string, file: Blob | ArrayBuffer) {
	const admin = getSupabaseAdmin();
	await admin.storage.from(PUBLIC_BUCKET).upload(path, file as any, { upsert: true, contentType: 'application/octet-stream' });
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
	const supabase = getSupabaseAdmin();
	const { data, error } = await supabase.storage.from(PUBLIC_BUCKET).createSignedUrl(path, expiresIn);
	if (error) throw error;
	return data.signedUrl;
}
