// Authentication and Permission Helpers for Gated Features
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  role: 'user' | 'admin' | 'enterprise';
  plan: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'trial' | 'cancelled';
  admin_permissions?: string[];
  features_enabled?: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  plan: string;
  isAdmin: boolean;
  isPremium: boolean;
  permissions: string[];
}

export const getAuthUser = async (): Promise<AuthUser | null> => {
  const supabase = createClientComponentClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Get user metadata from auth.users
    const role = user.app_metadata?.role || 'user';
    const plan = user.app_metadata?.plan || 'free';
    const adminLevel = user.app_metadata?.admin_level || 'none';
    
    // Check if user is admin or premium
    const isAdmin = role === 'admin' || adminLevel === 'full';
    const isPremium = plan === 'pro' || plan === 'enterprise' || isAdmin;
    
    // Get permissions from user metadata
    const permissions = user.app_metadata?.permissions || [];
    
    return {
      id: user.id,
      email: user.email || '',
      role,
      plan,
      isAdmin,
      isPremium,
      permissions
    };
  } catch (error) {
    console.error('Error fetching auth user:', error);
    return null;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const supabase = createClientComponentClient();
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

export const hasPermission = (user: AuthUser | null, permission: string): boolean => {
  if (!user) return false;
  if (user.isAdmin) return true; // Admins have all permissions
  return user.permissions.includes(permission);
};

export const canAccessFeature = (user: AuthUser | null, feature: string): boolean => {
  if (!user) return false;
  
  const featurePermissions: Record<string, string[]> = {
    'contact_enrichment': ['pro', 'enterprise'],
    'trend_analysis': ['pro', 'enterprise'],
    'campaign_builder': ['pro', 'enterprise'],
    'advanced_filters': ['pro', 'enterprise'],
    'export_data': ['pro', 'enterprise'],
    'unlimited_search': ['pro', 'enterprise'],
    'api_access': ['enterprise'],
    'admin_panel': ['admin'],
    'user_management': ['admin'],
    'billing_access': ['admin'],
    'analytics_access': ['admin', 'enterprise']
  };
  
  const requiredPlans = featurePermissions[feature] || [];
  return user.isAdmin || requiredPlans.includes(user.plan);
};

export const getFeatureGateMessage = (feature: string): string => {
  const messages: Record<string, string> = {
    'contact_enrichment': 'Upgrade to Pro to unlock contact details and email addresses',
    'trend_analysis': 'Upgrade to Pro to view shipment trends and analytics',
    'campaign_builder': 'Upgrade to Pro to create and manage email campaigns',
    'advanced_filters': 'Upgrade to Pro to access advanced search filters',
    'export_data': 'Upgrade to Pro to export search results and reports',
    'unlimited_search': 'Upgrade to Pro for unlimited search results',
    'api_access': 'Upgrade to Enterprise for API access and integrations',
    'admin_panel': 'Admin access required to view this feature',
    'user_management': 'Admin access required to manage users',
    'billing_access': 'Admin access required to view billing information'
  };
  
  return messages[feature] || 'Upgrade your plan to access this feature';
};

// Test admin credentials
export const TEST_ADMIN_CREDENTIALS = {
  email: 'info@getb3acon.com',
  password: '7354'
};

// Helper to check if current user is the test admin
export const isTestAdmin = (user: AuthUser | null): boolean => {
  return user?.email === TEST_ADMIN_CREDENTIALS.email && user?.isAdmin;
};

// Mock user for development/testing
export const createMockAdminUser = (): AuthUser => ({
  id: 'test-admin-id',
  email: TEST_ADMIN_CREDENTIALS.email,
  role: 'admin',
  plan: 'enterprise',
  isAdmin: true,
  isPremium: true,
  permissions: [
    'full_admin',
    'user_management', 
    'crm_access',
    'analytics_access',
    'api_management',
    'billing_access',
    'contact_enrichment',
    'trend_analysis',
    'campaign_builder',
    'advanced_filters',
    'export_data',
    'unlimited_search'
  ]
});

export default {
  getAuthUser,
  getUserProfile,
  hasPermission,
  canAccessFeature,
  getFeatureGateMessage,
  isTestAdmin,
  createMockAdminUser
};