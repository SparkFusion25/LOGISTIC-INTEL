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