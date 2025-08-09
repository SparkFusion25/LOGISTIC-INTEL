'use client';

import React, { useEffect, useState } from 'react';

type Plan = 'trial' | 'starter' | 'pro' | 'enterprise';
const hasPremiumForCompany = (plan: Plan, isInCRM: boolean) =>
  ['pro', 'enterprise'].includes(plan) || isInCRM;

type StandardIntel = {
  ok: boolean;
  basic: { id: string; name: string; country: string | null; website: string | null };
  stats: {
    lastShipment: any;
    topLanes: Array<any>;
    hsChapters: Array<any>;
    modeMix: { ocean: number; air: number };
  };
  recentShipments: Array<any>;
};

type PremiumIntel = {
  contacts: Array<{ full_name: string; title: string; email?: string; phone?: string }>;
  heatScore: number;
  reasons: string[];
  trend: Array<{ month: string; shipments: number }>;
  triggers: Array<{ type: string; detail: string }>;
  tariff: { exposure: string; hs_chapters: string[]; notes?: string };
  basic?: { id: string; name: string };
};

export default function CompanyDrawer({
  companyId,
  plan = 'trial',
}: {
  companyId: string;
  plan?: Plan;
}) {
  const [isInCRM, setIsInCRM] = useState(false);
  const [mode, setMode] = useState<'standard' | 'premium'>('standard');
  const [standard, setStandard] = useState<StandardIntel | null>(null);
  const [premium, setPremium] = useState<PremiumIntel | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // Load standard intel
  useEffect(() => {
    const run = async () => {
      try {
        const r = await fetch(`/api/company/${companyId}/intel`, { cache: 'no-store' });
        const j = await r.json();
        setStandard(j as StandardIntel);
      } catch {
        setNote('Failed to load company intel.');
      }
    };
    run();
  }, [companyId]);

  // Try to load premium if gate allows or cookie is set
  const loadPremium = async () => {
    try {
      const r = await fetch(`/api/company/${companyId}/intel/premium?ts=${Date.now()}`, {
        cache: 'no-store',
      });
      if (r.status === 200) {
        const j = await r.json();
        setPremium(j.data as PremiumIntel);
        setMode('premium');
      }
    } catch {
      /* ignore for now */
    }
  };

  useEffect(() => {
    if (hasPremiumForCompany(plan, isInCRM)) {
      void loadPremium();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, isInCRM, companyId]);

  const addToCrm = async () => {
    try {
      const r = await fetch('/api/crm/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setNote(j.error ?? 'Could not add to CRM.');
        return;
      }
      setIsInCRM(true);
      setNote('Added to CRM. Unlocking premium…');
      await loadPremium(); // flip immediately
    } catch {
      setNote('Network error. Try again.');
    }
  };

  return (
    <div className="w-full md:w-[720px] lg:w-[860px] p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">
            {standard?.basic?.name ?? 'Company'}
          </h2>
          <p className="text-sm text-gray-500">
            {standard?.basic?.country ?? '—'}
          </p>
        </div>
        <div className="flex gap-2">
          {mode === 'standard' && (
            <button
              onClick={addToCrm}
              className="px-3 py-2 bg-black text-white rounded-lg"
            >
              Add to CRM
            </button>
          )}
        </div>
      </div>

      {note && (
        <div className="mb-4 text-sm rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          {note}
        </div>
      )}

      {/* Tabs simplified */}
      <div className="space-y-6">
        <section>
          <h3 className="font-medium mb-2">Overview</h3>
          <div className="text-sm text-gray-700">
            Last shipment: {standard?.stats?.lastShipment ? 'Available' : '—'}
          </div>
          <div className="text-sm text-gray-700">
            Mode mix: ocean {standard?.stats?.modeMix?.ocean ?? 0}% · air{' '}
            {standard?.stats?.modeMix?.air ?? 0}%
          </div>
        </section>

        <section>
          <h3 className="font-medium mb-2">Recent Shipments</h3>
          <div className="text-sm text-gray-700">
            {standard?.recentShipments?.length
              ? `${standard.recentShipments.length} shipments`
              : '—'}
          </div>
        </section>

        {mode === 'premium' && premium ? (
          <section>
            <h3 className="font-medium mb-2">Contacts & Heat Score</h3>
            <div className="text-sm">
              Heat score: <span className="font-semibold">{premium.heatScore}</span>
            </div>
            <ul className="mt-2 text-sm list-disc list-inside">
              {premium.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <div className="mt-3">
              <div className="text-sm font-medium mb-1">Contacts</div>
              <ul className="space-y-1 text-sm">
                {premium.contacts.map((c, i) => (
                  <li key={i}>
                    <span className="font-medium">{c.full_name}</span> — {c.title}
                    {c.email ? ` · ${c.email}` : ''}{c.phone ? ` · ${c.phone}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : (
          <section className="border rounded p-3 bg-indigo-50">
            <div className="text-sm">
              Unlock contacts, heat score, and trends by upgrading to Pro/Enterprise
              or adding this company to CRM.
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
