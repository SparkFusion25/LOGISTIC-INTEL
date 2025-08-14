<<<<<<< HEAD
import { getSupabaseAdmin } from '@/lib/supabase-admin';
const BUCKET='public-assets';
export async function ensureBuckets(){
  const admin = getSupabaseAdmin();
  try{ await admin.storage.createBucket(BUCKET, { public:true }); }catch{}
}
export async function signUploadPath(userId:string, path:string){
  await ensureBuckets();
  return { bucket: BUCKET, path };
}
export async function putPublicAsset(path:string, file:Blob|ArrayBuffer){
  const admin = getSupabaseAdmin();
  await admin.storage.from(BUCKET).upload(path, file, { upsert:true, contentType: 'application/octet-stream' });
}
=======
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
>>>>>>> 70f81f782cf80172b2dcced3792e70f4b6a1c5ac
