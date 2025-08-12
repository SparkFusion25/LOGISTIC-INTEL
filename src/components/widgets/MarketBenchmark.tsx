'use client';

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';

export default function MarketBenchmark() {
  const [origin, setOrigin] = useState('Shanghai, China');
  const [dest, setDest] = useState('Los Angeles, USA');
  const [hs, setHs] = useState('8471');
  const [ctype, setCtype] = useState('');

  const disabled = !origin || !dest || !hs;

  async function analyze() {
    // TODO: call your benchmark API (Avalara/Flexport/BTS blend)
    console.log('Analyze benchmark', { origin, dest, hs, ctype });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-gray-700" />
        <h3 className="font-semibold text-gray-900">Market Analysis</h3>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Field label="Origin Port">
            <input className="w-full input" value={origin} onChange={(e) => setOrigin(e.target.value)} />
          </Field>
          <Field label="Destination Port">
            <input className="w-full input" value={dest} onChange={(e) => setDest(e.target.value)} />
          </Field>
          <Field label="HS Code">
            <input className="w-full input" value={hs} onChange={(e) => setHs(e.target.value)} placeholder="8471" />
          </Field>
          <Field label="Container Type">
            <select className="w-full input" value={ctype} onChange={(e) => setCtype(e.target.value)}>
              <option value="">Select type</option>
              <option value="20GP">20GP</option>
              <option value="40GP">40GP</option>
              <option value="40HC">40HC</option>
            </select>
          </Field>
        </div>

        <button
          onClick={analyze}
          disabled={disabled}
          className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition ${
            disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'
          }`}
        >
          Analyze Market
        </button>
      </div>
      <style jsx global>{`
        .input {
          @apply px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      {children}
    </label>
  );
}