'use client'

import { useEffect, useState } from 'react'
import { X, TrendingUp, Users, Package, Info, Crown } from 'lucide-react'
import { getAuthUser, canAccessFeature, getFeatureGateMessage, AuthUser } from '@/lib/auth-helpers'

export interface CompanyInfo {
  id: string
  name: string
  industry?: string
  country?: string
  website?: string
}

interface CompanyDrawerProps {
  company: CompanyInfo | null
  open: boolean
  onClose: () => void
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
        active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

function UpsellBanner({ feature }: { feature: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
      <Crown className="h-5 w-5 text-amber-600 mt-0.5" />
      <div className="flex-1">
        <div className="text-sm font-medium text-amber-800">{getFeatureGateMessage(feature)}</div>
        <div className="mt-2">
          <a href="/pricing" className="inline-flex items-center px-3 py-1.5 text-sm rounded-md bg-amber-600 text-white hover:bg-amber-700">Upgrade</a>
        </div>
      </div>
    </div>
  )
}

export default function CompanyDrawer({ company, open, onClose }: CompanyDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'contacts' | 'shipments'>('overview')
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const u = await getAuthUser()
      if (mounted) setUser(u)
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (!open || !company) return null

  const canTrends = canAccessFeature(user, 'trend_analysis')
  const canContacts = canAccessFeature(user, 'contact_enrichment')

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer panel */}
      <div className="absolute inset-y-0 right-0 w-full sm:w-[520px] bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
            <p className="text-xs text-gray-500">{company.industry || '—'} · {company.country || '—'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>

        {/* Tabs */}
        <div className="p-3 flex items-center gap-2 border-b overflow-x-auto">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            <span className="inline-flex items-center gap-1"><Info className="h-4 w-4" /> Overview</span>
          </TabButton>
          <TabButton active={activeTab === 'trends'} onClick={() => setActiveTab('trends')}>
            <span className="inline-flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Trends</span>
          </TabButton>
          <TabButton active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')}>
            <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> Contacts</span>
          </TabButton>
          <TabButton active={activeTab === 'shipments'} onClick={() => setActiveTab('shipments')}>
            <span className="inline-flex items-center gap-1"><Package className="h-4 w-4" /> Shipments</span>
          </TabButton>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto min-h-0 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-700">Website: {company.website ? (
                <a className="text-indigo-600 hover:underline" href={company.website} target="_blank" rel="noreferrer">{company.website}</a>
              ) : '—'}</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border bg-gray-50">
                  <div className="text-xs text-gray-500">Industry</div>
                  <div className="text-sm font-medium text-gray-900">{company.industry || '—'}</div>
                </div>
                <div className="p-3 rounded-lg border bg-gray-50">
                  <div className="text-xs text-gray-500">Country</div>
                  <div className="text-sm font-medium text-gray-900">{company.country || '—'}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-4">
              {!canTrends ? (
                <UpsellBanner feature="trend_analysis" />
              ) : (
                <div className="text-sm text-gray-700">Trend charts and shipment mode breakdown will appear here.</div>
              )}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-4">
              {!canContacts ? (
                <UpsellBanner feature="contact_enrichment" />
              ) : (
                <div className="text-sm text-gray-700">Enriched contacts and verified emails will appear here.</div>
              )}
            </div>
          )}

          {activeTab === 'shipments' && (
            <div className="space-y-2 text-sm text-gray-700">
              Shipment history and latest imports will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}