-- CONFIDENCE SCORING ENGINE SCHEMA UPDATE
-- Mission-critical production upgrade for intelligent freight matching

-- Step 1: Add confidence scoring to existing tables
ALTER TABLE census_trade_data ADD COLUMN IF NOT EXISTS confidence_score INT DEFAULT 0;
ALTER TABLE t100_air_segments ADD COLUMN IF NOT EXISTS confidence_score INT DEFAULT 0;

-- Step 2: Learning-based company mapping table
CREATE TABLE IF NOT EXISTS company_hs_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  hs_code TEXT NOT NULL,
  country TEXT NOT NULL,
  confidence_override INT CHECK (confidence_override >= 0 AND confidence_override <= 100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_name, hs_code, country)
);

-- Step 3: User feedback integration table
CREATE TABLE IF NOT EXISTS company_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_company_name TEXT NOT NULL,
  corrected_company_name TEXT,
  hs_code TEXT,
  country TEXT,
  user_id UUID,
  confidence_at_time INT,
  feedback_type TEXT CHECK (feedback_type IN ('correct', 'incorrect', 'correction')),
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Search analytics table
CREATE TABLE IF NOT EXISTS search_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  search_term TEXT,
  filter_applied JSONB,
  result_count INT,
  avg_confidence_score DECIMAL(5,2),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Step 5: Company confidence cache table (for performance)
CREATE TABLE IF NOT EXISTS company_confidence_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  hs_code TEXT,
  country TEXT,
  apollo_verified BOOLEAN DEFAULT FALSE,
  bts_route_match BOOLEAN DEFAULT FALSE,
  port_zip_match BOOLEAN DEFAULT FALSE,
  total_confidence_score INT,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_name, hs_code, country)
);

-- Insert initial high-confidence company mappings
INSERT INTO company_hs_map (company_name, hs_code, country, confidence_override) VALUES
-- Electronics & Technology
('Samsung Electronics Co Ltd', '8528720000', 'South Korea', 95),
('Samsung Display Co Ltd', '8528720000', 'South Korea', 90),
('LG Electronics Inc', '8471600000', 'South Korea', 90),
('LG Display Co Ltd', '8528720000', 'South Korea', 85),
('Sony Corporation', '8518300000', 'Japan', 90),
('Sony Electronics Inc', '8528720000', 'Japan', 85),
('Lenovo Group Limited', '8471600000', 'China', 85),
('Huawei Technologies Co Ltd', '8471600000', 'China', 80),
-- Medical Equipment
('Siemens Healthineers AG', '9018390000', 'Germany', 90),
('B. Braun Melsungen AG', '9018390000', 'Germany', 85),
('Medtronic Inc', '9018390000', 'United States', 90),
('Abbott Laboratories', '9018390000', 'United States', 85),
-- Audio & Technology
('Audio-Technica Corporation', '8518300000', 'Japan', 85),
('Sennheiser Electronic', '8518300000', 'Germany', 85),
('Bose Corporation', '8518300000', 'United States', 85)
ON CONFLICT (company_name, hs_code, country) DO UPDATE SET
  confidence_override = EXCLUDED.confidence_override,
  updated_at = NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_hs_map_lookup ON company_hs_map(hs_code, country);
CREATE INDEX IF NOT EXISTS idx_confidence_cache_lookup ON company_confidence_cache(company_name, hs_code);
CREATE INDEX IF NOT EXISTS idx_search_log_timestamp ON search_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_company_feedback_company ON company_feedback(original_company_name);

-- Create function to calculate confidence score
CREATE OR REPLACE FUNCTION calculate_confidence_score(
  hs_code_param TEXT,
  commodity_name_param TEXT DEFAULT NULL,
  country_param TEXT DEFAULT NULL,
  consignee_zip_param TEXT DEFAULT NULL,
  port_origin_param TEXT DEFAULT NULL,
  has_apollo_contact BOOLEAN DEFAULT FALSE,
  has_bts_route BOOLEAN DEFAULT FALSE
) RETURNS INT AS $$
DECLARE
  score INT := 0;
  company_mapping_exists BOOLEAN := FALSE;
BEGIN
  -- HS Code + Country mapping to known company (+25 points)
  SELECT EXISTS(
    SELECT 1 FROM company_hs_map 
    WHERE hs_code = hs_code_param AND country = country_param
  ) INTO company_mapping_exists;
  
  IF company_mapping_exists THEN
    score := score + 25;
  END IF;
  
  -- Commodity keyword match (+15 points)
  IF commodity_name_param IS NOT NULL THEN
    IF commodity_name_param ILIKE '%electronic%' OR 
       commodity_name_param ILIKE '%computer%' OR 
       commodity_name_param ILIKE '%display%' OR
       commodity_name_param ILIKE '%medical%' OR
       commodity_name_param ILIKE '%audio%' THEN
      score := score + 15;
    END IF;
  END IF;
  
  -- ZIP Code or Port matches known HQ ZIP (+20 points)
  IF consignee_zip_param IS NOT NULL OR port_origin_param IS NOT NULL THEN
    -- Known major trade ZIP codes
    IF consignee_zip_param IN ('90210', '10001', '77001', '60601', '33101', '98101') OR
       port_origin_param IN ('Los Angeles', 'New York', 'Houston', 'Chicago', 'Miami', 'Seattle') THEN
      score := score + 20;
    END IF;
  END IF;
  
  -- Port of Origin/Airport matches company (+10 points)
  IF port_origin_param IS NOT NULL THEN
    IF (country_param = 'South Korea' AND port_origin_param ILIKE '%ICN%') OR
       (country_param = 'Japan' AND port_origin_param ILIKE '%NRT%') OR
       (country_param = 'China' AND port_origin_param ILIKE '%PVG%') OR
       (country_param = 'Germany' AND port_origin_param ILIKE '%FRA%') THEN
      score := score + 10;
    END IF;
  END IF;
  
  -- BTS air route matches known corridor (+15 points)
  IF has_bts_route THEN
    score := score + 15;
  END IF;
  
  -- Apollo contact exists (+15 points)
  IF has_apollo_contact THEN
    score := score + 15;
  END IF;
  
  -- Cap at 100
  IF score > 100 THEN
    score := 100;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;