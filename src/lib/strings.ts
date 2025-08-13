export const s = (v: unknown): string =>
  typeof v === 'string' ? v : v == null ? '' : String(v)

export const upper = (v: unknown): string => s(v).toUpperCase()
export const lower = (v: unknown): string => s(v).toLowerCase()
export const trim  = (v: unknown): string => s(v).trim()
export const has   = (v: unknown): boolean => s(v).length > 0