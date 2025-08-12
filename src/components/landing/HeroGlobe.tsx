'use client';

import { useMemo } from 'react';
import { Search, Globe, Users, BarChart3, Play } from 'lucide-react';
import ContactCardMini from '@/components/ui/ContactCardMini';

type Contact = {
  name: string;
  title?: string;
  company: string;
  country?: string;
  email?: string;
  avatarUrl?: string;
};

const SAMPLE_CONTACTS: Contact[] = [
  { name: 'Aisha Khan', company: 'Emirates Logistics', country: 'AE' },
  { name: 'Diego Rivera', company: 'LatAm Imports', country: 'MX' },
  { name: 'Wei Zhang', company: 'Shenzhen Components', country: 'CN' },
  { name: 'Emily Chen', company: 'Bayview Tech', country: 'US' },
  { name: 'Ravi Patel', company: 'Indus Traders', country: 'IN' },
  { name: 'Sofia Rossi', company: 'Milano Fashion Exports', country: 'IT' },
  { name: 'Jonas Koenig', company: 'Rhine Tools GmbH', country: 'DE' },
  { name: 'Marcos Silva', company: 'Porto Oceânico', country: 'BR' },
  { name: 'Yuki Tanaka', company: 'Kyoto Devices', country: 'JP' },
  { name: 'Nora Ali', company: 'Cairo Plastics', country: 'EG' },
];

// Approx country centroids in degrees (lat, lon)
const COUNTRY_COORDS: Record<string, { lat: number; lon: number }> = {
  US: { lat: 37, lon: -95 },
  MX: { lat: 23, lon: -102 },
  BR: { lat: -14, lon: -51 },
  DE: { lat: 51, lon: 10 },
  IT: { lat: 42.5, lon: 12.5 },
  JP: { lat: 36, lon: 138 },
  CN: { lat: 35, lon: 103 },
  IN: { lat: 22, lon: 79 },
  AE: { lat: 24, lon: 54 },
  EG: { lat: 27, lon: 30 },
};

export default function HeroGlobe({
  onDemo,
  onExplore,
}: {
  onDemo?: () => void;
  onExplore?: () => void;
}) {
  const contacts = useMemo(() => SAMPLE_CONTACTS, []);

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0B1220] via-[#0B1220] to-[#0b1220]/95" />

      <div className="mx-auto w-full max-w-7xl px-6 pt-20 pb-14 lg:pt-24 lg:pb-20">
        {/* Enterprise Badge */}
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full w-fit mb-8 ring-1 ring-white/10">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-white/70 font-medium">
            Enterprise‑grade freight intelligence
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Freight intelligence that{' '}
              <span className="relative inline-block">
                reveals
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full grid place-items-center shadow-[0_0_0_4px_rgba(99,102,241,0.25)]">
                  <Search className="w-4 h-4 text-white" />
                </span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-xl">
              See decision‑makers, lanes, and tariff exposure for any company. Add to CRM to unlock premium intel and close deals 3× faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onDemo}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-7 py-3 rounded-lg font-semibold text-base sm:text-lg hover:from-cyan-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                Get a demo →
              </button>
              <button
                onClick={onExplore}
                className="text-white/90 px-7 py-3 rounded-lg font-semibold hover:bg-white/5 transition-colors flex items-center justify-center gap-2 ring-1 ring-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <Play className="w-4 h-4" />
                Explore live data
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              <Stat icon={Globe} label="Live shipments" value="2.4M+" />
              <Stat icon={Users} label="Contacts enriched" value="180K+" />
              <Stat icon={BarChart3} label="Accuracy rate" value="94%" />
            </div>
          </div>

          {/* Right — 3D Globe + Pin pop-ups */}
          <div className="relative">
            <div className="relative h-[420px] sm:h-[460px] lg:h-[520px] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-gradient-to-br from-[#0f1a33] via-[#0a1430] to-[#0c1833]">
              {/* Dot pattern */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                }}
              />

              {/* 3D scene container */}
              <div className="absolute inset-0 grid place-items-center perspective-1200">
                {/* Globe core: larger, clearer, with visible lines and rotation */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full border border-white/20 bg-[radial-gradient(circle_at_30%_35%,rgba(99,102,241,.35),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(6,182,212,.28),transparent_55%)] shadow-[inset_0_0_80px_rgba(99,102,241,.25),0_0_140px_rgba(6,182,212,.22)] overflow-hidden">
                  {/* Meridian/parallel grid */}
                  <div className="absolute inset-0 opacity-70">
                    {[12.5, 25, 37.5, 50, 62.5, 75].map((t) => (
                      <div key={`t-${t}`} className="absolute inset-x-0 border-t border-white/10" style={{ top: `${t}%` }} />
                    ))}
                    {[12.5, 25, 37.5, 50, 62.5, 75].map((l) => (
                      <div key={`l-${l}`} className="absolute inset-y-0 border-l border-white/10" style={{ left: `${l}%` }} />
                    ))}
                  </div>
                  {/* Soft ambient pulse layer */}
                  <div className="absolute inset-0 rounded-full animate-ambientPulse bg-[conic-gradient(from_0deg,rgba(6,182,212,.18),transparent_20%,rgba(99,102,241,.16),transparent_55%)]" />
                </div>

                {/* Pins: country-based pop-ups around the globe */}
                <div className="absolute preserve-3d">
                  {contacts.map((c, i) => (
                    <PinCard key={`pin-${i}`} index={i} delayStep={0.6} contact={c} />
                  ))}
                </div>
              </div>

              {/* Info pills */}
              <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md shadow">
                <div className="text-[11px] text-gray-600 mb-0.5">2.4M+ Live Routes</div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-gray-700 font-medium">Real‑time updates</span>
                </div>
              </div>

              <div className="absolute bottom-5 right-5 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md shadow">
                <div className="text-[11px] text-gray-600 mb-0.5">Processing Speed</div>
                <div className="text-sm font-bold text-gray-900">94% Faster</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value: string;
  label: string;
}) {
  return (
    <div className="text-left">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-5 h-5 text-white/70" />
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

function PinCard({ index, delayStep, contact }: { index: number; delayStep: number; contact: Contact }) {
  const country = contact.country || 'US';
  const coords = COUNTRY_COORDS[country] || { lat: 0, lon: 0 };
  const radius = 180; // px depth from center
  // CSS 3D sphere placement: rotateY(lon) rotateX(lat) translateZ(radius)
  const transform = `rotateY(${coords.lon}deg) rotateX(${-coords.lat}deg) translateZ(${radius}px)`;
  const delay = `${(index % 10) * delayStep}s`;

  return (
    <div className="absolute top-1/2 left-1/2 preserve-3d" style={{ transform }}>
      {/* Pin stem */}
      <div className="-translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <span
            className="absolute left-1/2 -translate-x-1/2 -top-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,.8)]"
            style={{ animation: `pinPop 8s ease-in-out infinite`, animationDelay: delay }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-2 w-[1px] h-10 bg-cyan-300/60"
            style={{ animation: `pinPop 8s ease-in-out infinite`, animationDelay: delay }}
          />
          <div
            className="relative -translate-x-1/2 -translate-y-full opacity-0"
            style={{ animation: `pinPop 8s ease-in-out infinite`, animationDelay: delay }}
          >
            <ContactCardMini contact={contact as { name: string; company: string; country?: string }} />
          </div>
        </div>
      </div>
    </div>
  );
}