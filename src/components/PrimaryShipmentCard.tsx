'use client';

import React from 'react';
import type { ShipmentRow } from './SearchPanel';

export default function PrimaryShipmentCard({ shipment }: { shipment: ShipmentRow }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">Company</div>
          <div className="text-lg font-semibold">{shipment.unified_company_name}</div>
        </div>
        <div className="text-sm px-2 py-1 rounded bg-gray-100">{shipment.mode.toUpperCase()}</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-gray-500">Destination</div>
          <div className="font-medium">{shipment.unified_destination ?? '—'}</div>
        </div>
        <div>
          <div className="text-gray-500">Date</div>
          <div className="font-medium">{shipment.unified_date ?? '—'}</div>
        </div>
        <div>
          <div className="text-gray-500">Carrier</div>
          <div className="font-medium">{shipment.unified_carrier ?? '—'}</div>
        </div>
        <div>
          <div className="text-gray-500">HS Code</div>
          <div className="font-medium">{shipment.hs_code ?? '—'}</div>
        </div>
      </div>
    </div>
  );
}
