export const s = (v: unknown): string =>
  typeof v === 'string' ? v : v == null ? '' : String(v);

export const upper = (v: unknown) => s(v).toUpperCase();
export const lower = (v: unknown) => s(v).toLowerCase();
export const trim  = (v: unknown) => s(v).trim();
export const has   = (v: unknown) => s(v).length > 0;
