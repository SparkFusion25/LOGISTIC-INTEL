export type BenchmarkReq = {
  origin_country: string;
  destination_country: string;
  hs_code?: string;
  mode?: 'air' | 'ocean' | 'all';
  from?: string; // ISO
  to?: string;   // ISO
};

export async function postBenchmark(body: BenchmarkReq) {
  const res = await fetch('/api/widgets/benchmark', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Benchmark request failed');
  return res.json();
}
