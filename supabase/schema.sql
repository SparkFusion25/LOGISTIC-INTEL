-- Logistic Intel Platform - Complete Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS outreach_history CASCADE;
DROP TABLE IF EXISTS follow_up_executions CASCADE;
DROP TABLE IF EXISTS follow_up_rules CASCADE;
DROP TABLE IF EXISTS persona_profiles CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS widgets CASCADE;
DROP TABLE IF EXISTS email_activity CASCADE;
DROP TABLE IF EXISTS api_endpoints CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;

-- Users table (for main platform users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    company VARCHAR(255),
    title VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'trial' CHECK (role IN ('trial', 'pro', 'enterprise')),
    plan_status VARCHAR(50) DEFAULT 'active' CHECK (plan_status IN ('active', 'inactive', 'suspended')),
    signup_date TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    active_widgets TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin users table (for admin panel access)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
    password_hash TEXT NOT NULL,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Contacts table (CRM)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    company VARCHAR(255),
    title VARCHAR(255),
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    stage VARCHAR(50) DEFAULT 'Prospect' CHECK (stage IN ('Prospect', 'Contacted', 'Nurturing', 'Converted')),
    source VARCHAR(50) DEFAULT 'Manual' CHECK (source IN ('Search', 'Manual', 'Campaign', 'Import')),
    notes TEXT,
    last_contacted TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'email' CHECK (type IN ('email', 'linkedin', 'mixed')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    total_steps INTEGER DEFAULT 1,
    trade_lane VARCHAR(255),
    industry VARCHAR(255),
    target_persona JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Outreach History table
CREATE TABLE outreach_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('gmail', 'outlook', 'linkedin')),
    type VARCHAR(50) NOT NULL CHECK (type IN ('sent', 'opened', 'replied', 'clicked', 'bounced')),
    subject VARCHAR(500),
    snippet TEXT,
    full_content TEXT,
    engagement_status VARCHAR(50) DEFAULT 'sent' CHECK (engagement_status IN ('sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced')),
    thread_id VARCHAR(255),
    gmail_message_id VARCHAR(255),
    linkedin_url VARCHAR(500),
    timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Persona Profiles table
CREATE TABLE persona_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    trade_lane JSONB,
    demographics JSONB,
    pain_points TEXT[],
    motivations TEXT[],
    communication_style VARCHAR(50) CHECK (communication_style IN ('formal', 'casual', 'technical', 'relationship-focused')),
    buying_stage VARCHAR(50) CHECK (buying_stage IN ('cold', 'warm', 'hot')),
    preferred_channels TEXT[],
    key_messages TEXT[],
    objections TEXT[],
    success_metrics TEXT[],
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    based_on_contacts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Follow-up Rules table
CREATE TABLE follow_up_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    method VARCHAR(50) NOT NULL CHECK (method IN ('Gmail', 'Outlook', 'LinkedIn')),
    template_id VARCHAR(255),
    template_name VARCHAR(255),
    delay INTEGER NOT NULL,
    delay_unit VARCHAR(20) NOT NULL CHECK (delay_unit IN ('hours', 'days', 'weeks')),
    smart_timing BOOLEAN DEFAULT false,
    conditions JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    next_execution TIMESTAMP,
    last_executed TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Follow-up Executions table
CREATE TABLE follow_up_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES follow_up_rules(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'opened', 'replied', 'failed')),
    scheduled_for TIMESTAMP NOT NULL,
    executed_at TIMESTAMP,
    subject VARCHAR(500),
    template_used VARCHAR(255),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Widgets table
CREATE TABLE widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    last_used TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Email Activity table (for admin monitoring)
CREATE TABLE email_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    subject VARCHAR(500),
    recipient VARCHAR(255),
    status VARCHAR(50) CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced')),
    domain VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- API Endpoints table (for monitoring)
