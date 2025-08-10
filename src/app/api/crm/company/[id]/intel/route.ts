// src/app/api/crm/company/[id]/intel/route.ts
import type { NextRequest } from 'next/server';
import { GET as PremiumGET } from '@/app/api/company/[id]/intel/premium/route';

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  return PremiumGET(req, ctx);
}
