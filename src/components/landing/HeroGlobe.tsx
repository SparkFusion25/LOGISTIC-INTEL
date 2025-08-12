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
  const { inner, outer } = useMemo(() => {
    const half = Math.ceil(SAMPLE_CONTACTS.length / 2);
    return {
      inner: SAMPLE_CONTACTS.slice(0, half),
      outer: SAMPLE_CONTACTS.slice(half),
    };
  }, []);

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

          {/* Right — 3D Globe + Orbiting Contact Cards */}
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
                {/* Globe core */}
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 lg:w-60 lg:h-60 rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,.35),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(6,182,212,.25),transparent_55%)] shadow-[inset_0_0_60px_rgba(59,130,246,.25),0_0_120px_rgba(6,182,212,.25)] translate-z-0">
                  {/* Meridians/parallels */}
                  <div className="absolute inset-0 opacity-60">
                    {[20, 40, 60, 80].map((t) => (
                      <div key={t} className="absolute inset-x-0 border-t border-white/10" style={{ top: `${t}%` }} />
                    ))}
                    {[20, 40, 60, 80].map((l) => (
                      <div key={l} className="absolute inset-y-0 border-l border-white/10" style={{ left: `${l}%` }} />
                    ))}
                  </div>
                  {/* Soft ambient pulse */}
                  <div className="absolute inset-0 rounded-full animate-ambientPulse bg-[conic-gradient(from_45deg,rgba(6,182,212,.15),transparent_30%,rgba(99,102,241,.12),transparent_60%)]" />
                </div>

                {/* Inner orbit (slower, closer) */}
                <div className="absolute preserve-3d animate-orbitSlow">
                  {inner.map((c, i) => (
                    <OrbitalCard key={`inner-${i}`} index={i} total={inner.length} radius={150} contact={c} depth="near" />
                  ))}
                </div>

                {/* Outer orbit (faster, farther, reverse) */}
                <div className="absolute preserve-3d animate-orbitFastReverse">
                  {outer.map((c, i) => (
                    <OrbitalCard key={`outer-${i}`} index={i} total={outer.length} radius={200} contact={c} depth="far" />
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

function OrbitalCard({
  index,
  total,
  radius,
  contact,
  depth,
}: {
  index: number;
  total: number;
  radius: number;
  contact: Contact;
  depth: 'near' | 'far';
}) {
  const angle = (360 / total) * index;
  const transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
  const depthFade = depth === 'near' ? 'opacity-95' : 'opacity-75';

  return (
    <div className="absolute top-1/2 left-1/2 preserve-3d" style={{ transform }}>
      <div className={`-translate-x-1/2 -translate-y-1/2 animate-bob ${depthFade}`}>
        <ContactCardMini contact={contact} />
      </div>
    </div>
  );
}