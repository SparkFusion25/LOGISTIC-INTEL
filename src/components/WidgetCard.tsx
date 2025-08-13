import React from 'react'

export default function WidgetCard({
  title, action, children
}:{ title:string; action?:React.ReactNode; children:React.ReactNode }) {
  return (
    <section className="card p-5">
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold text-brand-ink">{title}</h2>
        {action}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  )
}