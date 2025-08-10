import { NextResponse } from 'next/server';
export async function POST(){ return NextResponse.json({ success:false, error:'Email service disabled in this build' }, { status:501 }); }
