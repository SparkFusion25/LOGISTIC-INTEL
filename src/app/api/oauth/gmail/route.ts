import { NextResponse } from 'next/server';
export async function GET(){ return NextResponse.json({ success:false, error:'Gmail OAuth disabled in this build' }, { status:501 }); }
