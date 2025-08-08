import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Plan = 'trial'|'starter'|'pro'|'enterprise';
const ENTITLEMENTS: Record<Plan, any> = {
  trial:      { companies: 100,  modes: { ocean: true, air: false }, contacts: false, export: false },
  starter:    { companies: 1000, modes: { ocean: true, air: false }, contacts: false, export: true  },
  pro:        { companies: 10000,modes: { ocean: true, air: true  }, contacts: true,  export: true  },
  enterprise: { companies: Infinity, modes: { ocean: true, air: true }, contacts: true,  export: true }
};

export async function GET(){
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ success:false, error:'Not authenticated' }, { status: 401 });

  let plan: Plan = 'trial';
  try {
    const { data } = await s.rpc('get_user_plan', { p_uid: user.id });
    const p = (Array.isArray(data) ? data[0] : data) as string | null;
    if (p && ['trial','starter','pro','enterprise'].includes(p)) plan = p as Plan;
  } catch {}

  return NextResponse.json({ success:true, plan, entitlements: ENTITLEMENTS[plan] });
}