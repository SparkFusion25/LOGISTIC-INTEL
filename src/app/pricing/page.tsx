'use client';

import { useState } from 'react';
import { Check, ArrowRight, Star, Shield, Clock, Users } from 'lucide-react';
import { PLANS } from '@/lib/stripe';
import { useUser } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface PricingTier {
  id: keyof typeof PLANS;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'premium';
}

const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'Ocean freight intelligence with essential CRM and campaigns',
    features: [
      'Ocean Freight: Included (up to 1,000 companies / 5,000 shipments)',
      'Air Freight: Not included',
      'CRM Contacts Limit: 200',
      'Campaign Builder: Up to 2 active campaigns',
      'Email support',
      'Standard analytics'
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'secondary'
  },
  {
    id: 'salesProfessional',
    name: 'Pro',
    price: '$99',
    period: '/month',
    description: 'Full ocean + air freight access with higher CRM and campaigns',
    features: [
      'Ocean Freight: Included (up to 5,000 companies / 25,000 shipments)',
      'Air Freight: Included (up to 5,000 companies / 25,000 shipments)',
      'CRM Contacts Limit: 2,000',
      'Campaign Builder: Up to 10 active campaigns',
      'Priority support',
      'Advanced analytics'
    ],
    popular: true,
    buttonText: 'Start Free Trial',
    buttonVariant: 'primary'
  },
  {
    id: 'professionalTeam',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Unlimited freight intelligence with premium support and services',
    features: [
      'Ocean Freight: Included (unlimited)',
      'Air Freight: Included (unlimited)',
      'CRM Contacts: Unlimited',
      'Campaign Builder: Unlimited active campaigns',
      'Dedicated account manager',
      'Priority support'
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'premium'
  }
];

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const user = useUser();
  const router = useRouter();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    setIsLoading(planId);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const getButtonClasses = (variant: 'primary' | 'secondary' | 'premium') => {
    const base = "w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2";
    
    switch (variant) {
      case 'primary':
        return `${base} bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:shadow-xl hover:scale-105 transform`;
      case 'secondary':
        return `${base} bg-slate-100 text-slate-800 hover:bg-slate-200 border-2 border-slate-200 hover:border-slate-300`;
      case 'premium':
        return `${base} bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-xl hover:scale-105 transform`;
      default:
        return base;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="ml-3 text-xl font-bold text-slate-800">Logistic Intel</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/landing" className="text-slate-600 hover:text-slate-900">Home</a>
              <a href="/dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</a>
              <a href="#pricing" className="text-sky-600 font-medium">Pricing</a>
            </nav>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-sky-100 text-sky-700 rounded-full text-sm font-medium mb-8">
            <Star className="w-4 h-4 mr-2" />
            Trusted by 1,000+ logistics professionals
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Simple, Transparent
            <span className="block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto">
            Choose the plan that fits your business needs. Start with a free trial, 
            no credit card required. Upgrade or downgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-16">
            <span className={`mr-3 ${billingCycle === 'monthly' ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-sky-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${billingCycle === 'yearly' ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
              Yearly
            </span>
            <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
              Save 20%
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 transition-all duration-300 ${
                  tier.popular 
                    ? 'border-sky-400 shadow-2xl scale-105' 
                    : 'border-slate-200 hover:border-sky-300 hover:shadow-xl'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{tier.name}</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-slate-900">
                      {billingCycle === 'yearly' && tier.price !== 'Custom' 
                        ? `$${Math.round(parseInt(tier.price.replace('$', '')) * 0.8)}`
                        : tier.price
                      }
                    </span>
                    <span className="text-slate-600 ml-2">
                      {tier.price !== 'Custom' ? (billingCycle === 'yearly' ? '/year' : tier.period) : ''}
                    </span>
                  </div>
                  <p className="text-slate-600">{tier.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => tier.id !== 'professionalTeam' ? handleSubscribe(tier.id) : window.open('mailto:sales@logisticintel.com')}
                  disabled={isLoading === tier.id}
                  className={getButtonClasses(tier.buttonVariant)}
                >
                  {isLoading === tier.id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {tier.buttonText}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-slate-600">
              Built for modern logistics and trade professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Enterprise Security</h3>
              <p className="text-slate-600">
                Bank-level encryption, SOC 2 compliance, and secure data handling for your peace of mind.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">24/7 Support</h3>
              <p className="text-slate-600">
                Get help when you need it with our dedicated support team and comprehensive documentation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Team Collaboration</h3>
              <p className="text-slate-600">
                Share insights, manage teams, and collaborate seamlessly across your organization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-slate-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate any billing adjustments.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-slate-600">
                Absolutely! All plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-slate-600">
                We accept all major credit cards, PayPal, and bank transfers for annual plans. 
                All payments are processed securely through Stripe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sky-500 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to supercharge your trade intelligence?
          </h2>
          <p className="text-xl text-sky-100 mb-8">
            Join thousands of logistics professionals who trust Logistic Intel
          </p>
          <button
            onClick={() => handleSubscribe('salesProfessional')}
            className="bg-white text-sky-600 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}