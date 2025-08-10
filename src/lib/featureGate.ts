export type Plan = 'trial' | 'starter' | 'pro' | 'enterprise';
export const hasPremiumForCompany = (plan: Plan, isInCRM: boolean) =>
  plan === 'pro' || plan === 'enterprise' || isInCRM;
