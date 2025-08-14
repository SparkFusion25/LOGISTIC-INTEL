export default function TrendMini({ data }: { data: number[] }) {
  if (!data?.length) return <div className="text-xs text-slate-500">No trend data</div>
  const max = Math.max(...data)
  const min = Math.min(...data)
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = max === min ? 50 : 100 - ((d - min) / (max - min)) * 100
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-8">
      <polyline fill="none" stroke="#4F46E5" strokeWidth="2" points={points} />
    </svg>
  )
}