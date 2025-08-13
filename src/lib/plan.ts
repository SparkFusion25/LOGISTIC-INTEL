// Simple plan checker; upgrade later to read org/plan from DB/session
export type Plan = 'free' | 'pro' | 'enterprise'

export function getPlanForRequest(_req?: Request): Plan {
  // TODO: Replace with real plan lookup (e.g., from JWT/org table)
  // Optional dev override: header X-Demo-Plan
  // @ts-ignore
  const hdr = typeof _req?.headers?.get === 'function' ? _req.headers.get('x-demo-plan') : null
  if (hdr === 'pro' || hdr === 'enterprise') return hdr
  return 'free'
}

export function canViewContacts(plan: Plan) {
  return plan === 'pro' || plan === 'enterprise'
}