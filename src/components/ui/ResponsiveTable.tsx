'use client';

import React, { useEffect, useRef } from 'react';

type Column<T> =
  | { header: string; accessorKey: keyof T }
  | { header: string; accessorFn: (row: T) => React.ReactNode };

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  rowHeight?: number;
  loading?: boolean;
  fetchMore?: () => void;
  onRowClick?: (row: T) => void;
}

export default function ResponsiveTable<T>({
  columns,
  data,
  rowHeight = 48,
  loading,
  fetchMore,
  onRowClick,
}: Props<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !fetchMore) return;
    const el = ref.current;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - rowHeight * 2) {
        fetchMore();
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [fetchMore, rowHeight]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
        {columns.map((c, i) => (
          <div key={i}>{c.header}</div>
        ))}
      </div>
      <div ref={ref} className="flex-1 overflow-auto">
        {data.map((row, i) => (
          <button
            key={i}
            onClick={() => onRowClick?.(row)}
            className="grid grid-cols-4 gap-2 w-full text-left px-3"
            style={{ height: rowHeight }}
          >
            {columns.map((c, j) => {
              let content: React.ReactNode = null;
              if ('accessorKey' in c) content = String((row as any)[c.accessorKey] ?? '—');
              else content = c.accessorFn(row);
              return (
                <div key={j} className="border-b border-gray-100 py-2 text-sm text-gray-800">
                  {content}
                </div>
              );
            })}
          </button>
        ))}
        {loading && (
          <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>
        )}
        {!loading && data.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-500">No data</div>
        )}
      </div>
    </div>
  );
}
