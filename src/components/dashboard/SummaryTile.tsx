// SummaryTile.tsx
import React from 'react';

type SummaryTileProps = {
  title: string;
  value: string | number;
};

export default function SummaryTile({ title, value }: SummaryTileProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 border border-gray-100 hover:shadow-md transition">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-blue-600">{value}</h3>
    </div>
  );
}