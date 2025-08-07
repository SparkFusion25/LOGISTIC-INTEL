'use client'

import { ExternalLink, Package, Truck, MapPin, Calendar } from 'lucide-react'

interface ShipmentDetail {
  bol_number: string | null;
  arrival_date: string;
  containers: string | null;
  vessel_name: string | null;
  weight_kg: number;
  value_usd: number;
  shipper_name: string | null;
  port_of_lading: string | null;
  port_of_discharge: string | null;
  goods_description: string | null;
  departure_date: string | null;
  hs_code: string | null;
  unified_id: string;
}

interface ShipmentDetailTableProps {
  shipments: ShipmentDetail[];
}

export const ShipmentDetailTable = ({ shipments }: ShipmentDetailTableProps) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatWeight = (weight: number) => {
    if (weight === 0) return 'N/A'
    if (weight >= 1000) return `${(weight / 1000).toFixed(1)}T`
    return `${weight}kg`
  }

  const formatValue = (value: number) => {
    if (value === 0) return 'N/A'
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value}`
  }

  const getRouteDisplay = (loading: string | null, discharge: string | null) => {
    if (!loading && !discharge) return 'N/A'
    if (!loading) return `→ ${discharge}`
    if (!discharge) return `${loading} →`
    return `${loading} → ${discharge}`
  }

  if (shipments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No shipment details available</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700 min-w-[120px]">
              BOL Number
            </th>
            <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700 min-w-[100px]">
              Arrival Date
            </th>
            <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700 min-w-[100px]">
              Containers
            </th>
            <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700 min-w-[150px]">
              Vessel/Carrier
            </th>
            <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700 min-w-[80px]">
              Weight
            </th>
            <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700 min-w-[80px]">
              Value
            </th>
            <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700 min-w-[120px]">
              Shipper
            </th>
            <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700 min-w-[200px]">
              Origin → Destination
            </th>
            <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-700 min-w-[150px]">
              Goods Description
            </th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((shipment, index) => (
            <tr 
              key={shipment.unified_id || index} 
              className="hover:bg-gray-50 transition-colors"
            >
              {/* BOL Number */}
              <td className="p-3 border-b border-gray-100">
                {shipment.bol_number ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900">
                      {shipment.bol_number}
                    </span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">N/A</span>
                )}
              </td>

              {/* Arrival Date */}
              <td className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {formatDate(shipment.arrival_date)}
                  </span>
                </div>
              </td>

              {/* Containers */}
              <td className="p-3 border-b border-gray-100">
                {shipment.containers ? (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {shipment.containers}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">N/A</span>
                )}
              </td>

              {/* Vessel/Carrier */}
              <td className="p-3 border-b border-gray-100">
                {shipment.vessel_name ? (
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 truncate" title={shipment.vessel_name}>
                      {shipment.vessel_name}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">N/A</span>
                )}
              </td>

              {/* Weight */}
              <td className="p-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-900">
                  {formatWeight(shipment.weight_kg)}
                </span>
              </td>

              {/* Value */}
              <td className="p-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-900">
                  {formatValue(shipment.value_usd)}
                </span>
              </td>

              {/* Shipper */}
              <td className="p-3 border-b border-gray-100">
                {shipment.shipper_name ? (
                  <span className="text-sm text-gray-900 truncate" title={shipment.shipper_name}>
                    {shipment.shipper_name}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">N/A</span>
                )}
              </td>

              {/* Route */}
              <td className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {getRouteDisplay(shipment.port_of_lading, shipment.port_of_discharge)}
                  </span>
                </div>
              </td>

              {/* Goods Description */}
              <td className="p-3 border-b border-gray-100">
                {shipment.goods_description ? (
                  <div>
                    <span className="text-sm text-gray-900 truncate block" title={shipment.goods_description}>
                      {shipment.goods_description}
                    </span>
                    {shipment.hs_code && (
                      <span className="text-xs text-gray-500 font-mono">
                        HS: {shipment.hs_code}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Footer */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total shipments: <strong>{shipments.length}</strong></span>
          <span>
            Total weight: <strong>{formatWeight(shipments.reduce((sum, s) => sum + s.weight_kg, 0))}</strong>
          </span>
          <span>
            Total value: <strong>{formatValue(shipments.reduce((sum, s) => sum + s.value_usd, 0))}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}