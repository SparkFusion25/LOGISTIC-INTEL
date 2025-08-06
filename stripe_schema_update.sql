-- Add Stripe-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON users(subscription_plan);

-- Create a table to track subscription history
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  subscription_plan TEXT,
  event_type TEXT, -- 'created', 'updated', 'canceled', 'payment_succeeded', 'payment_failed'
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for subscription history
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_stripe_customer_id ON subscription_history(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON subscription_history(created_at);

-- Create a function to automatically log subscription changes
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if subscription-related fields changed
  IF (OLD.subscription_status IS DISTINCT FROM NEW.subscription_status) OR
     (OLD.subscription_plan IS DISTINCT FROM NEW.subscription_plan) OR
     (OLD.stripe_subscription_id IS DISTINCT FROM NEW.stripe_subscription_id) THEN
    
    INSERT INTO subscription_history (
      user_id,
      stripe_customer_id,
      stripe_subscription_id,
      subscription_status,
      subscription_plan,
      event_type,
      event_data
    ) VALUES (
      NEW.id,
      NEW.stripe_customer_id,
      NEW.stripe_subscription_id,
      NEW.subscription_status,
      NEW.subscription_plan,
      'updated',
      jsonb_build_object(
        'old_status', OLD.subscription_status,
        'new_status', NEW.subscription_status,
        'old_plan', OLD.subscription_plan,
        'new_plan', NEW.subscription_plan,
        'old_subscription_id', OLD.stripe_subscription_id,
        'new_subscription_id', NEW.stripe_subscription_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription changes
DROP TRIGGER IF EXISTS trigger_log_subscription_change ON users;
CREATE TRIGGER trigger_log_subscription_change
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_change();

-- Create a view for active subscriptions
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.stripe_customer_id,
  u.stripe_subscription_id,
  u.subscription_status,
  u.subscription_plan,
  u.subscription_current_period_start,
  u.subscription_current_period_end,
  CASE 
    WHEN u.subscription_current_period_end > NOW() THEN true
    ELSE false
  END AS is_active,
  EXTRACT(days FROM (u.subscription_current_period_end - NOW())) AS days_until_renewal
FROM users u
WHERE u.subscription_status IN ('active', 'trialing', 'past_due')
  AND u.stripe_subscription_id IS NOT NULL;

-- Create a view for subscription analytics
CREATE OR REPLACE VIEW subscription_analytics AS
SELECT 
  subscription_plan,
  subscription_status,
  COUNT(*) as user_count,
  COUNT(*) FILTER (WHERE subscription_current_period_end > NOW()) as active_count,
  AVG(EXTRACT(days FROM (subscription_current_period_end - subscription_current_period_start))) as avg_billing_cycle_days
FROM users
WHERE stripe_subscription_id IS NOT NULL
GROUP BY subscription_plan, subscription_status;

-- Insert some example plan limits (these can be used for feature gating)
CREATE TABLE IF NOT EXISTS plan_limits (
  plan_id TEXT PRIMARY KEY,
  searches_per_month INTEGER,
  contacts_per_month INTEGER,
  exports_per_month INTEGER,
  team_members INTEGER,
  features JSONB
);

INSERT INTO plan_limits (plan_id, searches_per_month, contacts_per_month, exports_per_month, team_members, features)
VALUES 
  ('starter', 100, 50, 10, 1, '["basic_search", "basic_analytics"]'::jsonb),
  ('salesProfessional', 500, 250, 50, 1, '["basic_search", "enriched_contacts", "email_automation", "advanced_analytics", "crm_integration"]'::jsonb),
  ('professionalTeam', 2500, 1000, 250, 5, '["basic_search", "enriched_contacts", "email_automation", "advanced_analytics", "crm_integration", "team_management", "custom_integrations", "white_label"]'::jsonb)
ON CONFLICT (plan_id) DO UPDATE SET
  searches_per_month = EXCLUDED.searches_per_month,
  contacts_per_month = EXCLUDED.contacts_per_month,
  exports_per_month = EXCLUDED.exports_per_month,
  team_members = EXCLUDED.team_members,
  features = EXCLUDED.features;

-- Function to check if user has access to a feature
CREATE OR REPLACE FUNCTION user_has_feature(user_id_param UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  plan_features JSONB;
BEGIN
  -- Get user's current plan
  SELECT subscription_plan INTO user_plan
  FROM users 
  WHERE id = user_id_param 
    AND subscription_status IN ('active', 'trialing')
    AND subscription_current_period_end > NOW();
  
  -- If no active subscription, return false
  IF user_plan IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get plan features
  SELECT features INTO plan_features
  FROM plan_limits
  WHERE plan_id = user_plan;
  
  -- Check if feature exists in plan
  RETURN plan_features ? feature_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's plan limits
CREATE OR REPLACE FUNCTION get_user_plan_limits(user_id_param UUID)
RETURNS TABLE(
  plan_id TEXT,
  searches_per_month INTEGER,
  contacts_per_month INTEGER,
  exports_per_month INTEGER,
  team_members INTEGER,
  features JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pl.plan_id,
    pl.searches_per_month,
    pl.contacts_per_month,
    pl.exports_per_month,
    pl.team_members,
    pl.features
  FROM users u
  JOIN plan_limits pl ON pl.plan_id = u.subscription_plan
  WHERE u.id = user_id_param 
    AND u.subscription_status IN ('active', 'trialing')
    AND u.subscription_current_period_end > NOW();
END;
$$ LANGUAGE plpgsql;