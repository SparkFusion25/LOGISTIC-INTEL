export type FreightMode = 'ocean' | 'air'

export interface TierLimits {
  crmMaxContacts: number | null
  campaignMaxActive: number | null
  freight: {
    ocean: { enabled: boolean; maxCompanies: number | null; maxShipmentsPerCompany: number | null }
    air: { enabled: boolean; maxCompanies: number | null; maxShipmentsPerCompany: number | null }
  }
}

const TIERS: Record<string, TierLimits> = {
  starter: {
    crmMaxContacts: 50,
    campaignMaxActive: 1,
    freight: {
      ocean: { enabled: true, maxCompanies: 1000, maxShipmentsPerCompany: 50 },
      air: { enabled: false, maxCompanies: 0, maxShipmentsPerCompany: 0 }
    }
  },
  pro: {
    crmMaxContacts: 500,
    campaignMaxActive: 10,
    freight: {
      ocean: { enabled: true, maxCompanies: 10000, maxShipmentsPerCompany: 200 },
      air: { enabled: true, maxCompanies: 10000, maxShipmentsPerCompany: 200 }
    }
  },
  enterprise: {
    crmMaxContacts: null,
    campaignMaxActive: null,
    freight: {
      ocean: { enabled: true, maxCompanies: null, maxShipmentsPerCompany: null },
      air: { enabled: true, maxCompanies: null, maxShipmentsPerCompany: null }
    }
  }
}

export function normalizePlan(plan?: string): keyof typeof TIERS {
  if (!plan) return 'starter'
  const p = plan.toLowerCase()
  if (p === 'enterprise') return 'enterprise'
  if (p === 'pro') return 'pro'
  // treat anything else (free/user/trial) as starter
  return 'starter'
}

export function getTierLimits(plan?: string, isAdmin?: boolean): TierLimits {
  if (isAdmin) {
    return TIERS.enterprise
  }
  return TIERS[normalizePlan(plan)]
}

export function enforceFreightLimits<T extends { company_name: string; shipments?: any[] }>(
  mode: FreightMode,
  items: T[],
  limits: TierLimits
): { items: T[]; truncated: boolean } {
  const config = limits.freight[mode]
  if (!config.enabled) {
    return { items: [], truncated: false }
  }
  let truncated = false
  let limitedItems = items
  if (config.maxCompanies !== null && items.length > config.maxCompanies) {
    limitedItems = items.slice(0, config.maxCompanies)
    truncated = true
  }
  if (config.maxShipmentsPerCompany !== null) {
    limitedItems = limitedItems.map((it) => ({
      ...it,
      shipments: Array.isArray(it.shipments)
        ? it.shipments.slice(0, config.maxShipmentsPerCompany!)
        : it.shipments
    }))
  }
  return { items: limitedItems, truncated }
}