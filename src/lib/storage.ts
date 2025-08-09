import { supabaseAdmin } from '@/lib/supabase-admin';
const BUCKET='public-assets';
export async function ensureBuckets(){
  try{ await supabaseAdmin.storage.createBucket(BUCKET, { public:true }); }catch{}
}
export async function signUploadPath(userId:string, path:string){
  await ensureBuckets();
  return { bucket: BUCKET, path };
}