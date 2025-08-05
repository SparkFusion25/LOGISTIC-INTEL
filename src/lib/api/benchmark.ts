// fetchBenchmarkData - server API wrapper
export async function fetchBenchmarkData({ origin, destination, hsCode, mode, timeRange }: {
  origin: string;
  destination: string;
  hsCode: string;
  mode: string;
  timeRange: string;
}) {
  const res = await fetch(`/api/benchmark?origin=${origin}&destination=${destination}&hs=${hsCode}&mode=${mode}&range=${timeRange}`);
  if (!res.ok) throw new Error('Failed to fetch benchmark data');
  return await res.json();
}