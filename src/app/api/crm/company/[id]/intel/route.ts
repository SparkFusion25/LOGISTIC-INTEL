// Always-premium view for companies that are in CRM.
// We reuse the existing premium route handler to keep behavior consistent.
import type { NextRequest } from 'next/server';
import { GET as PremiumGET } from '../../../../../company/[id]/intel/premium/route';

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  // If the company is in CRM, your premium route already returns 200.
  // Reuse it so we don’t duplicate logic.
  return PremiumGET(req, { params: ctx.params });
}
