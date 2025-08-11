export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ success:true, note:'Supabase env missing; returning empty verification' });
    const supabase = createClient(url, key, { auth: { persistSession:false } });

    const results: any = { timestamp: new Date().toISOString(), database_counts: {}, storage_info: {}, sample_records: {}, issues_found: [] };

    try {
      const { count: oceanCount, error: oceanError } = await supabase.from('ocean_shipments').select('*', { count: 'exact', head: true });
      results.database_counts.ocean_shipments = oceanCount || 0;
      if (oceanError) results.issues_found.push(`ocean_shipments error: ${oceanError.message}`);
    } catch (error) {
      results.issues_found.push(`ocean_shipments query failed: ${(error as Error).message}`);
      results.database_counts.ocean_shipments = 'ERROR';
    }

    try {
      const { count: airCount, error: airError } = await supabase.from('airfreight_shipments').select('*', { count: 'exact', head: true });
      results.database_counts.airfreight_shipments = airCount || 0;
      if (airError) results.issues_found.push(`airfreight_shipments error: ${airError.message}`);
    } catch (error) {
      results.issues_found.push(`airfreight_shipments query failed: ${(error as Error).message}`);
      results.database_counts.airfreight_shipments = 'ERROR';
    }

    try {
      const { count: viewCount, error: viewError } = await supabase.from('trade_data_view').select('*', { count: 'exact', head: true });
      results.database_counts.trade_data_view = viewCount || 0;
      if (viewError) results.issues_found.push(`trade_data_view error: ${viewError.message}`);
    } catch (error) {
      results.issues_found.push(`trade_data_view query failed: ${(error as Error).message}`);
      results.database_counts.trade_data_view = 'ERROR';
    }

    try {
      const { data: oceanSamples, error: oceanSampleError } = await supabase.from('ocean_shipments').select('id, raw_xml_filename, consignee_name, shipper_name, hs_code, value_usd, shipment_date').limit(5);
      results.sample_records.ocean_shipments = oceanSamples || [];
      if (oceanSampleError) results.issues_found.push(`ocean_shipments sample error: ${oceanSampleError.message}`);
    } catch (error) {
      results.issues_found.push(`ocean_shipments sample failed: ${(error as Error).message}`);
    }

    try {
      const { data: viewSamples, error: viewSampleError } = await supabase.from('trade_data_view').select('unified_id, company_name, shipment_type, origin_country, destination_city, hs_code, shipment_date').limit(5);
      results.sample_records.trade_data_view = viewSamples || [];
      if (viewSampleError) results.issues_found.push(`trade_data_view sample error: ${viewSampleError.message}`);
    } catch (error) {
      results.issues_found.push(`trade_data_view sample failed: ${(error as Error).message}`);
    }

    try {
      const { data: companies, error: companyError } = await supabase.from('trade_data_view').select('company_name').not('company_name', 'is', null).limit(1000);
      if (companies) {
        const distinctCompanies = new Set(companies.map(c => c.company_name));
        results.database_counts.distinct_companies = distinctCompanies.size;
        results.sample_records.company_names = Array.from(distinctCompanies).slice(0, 10);
      }
      if (companyError) results.issues_found.push(`distinct companies error: ${companyError.message}`);
    } catch (error) {
      results.issues_found.push(`distinct companies failed: ${(error as Error).message}`);
    }

    try {
      const { data: files, error: storageError } = await supabase.storage.from('raw-xml').list('', { limit: 10 });
      results.storage_info = { bucket_accessible: !storageError, file_count: files ? files.length : 0, sample_files: files ? files.slice(0, 5).map(f => f.name) : [] };
      if (storageError) results.issues_found.push(`Storage error: ${storageError.message}`);
    } catch (error) {
      results.issues_found.push(`Storage check failed: ${(error as Error).message}`);
    }

    const totalRecords = (results.database_counts.ocean_shipments || 0) + (results.database_counts.airfreight_shipments || 0);
    if (totalRecords < 100) results.issues_found.push(`CRITICAL: Only ${totalRecords} total shipment records found`);
    if ((results.database_counts.distinct_companies || 0) < 10) results.issues_found.push(`CRITICAL: Only ${results.database_counts.distinct_companies} distinct companies found`);

    results.analysis = { total_shipment_records: totalRecords, data_ingestion_status: totalRecords > 1000 ? 'HEALTHY' : 'CRITICAL_LOW', xml_files_present: results.storage_info.file_count > 0, recommendation: totalRecords < 100 ? 'XML ingestion may have failed or not been run' : 'Data looks healthy' };

    return NextResponse.json({ success: true, ...results });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Data verification failed', details: (error as Error).message }, { status: 500 });
  }
}