CREATE TABLE api_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'unknown' CHECK (status IN ('up', 'down', 'degraded', 'unknown')),
    uptime_percentage DECIMAL(5,2) DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0,
    last_error TEXT,
    last_checked TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request', 'support', 'feedback')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_stage ON contacts(stage);
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_outreach_history_contact_id ON outreach_history(contact_id);
CREATE INDEX idx_outreach_history_platform ON outreach_history(platform);
CREATE INDEX idx_outreach_history_timestamp ON outreach_history(timestamp);
CREATE INDEX idx_follow_up_rules_user_id ON follow_up_rules(user_id);
CREATE INDEX idx_follow_up_rules_status ON follow_up_rules(status);
CREATE INDEX idx_follow_up_executions_rule_id ON follow_up_executions(rule_id);
CREATE INDEX idx_email_activity_user_id ON email_activity(user_id);
CREATE INDEX idx_email_activity_timestamp ON email_activity(timestamp);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, name, role, password_hash) VALUES 
('admin@logisticintel.com', 'Demo Administrator', 'super_admin', crypt('admin123', gen_salt('bf')));

-- Insert default widgets
INSERT INTO widgets (name, display_name, description, usage_count, active_users) VALUES 
('tariff_calculator', 'Tariff Calculator', 'Calculate import tariffs and duties', 1250, 340),
('quote_generator', 'Quote Generator', 'Generate shipping quotes for air/ocean freight', 890, 245),
('campaign_builder', 'Campaign Builder', 'Create email and LinkedIn outreach campaigns', 567, 127),
('crm_lookup', 'CRM Lookup', 'Search and manage trade contacts', 423, 98),
('market_benchmark', 'Market Benchmark', 'Compare freight rates and market data', 234, 67),
('trade_search', 'Trade Search', 'Search global trade intelligence data', 789, 156);

-- Insert default API endpoints
INSERT INTO api_endpoints (name, url, status, uptime_percentage, avg_response_time, last_checked) VALUES 
('Comtrade API', 'https://comtradeapi.un.org', 'up', 99.2, 450, NOW()),
('US Census API', 'https://api.census.gov', 'up', 98.7, 320, NOW()),
('DataForSEO API', 'https://api.dataforseo.com', 'degraded', 95.1, 1200, NOW()),
('Flexport API', 'https://api.flexport.com', 'up', 97.8, 680, NOW()),
('Freightos API', 'https://api.freightos.com', 'up', 99.5, 290, NOW());

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for users to access their own data
CREATE POLICY "Users can view own data" ON contacts FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own campaigns" ON campaigns FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own outreach" ON outreach_history FOR ALL TO authenticated 
  USING (contact_id IN (SELECT id FROM contacts WHERE user_id = auth.uid()));
CREATE POLICY "Users can view own personas" ON persona_profiles FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own follow-up rules" ON follow_up_rules FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own executions" ON follow_up_executions FOR ALL TO authenticated 
  USING (contact_id IN (SELECT id FROM contacts WHERE user_id = auth.uid()));
CREATE POLICY "Users can view own email activity" ON email_activity FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own feedback" ON feedback FOR ALL TO authenticated USING (user_id = auth.uid());

-- Admin access policies (bypass user restrictions)
CREATE POLICY "Admins can view all data" ON contacts FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can view all campaigns" ON campaigns FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can view all outreach" ON outreach_history FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can view all personas" ON persona_profiles FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_profiles_updated_at BEFORE UPDATE ON persona_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_up_rules_updated_at BEFORE UPDATE ON follow_up_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widgets_updated_at BEFORE UPDATE ON widgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_endpoints_updated_at BEFORE UPDATE ON api_endpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert sample data for demonstration
INSERT INTO users (email, name, company, title, role, plan_status, usage_count, active_widgets) VALUES 
('john@acme.com', 'John Smith', 'ACME Corp', 'Supply Chain Director', 'enterprise', 'active', 245, ARRAY['tariff_calculator', 'quote_generator', 'campaign_builder']),
('sarah@globaltrade.com', 'Sarah Chen', 'Global Trade Inc', 'Procurement Manager', 'pro', 'active', 198, ARRAY['tariff_calculator', 'crm_lookup']),
('mike@logistics.com', 'Mike Johnson', 'Logistics Pro', 'Operations Manager', 'trial', 'active', 176, ARRAY['quote_generator']);

