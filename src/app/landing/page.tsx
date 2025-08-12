"use client";

import { useRouter } from 'next/navigation';
import PublicHeader from '@/components/layout/PublicHeader';
import HeroGlobe from '@/components/landing/HeroGlobe';
import { CheckCircle, Shield, Sparkles, BarChart3, Globe, Users } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <>
      <PublicHeader />
      <HeroGlobe
        onDemo={() => router.push('/signup?demo=1')}
        onExplore={() => router.push('/dashboard/search')}
      />
      {/* Feature highlights */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 text-cyan-700 px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4" /> Built for enterprise teams
            </div>
            <h2 className="mt-5 text-3xl sm:text-4xl font-bold text-slate-900">Actionable intelligence in minutes</h2>
            <p className="mt-3 text-slate-600 text-lg max-w-2xl mx-auto">Search decision‑makers, inspect lanes and tariff exposure, and enrich CRM automatically. No heavy setup.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Feature icon={Globe} title="Global coverage" points={["2.4M+ live routes","Ocean + air data","Tariff exposure"]} />
            <Feature icon={Users} title="Enriched contacts" points={["180K+ contacts","Org charts","Verified emails"]} />
            <Feature icon={BarChart3} title="Trusted accuracy" points={["94% match rate","Real‑time updates","Export to CRM"]} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-[#0B1220] to-black">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 text-center">
          <h3 className="text-2xl sm:text-3xl font-semibold text-white">See live intelligence on your market</h3>
          <p className="text-white/70 mt-2">No credit card. Free trial includes live shipment and contact enrichment.</p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => router.push('/signup?demo=1')} className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-7 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-indigo-700">Start free</button>
            <button onClick={() => router.push('/dashboard/search')} className="text-white/90 px-7 py-3 rounded-lg font-semibold hover:bg-white/5 ring-1 ring-white/10">Explore live data</button>
          </div>
        </div>
      </section>
    </>
  );
}

function Feature({ icon: Icon, title, points }: { icon: any; title: string; points: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-6">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white grid place-items-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <ul className="mt-3 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-slate-600 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}