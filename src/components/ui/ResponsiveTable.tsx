'use client'

import React, { useEffect, useRef } from 'react'

interface Column<T> {
  header: string
  accessorKey?: keyof T
  accessorFn?: (row: T) => React.ReactNode
  cell?: (ctx: { row: T }) => React.ReactNode
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  fetchMore?: () => void
  loading?: boolean
  rowHeight?: number
  onRowClick?: (row: T) => void
}

export default function ResponsiveTable<T extends Record<string, any>>({ columns, data, fetchMore, loading, rowHeight = 56, onRowClick }: Props<T>) {
  const sentinel = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!fetchMore || !sentinel.current) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) fetchMore()
      })
    })
    io.observe(sentinel.current)
    return () => io.disconnect()
  }, [fetchMore])

  return (
    <div className="h-full flex flex-col">
      <div className="bg-surface px-4 py-2 border-b border-gray-200 text-sm font-semibold text-onSurface">
        Results
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="text-left px-4 py-2 font-medium text-gray-600 border-b">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
              {data.map((row, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-gray-50" style={{ height: rowHeight, cursor: onRowClick ? 'pointer' : undefined }}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-2">
                    {col.cell ? col.cell({ row }) : col.accessorFn ? col.accessorFn(row) : (row[col.accessorKey as string] as any)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {fetchMore && (
          <div ref={sentinel} className="w-full h-8" />
        )}
        {loading && (
          <div className="p-3 text-center text-gray-500 text-xs">Loading…</div>
        )}
      </div>
    </div>
  )
}