-- Create user_profiles table for comprehensive user management
-- This table extends auth.users with additional application-specific data

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'enterprise')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'trial', 'cancelled')),
  admin_permissions JSONB DEFAULT '[]'::jsonb,
  features_enabled JSONB DEFAULT '[]'::jsonb,
  api_usage_count INTEGER DEFAULT 0,
  api_usage_limit INTEGER DEFAULT 100,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS user_profiles_plan_idx ON public.user_profiles(plan);
CREATE INDEX IF NOT EXISTS user_profiles_subscription_status_idx ON public.user_profiles(subscription_status);

-- Create stripe_customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id SERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for stripe_customers
CREATE INDEX IF NOT EXISTS stripe_customers_user_id_idx ON public.stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS stripe_customers_customer_id_idx ON public.stripe_customers(customer_id);
CREATE INDEX IF NOT EXISTS stripe_customers_subscription_id_idx ON public.stripe_customers(subscription_id);

-- Create outreach_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.outreach_logs (
  id SERIAL PRIMARY KEY,
  crm_contact_id INTEGER REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  campaign_id TEXT,
  unified_id TEXT,
  email_subject TEXT,
  email_body TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE,
  replied BOOLEAN DEFAULT FALSE,
  bounced BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for outreach_logs
CREATE INDEX IF NOT EXISTS outreach_logs_crm_contact_id_idx ON public.outreach_logs(crm_contact_id);
CREATE INDEX IF NOT EXISTS outreach_logs_campaign_id_idx ON public.outreach_logs(campaign_id);
CREATE INDEX IF NOT EXISTS outreach_logs_unified_id_idx ON public.outreach_logs(unified_id);
CREATE INDEX IF NOT EXISTS outreach_logs_status_idx ON public.outreach_logs(status);
CREATE INDEX IF NOT EXISTS outreach_logs_sent_at_idx ON public.outreach_logs(sent_at);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_app_meta_data->>'role') = 'admin'
    )
  );

-- Create RLS policies for stripe_customers
CREATE POLICY "Users can view their own stripe data" ON public.stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stripe data" ON public.stripe_customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_app_meta_data->>'role') = 'admin'
    )
  );

-- Create RLS policies for outreach_logs
CREATE POLICY "Users can view their own outreach logs" ON public.outreach_logs
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own outreach logs" ON public.outreach_logs
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can view all outreach logs" ON public.outreach_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_app_meta_data->>'role') = 'admin'
    )
  );

-- Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_customers_updated_at 
  BEFORE UPDATE ON public.stripe_customers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin permissions and features
INSERT INTO public.user_profiles (
  id, email, full_name, company, role, plan, subscription_status, 
  admin_permissions, features_enabled
)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  'default-admin@system.local',
  'System Administrator',
  'System',
  'admin',
  'enterprise',
  'active',
  '["full_admin", "user_management", "crm_access", "analytics_access", "api_management", "billing_access"]'::jsonb,
  '["unlimited_search", "contact_enrichment", "trend_analysis", "campaign_builder", "advanced_filters", "export_data", "api_access"]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
);

-- Create a view for easy user management
CREATE OR REPLACE VIEW public.user_management_view AS
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.company,
  up.role,
  up.plan,
  up.subscription_status,
  up.admin_permissions,
  up.features_enabled,
  up.api_usage_count,
  up.api_usage_limit,
  up.last_login_at,
  up.created_at,
  up.updated_at,
  au.created_at as auth_created_at,
  au.email_confirmed_at,
  au.last_sign_in_at,
  sc.customer_id as stripe_customer_id,
  sc.subscription_id as stripe_subscription_id,
  sc.current_period_end as subscription_end_date
FROM public.user_profiles up
LEFT JOIN auth.users au ON au.id = up.id
LEFT JOIN public.stripe_customers sc ON sc.user_id = up.id;

-- Grant permissions for the admin testing
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stripe_customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outreach_logs TO authenticated;
GRANT SELECT ON public.user_management_view TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;