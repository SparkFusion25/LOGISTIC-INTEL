'use client';

import { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { 
  CreditCard, 
  Calendar, 
  Check, 
  AlertTriangle, 
  ExternalLink,
  Zap,
  Users,
  BarChart3
} from 'lucide-react';
import { PLANS } from '@/lib/stripe';

interface UserSubscription {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  subscription_current_period_start: string | null;
  subscription_current_period_end: string | null;
}

interface PlanLimits {
  plan_id: string;
  searches_per_month: number;
  contacts_per_month: number;
  exports_per_month: number;
  team_members: number;
  features: string[];
}

export default function BillingPanel() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    if (!user) return;

    try {
      // Fetch user subscription data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          stripe_customer_id,
          stripe_subscription_id,
          subscription_status,
          subscription_plan,
          subscription_current_period_start,
          subscription_current_period_end
        `)
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      setSubscription(userData);

      // Fetch plan limits if user has a subscription
      if (userData?.subscription_plan) {
        const { data: limitsData, error: limitsError } = await supabase
          .from('plan_limits')
          .select('*')
          .eq('plan_id', userData.subscription_plan)
          .single();

        if (!limitsError && limitsData) {
          setPlanLimits(limitsData);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openBillingPortal = async () => {
    if (!user) return;

    setPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error(data.error || 'Failed to open billing portal');
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'text-emerald-600 bg-emerald-100';
      case 'trialing':
        return 'text-blue-600 bg-blue-100';
      case 'past_due':
        return 'text-amber-600 bg-amber-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPlanName = (planId: string | null) => {
    if (!planId) return 'No Plan';
    return PLANS[planId as keyof typeof PLANS]?.name || planId;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveSubscription = subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing';

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Current Plan</h2>
          {subscription?.subscription_status && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.subscription_status)}`}>
              {subscription.subscription_status.charAt(0).toUpperCase() + subscription.subscription_status.slice(1)}
            </span>
          )}
        </div>

        {hasActiveSubscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {getPlanName(subscription?.subscription_plan)}
                </h3>
                <p className="text-slate-600">
                  Active until {formatDate(subscription?.subscription_current_period_end)}
                </p>
              </div>
              <div className="text-right">
                <button
                  onClick={openBillingPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  {portalLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Manage Billing
                  <ExternalLink className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Subscription</h3>
            <p className="text-slate-600 mb-6">
              Subscribe to a plan to unlock powerful trade intelligence features
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Zap className="w-5 h-5 mr-2" />
              View Plans
            </a>
          </div>
        )}
      </div>

      {/* Plan Limits Card */}
      {planLimits && hasActiveSubscription && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Plan Limits & Usage</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-sky-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{planLimits.searches_per_month}</div>
              <div className="text-sm text-slate-600">Searches/month</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{planLimits.contacts_per_month}</div>
              <div className="text-sm text-slate-600">Contacts/month</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ExternalLink className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{planLimits.exports_per_month}</div>
              <div className="text-sm text-slate-600">Exports/month</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{planLimits.team_members}</div>
              <div className="text-sm text-slate-600">Team members</div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Features */}
      {planLimits && hasActiveSubscription && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Included Features</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {planLimits.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                <span className="text-slate-700 capitalize">
                  {feature.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing History Link */}
      {hasActiveSubscription && (
        <div className="bg-slate-50 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Need to update your billing?</h3>
          <p className="text-slate-600 mb-4">
            Manage your payment methods, billing address, and download invoices
          </p>
          <button
            onClick={openBillingPortal}
            disabled={portalLoading}
            className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {portalLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Calendar className="w-5 h-5 mr-2" />
            )}
            Open Billing Portal
          </button>
        </div>
      )}
    </div>
  );
}