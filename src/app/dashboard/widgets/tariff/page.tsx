'use client';

import dynamic from 'next/dynamic';

// Dynamically import the TariffCalculator component
const TariffCalculator = dynamic(() => import('@/components/widgets/TariffCalculator'), {
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
    </div>
  ),
  ssr: false
});

export default function TariffCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <TariffCalculator />
      </div>
    </div>
  );
}