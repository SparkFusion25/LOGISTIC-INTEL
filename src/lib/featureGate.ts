export type Plan = 'trial' | 'starter' | 'pro' | 'enterprise';

export const hasPremiumForCompany = (plan: Plan, isInCRM: boolean) =>
  ['pro', 'enterprise'].includes(plan) || isInCRM;
