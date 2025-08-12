import { lower, s, has } from './strings';

export function highlightCI(text: unknown, query: unknown) {
  const t = s(text);
  const q = s(query);
  if (!has(t) || !has(q)) return t;

  const i = lower(t).indexOf(lower(q));
  if (i === -1) return t;

  const before = t.slice(0, i);
  const match  = t.slice(i, i + q.length);
  const after  = t.slice(i + q.length);
  return <>{before}<mark>{match}</mark>{after}</>;
}
