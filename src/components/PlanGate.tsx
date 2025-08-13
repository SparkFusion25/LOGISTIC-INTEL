export default function PlanGate({
  canView, children
}: { canView: boolean; children: React.ReactNode }) {
  if (canView) return <>{children}</>
  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
      <p className="text-sm text-slate-600">
        Upgrade your plan to unlock this information.
      </p>
    </div>
  )
}