import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic='force-dynamic';

// Use service key to bypass RLS for unauth inserts OR rely on public-insert policy we set
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const GIF = Buffer.from('R0lGODlhAQABAPAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');

export async function GET(req: Request){
  try{
    const { searchParams } = new URL(req.url);
    const code = (searchParams.get('code')||'').toLowerCase();
    if(code){
      const { data:link } = await supabase.from('affiliate_links').select('id').eq('code', code).maybeSingle();
      if(link?.id){
        await supabase.from('affiliate_clicks').insert({ link_id: link.id, user_agent: req.headers.get('user-agent')||null, referer: req.headers.get('referer')||null });
      }
    }
  }catch{}
  return new NextResponse(GIF, { status:200, headers: { 'Content-Type':'image/gif', 'Cache-Control':'no-store' } });
}