import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const PLANS = {
  starter: {
    productId: 'prod_SoodHESzNJE3Pi',
    name: 'Starter',
    description: 'For Sales and senior management professionals looking to gain deep insight into specific tradelanes.',
    features: [
      'Access to trade intelligence search',
      'Basic company insights',
      'Email support',
      'Standard analytics'
    ],
    limits: {
      searches: 100,
      contacts: 50,
      exports: 10
    }
  },
  salesProfessional: {
    productId: 'prod_Sop65icR3KjAi1',
    name: 'Sales Professional',
    description: 'Ideal for Sales and consulting professionals looking to get deeper insights into international trade with enriched contact data and email automation.',
    features: [
      'Everything in Starter',
      'Enriched contact data',
      'Email automation sequences',
      'Advanced analytics',
      'CRM integration',
      'Priority support'
    ],
    limits: {
      searches: 500,
      contacts: 250,
      exports: 50
    }
  },
  professionalTeam: {
    productId: 'prod_Sop7lTsdSKF7QD',
    name: 'Professional (Team)',
    description: 'Everything in starter, for a team of 5. Includes deeper insights and full automation and enrichments.',
    features: [
      'Everything in Sales Professional',
      'Team management (5 users)',
      'Custom integrations',
      'Advanced automation',
      'White-label options',
      'Dedicated support'
    ],
    limits: {
      searches: 2500,
      contacts: 1000,
      exports: 250,
      teamMembers: 5
    }
  },
} as const;

export type PlanId = keyof typeof PLANS;

export const TAX_CODE = 'txcd_10103001'; // Software as a Service tax code

export const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';