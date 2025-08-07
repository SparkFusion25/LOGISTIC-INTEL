'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AuthUser, getAuthUser, canAccessFeature, getFeatureGateMessage, isTestAdmin } from '@/lib/auth-helpers'
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, User, Crown, Shield } from 'lucide-react'

const testFeatures = [
  'contact_enrichment',
  'trend_analysis', 
  'campaign_builder',
  'advanced_filters',
  'export_data',
  'unlimited_search',
  'api_access',
  'admin_panel',
  'user_management',
  'billing_access',
  'analytics_access'
] as const

export default function TestAdminPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [setupStep, setSetupStep] = useState(0)
  const [rawMeta, setRawMeta] = useState<any | null>(null)
  const [profileData, setProfileData] = useState<any | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadAuthUser()
  }, [])

  const loadAuthUser = async () => { 
    // Always refresh session first to avoid stale metadata
    try { await supabase.auth.getSession() } catch {}

    try {
      setLoading(true)
      const user = await getAuthUser()
      setAuthUser(user)

      // Fetch raw auth user and public.profile for diagnostics
      try {
        const { data: sessionData } = await supabase.auth.getUser()
        setRawMeta({
          user_metadata: sessionData?.user?.user_metadata || null,
          app_metadata: sessionData?.user?.app_metadata || null,
          email: sessionData?.user?.email,
          id: sessionData?.user?.id
        })
        if (sessionData?.user?.id) {
          const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', sessionData.user.id).single()
          setProfileData(profile || null)
        }
      } catch {}
      
      // Determine setup step based on user state
      if (!user) {
        setSetupStep(1) // Need to sign up/in
      } else if (user.email === 'info@getb3acon.com' && (!user.role || user.role === 'user')) {
        // Force a session refresh and re-fetch to avoid stale metadata
        try {
          await supabase.auth.getSession();
        } catch {}
        setSetupStep(2) // Need to run SQL scripts
      } else if (user.role === 'admin') {
        setSetupStep(3) // All set up
      } else {
        // Attempt a live profile read to confirm admin upgrade before defaulting to non-admin
        try {
          const { data: profile } = await supabase.from('user_profiles').select('role, plan').eq('id', user.id).single()
          if (profile && profile.role === 'admin') {
            setAuthUser({ ...user, role: 'admin', plan: profile.plan || user.plan, isAdmin: true, isPremium: true, permissions: user.permissions })
            setSetupStep(3)
            return
          }
        } catch {}
        setSetupStep(2) // Need admin setup
      }
    } catch (error) {
      console.error('Error loading auth user:', error)
      setAuthUser(null)
      setSetupStep(1)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setAuthUser(null)
    setSetupStep(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Permissions Test</h1>
              <p className="text-gray-600">Test gated features and admin access levels</p>
            </div>
            {authUser && (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Diagnostics */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Metadata Diagnostics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Auth Metadata</h3>
              <pre className="bg-gray-50 p-3 rounded border overflow-auto max-h-64">{JSON.stringify(rawMeta, null, 2)}</pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">User Profile (public.user_profiles)</h3>
              <pre className="bg-gray-50 p-3 rounded border overflow-auto max-h-64">{JSON.stringify(profileData, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Setup Progress</h2>
          
          <div className="space-y-4">
            {/* Step 1: Authentication */}
            <div className="flex items-center space-x-3">
              {authUser ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Step 1: Create and sign in with admin account
                </p>
                {!authUser ? (
                  <div className="mt-2">
                    <p className="text-sm text-red-600 mb-2">
                      Not authenticated. Please sign in with: info@getb3acon.com / 7354
                    </p>
                    <a 
                      href="/login" 
                      className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <span>Go to Login</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-green-600">✓ Signed in as {authUser.email}</p>
                )}
              </div>
            </div>

            {/* Step 2: Admin Setup */}
            <div className="flex items-center space-x-3">
              {authUser?.role === 'admin' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : authUser ? (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Step 2: Run admin setup SQL scripts
                </p>
                {authUser?.role !== 'admin' && authUser && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      Account created but admin privileges not set up
                    </p>
                    <div className="text-xs text-yellow-700 space-y-1">
                      <p>1. Go to Supabase SQL Editor</p>
                      <p>2. Run: <code className="bg-yellow-100 px-1 rounded">user_profiles_schema.sql</code></p>
                      <p>3. Run: <code className="bg-yellow-100 px-1 rounded">create_admin_user.sql</code></p>
                      <p>4. Refresh this page</p>
                    </div>
                  </div>
                )}
                {authUser?.role === 'admin' && (
                  <p className="text-sm text-green-600">✓ Admin role configured</p>
                )}
              </div>
            </div>

            {/* Step 3: Feature Testing */}
            <div className="flex items-center space-x-3">
              {authUser?.role === 'admin' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Step 3: Test gated features
                </p>
                {authUser?.role === 'admin' ? (
                  <p className="text-sm text-green-600">✓ Ready to test all features below</p>
                ) : (
                  <p className="text-sm text-gray-600">Complete steps 1-2 first</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current User Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current User Status</h2>
          
          {authUser ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium">{authUser.email}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">User ID:</span>
                  <span className="text-sm font-mono">{authUser.id}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Role:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    authUser.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {authUser.role || 'user'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Plan:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    authUser.plan === 'enterprise' 
                      ? 'bg-blue-100 text-blue-800' 
                      : authUser.plan === 'pro'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {authUser.plan || 'free'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Admin Access:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    authUser.isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {authUser.isAdmin ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Premium Access:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    authUser.isPremium ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {authUser.isPremium ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Test Admin User:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    isTestAdmin(authUser) ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isTestAdmin(authUser) ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Not authenticated</p>
          )}
        </div>

        {/* Feature Access Test */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Access Test</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {testFeatures.map((feature) => {
               const hasAccess = authUser ? canAccessFeature(authUser, feature) : false
               const message = authUser ? getFeatureGateMessage(feature) : 'Please sign in first'
              
              return (
                <div key={feature} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 capitalize">
                      {feature.replace(/_/g, ' ')}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {hasAccess ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Unlocked</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-xs text-red-600 font-medium">Locked</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{message}</p>
                </div>
              )
            })}
          </div>

          {/* Test Results Summary */}
          {authUser && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Test Summary</h3>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-green-600">
                  ✓ {testFeatures.filter(f => canAccessFeature(authUser, f)).length} Unlocked
                </span>
                <span className="text-red-600">
                  ✗ {testFeatures.filter(f => !canAccessFeature(authUser, f)).length} Locked
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        {authUser?.role === 'admin' && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">🎉 Admin Setup Complete!</h3>
            <p className="text-green-700 mb-4">
              All features are unlocked. You can now test the full application with admin privileges.
            </p>
            <div className="space-y-2">
              <a 
                href="/dashboard" 
                className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <span>Test Main Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <br />
              <a 
                href="/search" 
                className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <span>Test Search Features</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}