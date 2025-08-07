'use client';

import React, { useState, useEffect } from 'react';
import { getAuthUser, canAccessFeature, getFeatureGateMessage, isTestAdmin, AuthUser } from '@/lib/auth-helpers';
import { Shield, Check, X, Crown, Star, Lock, Unlock } from 'lucide-react';

export default function TestAdminPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authUser = await getAuthUser();
        setUser(authUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

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
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Permissions Test</h1>
              <p className="text-gray-600">Test gated features and admin access levels</p>
            </div>
          </div>
        </div>

        {/* User Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current User Status</h2>
          
          {user ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">User ID:</span>
                    <span className="text-xs text-gray-600 font-mono">{user.id}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">Role:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">Plan:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      user.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                      user.plan === 'pro' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.plan}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  user.isAdmin ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.isAdmin ? <Crown className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {user.isAdmin ? 'Admin Access' : 'No Admin Access'}
                  </span>
                </div>
                
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  user.isPremium ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.isPremium ? <Star className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {user.isPremium ? 'Premium Access' : 'No Premium Access'}
                  </span>
                </div>
                
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isTestAdmin(user) ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {isTestAdmin(user) ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {isTestAdmin(user) ? 'Test Admin User' : 'Not Test Admin'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <X className="w-5 h-5" />
                <span className="font-medium">Not authenticated</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Please sign in with: info@getb3acon.com / 7354
              </p>
            </div>
          )}
        </div>

        {/* Feature Access Test */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Feature Access Test</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testFeatures.map((feature) => {
              const hasAccess = canAccessFeature(user, feature);
              const message = getFeatureGateMessage(feature);
              
              return (
                <div key={feature} className={`border rounded-lg p-4 ${
                  hasAccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 capitalize">
                      {feature.replace('_', ' ')}
                    </span>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                      hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {hasAccess ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {hasAccess ? 'Unlocked' : 'Locked'}
                    </div>
                  </div>
                  {!hasAccess && (
                    <p className="text-xs text-red-700">{message}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">Test Instructions</h3>
          <div className="space-y-2 text-sm text-yellow-800">
            <p><strong>1.</strong> Sign up at <code>/signup</code> with: <strong>info@getb3acon.com</strong> / <strong>7354</strong></p>
            <p><strong>2.</strong> Run the admin setup SQL script in Supabase SQL Editor</p>
            <p><strong>3.</strong> Refresh this page to see admin permissions</p>
            <p><strong>4.</strong> Test gated features in the main app (search, CRM, campaigns)</p>
            <p><strong>5.</strong> All features should be unlocked for the admin user</p>
          </div>
        </div>
      </div>
    </div>
  );
}