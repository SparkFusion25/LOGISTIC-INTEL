'use client';

import { useEffect, useState } from 'react';
import type { Plan } from '../../lib/featureGate';
import { hasPremiumForCompany } from '../../lib/featureGate';

type Json = any;

export default function CompanyDrawer({
  companyId,
  plan,
}: {
  companyId: string;
  plan: Plan;
}) {
  const [isInCRM, setIsInCRM] = useState(false);
  const [standard, setStandard] = useState<Json>(null);
  const [premium, setPremium] = useState<Json>(null);

  const premiumAllowed = hasPremiumForCompany(plan, isInCRM);

  // Standard intel
  useEffect(() => {
    const run = async () => {
      const res = await fetch(`/api/company/${companyId}/intel`);
      const json = await res.json();
      setStandard(json?.data ?? json);
    };
    run();
  }, [companyId]);

  // Premium intel (only if allowed)
  useEffect(() => {
    if (!premiumAllowed) return;
    const run = async () => {
      const res = await fetch(`/api/company/${companyId}/intel/premium`);
      const json = await res.json();
      if (json?.ok === false && json?.error) return; // gated or error
      setPremium(json?.data ?? json);
    };
    run();
  }, [companyId, premiumAllowed]);

  // Optimistic Add to CRM -> flips gate
  const addToCrm = async () => {
    await fetch('/api/crm/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: companyId }),
    });
    setIsInCRM(true);
  };

  return (
    <div className="w-full max-w-4xl">
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

        {!premiumAllowed && (
          <button
            onClick={addToCrm}
            className="px-3 py-2 bg-indigo-600 text-white rounded"
          >
            Add to CRM
          </button>
        )}
      </div>

      {/* Overview */}
      <section className="mb-6">
        <h3 className="font-medium mb-2">Overview</h3>
        <div className="text-sm text-gray-700">
          Last shipment: {standard?.stats?.lastShipment ?? '—'}
        </div>
        <div className="text-sm text-gray-700">
          HS chapters: {(standard?.stats?.hsChapters ?? []).join(', ') || '—'}
        </div>
      </section>

      {/* Recent Shipments */}
      <section className="mb-6">
        <h3 className="font-medium mb-2">Recent Shipments</h3>
        <div className="text-sm text-gray-700">
          {(standard?.recentShipments ?? []).length} shown
        </div>
      </section>

      {/* Premium */}
      {premiumAllowed ? (
        <section className="mb-6">
          <h3 className="font-medium mb-2">Contacts & Heat Score</h3>
          <div className="text-sm text-gray-700">
            Heat score: {premium?.heatScore ?? '—'}
          </div>
          <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">
            {(premium?.reasons ?? []).map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="border rounded p-3 bg-indigo-50">
          <div className="text-sm">
            Unlock contacts, heat score, and trends by upgrading or adding to
            CRM.
          </div>
        </section>
      )}
    </div>
  );
}
