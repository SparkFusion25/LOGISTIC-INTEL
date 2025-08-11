export const runtime='nodejs';
export const dynamic='force-dynamic';
export const revalidate=0;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GIF = Buffer.from('R0lGODlhAQABAPAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');

export async function GET(req: Request){
  try{
    const { searchParams } = new URL(req.url);
    const code = (searchParams.get('code')||'').toLowerCase();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if(code && url && key){
      const db = createClient(url, key, { auth: { persistSession:false } });
      const { data:link } = await db.from('affiliate_links').select('id').eq('code', code).maybeSingle();
      if(link?.id){
        await db.from('affiliate_clicks').insert({ link_id: link.id, user_agent: req.headers.get('user-agent')||null, referer: req.headers.get('referer')||null });
      }
    }
  }catch{}
  return new NextResponse(GIF, { status:200, headers: { 'Content-Type':'image/gif', 'Cache-Control':'no-store' } });
}