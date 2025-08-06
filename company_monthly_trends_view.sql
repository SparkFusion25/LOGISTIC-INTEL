-- =====================================================
-- COMPANY MONTHLY TRENDS VIEW
-- =====================================================
-- Creates a view for 12-month shipment activity trends per company

CREATE OR REPLACE VIEW public.company_monthly_trends AS
SELECT 
  LOWER(TRIM(COALESCE(shipper_name, consignee_name))) AS company_name,
  DATE_TRUNC('month', shipment_date) AS shipment_month,
  COUNT(*) AS shipment_count,
  SUM(COALESCE(value_usd, 0)) AS total_value_usd,
  COUNT(DISTINCT unified_id) AS unique_shipments,
  shipment_type,
  -- Calculate month-over-month change
  LAG(COUNT(*)) OVER (
    PARTITION BY LOWER(TRIM(COALESCE(shipper_name, consignee_name))) 
    ORDER BY DATE_TRUNC('month', shipment_date)
  ) AS previous_month_count
FROM public.trade_data_view
WHERE (shipper_name IS NOT NULL OR consignee_name IS NOT NULL)
  AND (shipper_name != '' OR consignee_name != '')
  AND shipment_date IS NOT NULL
  AND shipment_date >= (CURRENT_DATE - INTERVAL '15 months') -- 15 months for trend calculation
GROUP BY 
  LOWER(TRIM(COALESCE(shipper_name, consignee_name))),
  DATE_TRUNC('month', shipment_date),
  shipment_type
HAVING COUNT(*) > 0
ORDER BY 
  company_name,
  shipment_month DESC;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_company_monthly_trends_company_month 
    ON public.trade_data_view (
      LOWER(TRIM(COALESCE(shipper_name, consignee_name))), 
      DATE_TRUNC('month', shipment_date)
    );

-- Create a summary view for quick company trend insights
CREATE OR REPLACE VIEW public.company_trend_summary AS
SELECT 
  company_name,
  COUNT(DISTINCT shipment_month) AS active_months,
  SUM(shipment_count) AS total_shipments_12m,
  AVG(shipment_count) AS avg_monthly_shipments,
  MAX(shipment_count) AS peak_month_shipments,
  MAX(shipment_month) AS latest_shipment_month,
  MIN(shipment_month) AS earliest_shipment_month,
  -- Trend indicator (positive = growing, negative = declining)
  CASE 
    WHEN COUNT(DISTINCT shipment_month) >= 3 THEN
      (SUM(CASE WHEN shipment_month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months') 
                THEN shipment_count ELSE 0 END) / 3.0) -
      (SUM(CASE WHEN shipment_month < DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months') 
                AND shipment_month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
                THEN shipment_count ELSE 0 END) / 3.0)
    ELSE 0
  END AS trend_indicator,
  -- Status based on recent activity
  CASE 
    WHEN MAX(shipment_month) >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN 'active'
    WHEN MAX(shipment_month) >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months') THEN 'recent'
    WHEN MAX(shipment_month) >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months') THEN 'dormant'
    ELSE 'inactive'
  END AS activity_status
FROM public.company_monthly_trends
WHERE shipment_month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY company_name
HAVING SUM(shipment_count) > 0
ORDER BY total_shipments_12m DESC;

-- Success confirmation
SELECT 'Company monthly trends views created successfully' as status;