'use client';

import React from 'react';
import type { ShipmentRow } from './SearchPanel';

type Props = {
  shipments: ShipmentRow[];
  filterType: 'all' | 'ocean' | 'air';
  searchQuery: string;
  onSelect?: (row: ShipmentRow) => void;
  isLoading?: boolean;
};

/**
 * Build-friendly map stub.
 * No mapbox-gl (avoids types/css on Vercel). Keeps the props identical.
 */
export default function InteractiveShipmentMap({
  shipments,
  filterType,
  searchQuery,
  onSelect,
  isLoading
}: Props) {
  const shown = shipments.length;
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="absolute inset-0 grid place-items-center pointer-events-none select-none">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-gray-500">Search Intelligence</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {isLoading ? 'Loading shipments…' : `${shown} results`}
          </div>
          {searchQuery ? (
            <div className="mt-1 text-sm text-gray-600">Query: {searchQuery}</div>
          ) : null}
          <div className="mt-1 text-sm text-gray-600">Mode: {filterType}</div>
          <div className="mt-4 text-xs text-gray-500">
            Map preview placeholder. Live map will render in the app.
          </div>
        </div>
      </div>

      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
        {shipments.slice(0, 24).map((s, i) => (
          <button
            key={s.id ?? i}
            className="border border-transparent hover:border-gray-200/70 transition"
            onClick={() => onSelect?.(s)}
            title={s.unified_company_name}
          />
        ))}
      </div>
    </div>
  );
}
