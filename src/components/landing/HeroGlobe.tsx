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

          {/* Right — Transparent rotating globe with 2D pin pop-ups */}
          <div className="relative">
            <div className="relative h-[420px] sm:h-[460px] lg:h-[520px] rounded-2xl overflow-visible">
              {/* Rotating transparent SVG globe */}
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <RotatingGlobeSVG className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 opacity-90 animate-spin-slower" />
              </div>

              {/* Pin pop-ups around the globe perimeter (2D, non-distorting) */}
              <div className="absolute inset-0">
                {contacts.map((c, i) => (
                  <PinCard2D key={i} index={i} total={contacts.length} contact={c} />
                ))}
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

function RotatingGlobeSVG({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <defs>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 100) rotate(90) scale(100)">
          <stop offset="0%" stopColor="rgba(6,182,212,0.35)" />
          <stop offset="60%" stopColor="rgba(99,102,241,0.25)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" stroke="white" strokeOpacity="0.15" />
      {/* Parallels */}
      {[20, 40, 60, 80].map((p) => (
        <circle key={`p-${p}`} cx="100" cy="100" r={p} stroke="white" strokeOpacity="0.08" />
      ))}
      {/* Meridians (approx) */}
      {[0, 30, 60, 90, 120, 150].map((a) => (
        <g key={`m-${a}`} transform={`rotate(${a} 100 100)`}>
          <path d="M100 4 L100 196" stroke="white" strokeOpacity="0.08" />
        </g>
      ))}
      <circle cx="100" cy="100" r="96" fill="url(#glow)" opacity="0.4" />
    </svg>
  );
}

function PinCard2D({ index, total, contact }: { index: number; total: number; contact: Contact }) {
  const angleDeg = (360 / total) * index;
  const angleRad = (Math.PI / 180) * angleDeg;
  const radius = 140; // pixels from center for pin stem base
  const cx = 0.5; // center normalized
  const cy = 0.5;
  const x = Math.cos(angleRad) * radius;
  const y = Math.sin(angleRad) * radius;
  const delay = `${(index % 10) * 0.6}s`;

  return (
    <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(${x}px, ${y}px)` }}>
      <div className="-translate-x-1/2 -translate-y-1/2">
        {/* Pin head */}
        <span
          className="absolute left-1/2 -translate-x-1/2 -top-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,.8)]"
          style={{ animation: `pinPop 8s ease-in-out infinite`, animationDelay: delay }}
        />
        {/* Stem */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-2 w-[1px] h-10 bg-cyan-300/60"
          style={{ animation: `pinPop 8s ease-in-out infinite`, animationDelay: delay }}
        />
        {/* Card */}
        <div
          className="relative -translate-x-1/2 -translate-y-full opacity-0"
          style={{ animation: `pinPop 8s ease-in-out infinite`, animationDelay: delay }}
        >
          <ContactCardMini contact={contact as { name: string; company: string; country?: string }} />
        </div>
      </div>
    </div>
  );
}