-- Get the user IDs for foreign key references
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    contact1_id UUID;
    contact2_id UUID;
    contact3_id UUID;
    campaign1_id UUID;
    campaign2_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO user1_id FROM users WHERE email = 'john@acme.com';
    SELECT id INTO user2_id FROM users WHERE email = 'sarah@globaltrade.com';
    SELECT id INTO user3_id FROM users WHERE email = 'mike@logistics.com';

    -- Insert sample contacts
    INSERT INTO contacts (id, user_id, name, email, company, title, stage, source, last_contacted) VALUES 
    (uuid_generate_v4(), user1_id, 'Sarah Chen', 'sarah.chen@techglobal.com', 'TechGlobal Solutions', 'Supply Chain Director', 'Nurturing', 'Search', NOW() - INTERVAL '2 days'),
    (uuid_generate_v4(), user1_id, 'Michael Wong', 'michael.wong@electronics-plus.com', 'Electronics Plus', 'Procurement Manager', 'Contacted', 'Campaign', NOW() - INTERVAL '5 days'),
    (uuid_generate_v4(), user2_id, 'Jennifer Liu', 'jennifer.liu@smart-devices.com', 'Smart Devices Inc', 'Logistics Manager', 'Prospect', 'Manual', NOW() - INTERVAL '1 day');

    -- Get contact IDs
    SELECT id INTO contact1_id FROM contacts WHERE email = 'sarah.chen@techglobal.com';
    SELECT id INTO contact2_id FROM contacts WHERE email = 'michael.wong@electronics-plus.com';
    SELECT id INTO contact3_id FROM contacts WHERE email = 'jennifer.liu@smart-devices.com';

    -- Insert sample campaigns
    INSERT INTO campaigns (id, user_id, name, description, type, status, total_steps, trade_lane, industry) VALUES 
    (uuid_generate_v4(), user1_id, 'China Electronics Q1 2024', 'Targeting electronics importers from China', 'email', 'active', 5, 'China → USA', 'Electronics'),
    (uuid_generate_v4(), user2_id, 'Asia-Pacific Partnership Drive', 'LinkedIn outreach for freight partnerships', 'linkedin', 'active', 3, 'Asia → USA', 'Logistics');

    -- Get campaign IDs
    SELECT id INTO campaign1_id FROM campaigns WHERE name = 'China Electronics Q1 2024';
    SELECT id INTO campaign2_id FROM campaigns WHERE name = 'Asia-Pacific Partnership Drive';

    -- Insert sample outreach history
    INSERT INTO outreach_history (contact_id, campaign_id, platform, type, subject, snippet, full_content, engagement_status, timestamp) VALUES 
    (contact1_id, campaign1_id, 'gmail', 'replied', 'Re: Competitive shipping rates for electronics imports', 'Thanks for reaching out! We''re definitely interested in exploring more cost-effective shipping options...', 'Thanks for reaching out! We''re definitely interested in exploring more cost-effective shipping options for our China imports. Our current rates are quite high and we''re looking for alternatives. Could we schedule a call this week to discuss our requirements in detail?', 'replied', NOW() - INTERVAL '1 day'),
    (contact1_id, campaign1_id, 'linkedin', 'sent', 'LinkedIn Connection Request', 'Hi Sarah, I sent you an email about shipping solutions for TechGlobal...', 'Hi Sarah, I sent you an email about shipping solutions for TechGlobal. Would love to connect and discuss how we can help optimize your electronics imports from China.', 'sent', NOW() - INTERVAL '3 days'),
    (contact2_id, campaign1_id, 'gmail', 'opened', 'Partnership opportunity for Asia-Pacific trade', 'Hello Michael, Electronics Plus appears to be a major importer...', 'Hello Michael, Electronics Plus appears to be a major importer from China and South Korea. We have extensive experience in Asia-Pacific logistics and would like to explore a partnership opportunity.', 'opened', NOW() - INTERVAL '5 days');

    -- Insert sample feedback
    INSERT INTO feedback (user_id, type, title, description, status, priority) VALUES 
    (user1_id, 'bug', 'Tariff calculator not loading', 'The tariff calculator widget shows a loading spinner indefinitely', 'in_progress', 'high'),
    (user2_id, 'feature_request', 'Export campaign results to Excel', 'Would like to export campaign analytics to Excel format', 'new', 'medium');

END $$;