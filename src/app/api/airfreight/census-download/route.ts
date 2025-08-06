import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

// Census.gov airfreight data endpoints
const CENSUS_AIRFREIGHT_BASE = 'https://www.census.gov/foreign-trade/statistics/product/aircraft/';

interface AirfreightDownloadJob {
  year: number;
  month: number;
  fileType: 'export' | 'import';
  forceDownload?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { year, month, fileType = 'export', forceDownload = false }: AirfreightDownloadJob = await request.json();

    if (!year || !month) {
      return NextResponse.json(
        { success: false, error: 'Year and month are required' },
        { status: 400 }
      );
    }

    // Validate inputs
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (year < 2020 || year > currentYear || (year === currentYear && month > currentMonth)) {
      return NextResponse.json(
        { success: false, error: 'Invalid year/month combination' },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Format filename according to Census.gov pattern
    const formattedMonth = month.toString().padStart(2, '0');
    const yearShort = year.toString().slice(-2); // Last 2 digits of year
    const filePrefix = fileType === 'export' ? 'airexp' : 'airimp';
    const fileName = `${filePrefix}${year}${formattedMonth}.xls`;
    const fileUrl = `${CENSUS_AIRFREIGHT_BASE}${fileName}`;

    // Check if file already exists and is processed
    if (!forceDownload) {
      const { data: existingSource } = await supabase
        .from('airfreight_data_sources')
        .select('*')
        .eq('file_name', fileName)
        .eq('processing_status', 'completed')
        .single();

      if (existingSource) {
        return NextResponse.json({
          success: true,
          message: 'File already exists and is processed',
          dataSource: existingSource,
          skipped: true
        });
      }
    }

    // Create processing job
    const { data: processingJob, error: jobError } = await supabase
      .from('airfreight_processing_jobs')
      .insert({
        job_type: 'download',
        job_status: 'queued',
        priority: 1,
        scheduled_at: new Date().toISOString(),
        progress_percentage: 0,
        current_step: 'initializing_census_download',
        total_steps: 5,
        created_by: 'census_api'
      })
      .select()
      .single();

    if (jobError) {
      console.error('Failed to create processing job:', jobError);
      return NextResponse.json(
        { success: false, error: 'Failed to create processing job' },
        { status: 500 }
      );
    }

    // Start download process
    const downloadResult = await downloadCensusAirfreightFile(fileUrl, fileName, processingJob.id, year, month);

    return NextResponse.json({
      success: downloadResult.success,
      message: downloadResult.message,
      jobId: processingJob.id,
      dataSource: downloadResult.dataSource,
      downloadUrl: fileUrl,
      fileName
    });

  } catch (error) {
    console.error('Census airfreight download API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const autoDownload = searchParams.get('autoDownload') === 'true';
    const monthsBack = parseInt(searchParams.get('monthsBack') || '3');

    if (autoDownload) {
      // Auto-download last N months of data
      const results = await autoDownloadRecentMonths(monthsBack);
      return NextResponse.json({
        success: true,
        message: `Auto-download initiated for last ${monthsBack} months`,
        results
      });
    }

    // Get download status
    const { data: jobs, error } = await supabase
      .from('airfreight_processing_jobs')
      .select(`
        *,
        data_source:airfreight_data_sources(*)
      `)
      .eq('job_type', 'download')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Failed to fetch download jobs:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch download jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobs: jobs || []
    });

  } catch (error) {
    console.error('Census download GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function downloadCensusAirfreightFile(fileUrl: string, fileName: string, jobId: string, year: number, month: number) {
  try {
    await updateJobProgress(jobId, 'running', 20, 'checking_census_file');

    // Check if file exists at Census.gov
    const response = await fetch(fileUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Logistic-Intel-Airfreight-Bot/1.0 (Trade Intelligence Platform)',
        'Accept': 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*'
      }
    });

    if (!response.ok) {
      await updateJobProgress(jobId, 'failed', 0, 'census_file_not_found', 
        `Census file not available: ${response.status} ${response.statusText}`);
      
      return {
        success: false,
        message: `Census file not available: ${response.status} ${response.statusText}`
      };
    }

    await updateJobProgress(jobId, 'running', 40, 'downloading_census_file');

    // Get actual file content for processing
    const fileResponse = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Logistic-Intel-Airfreight-Bot/1.0 (Trade Intelligence Platform)',
        'Accept': 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*'
      }
    });

    if (!fileResponse.ok) {
      await updateJobProgress(jobId, 'failed', 0, 'download_failed', 
        `Failed to download file: ${fileResponse.status} ${fileResponse.statusText}`);
      
      return {
        success: false,
        message: `Failed to download file: ${fileResponse.status} ${fileResponse.statusText}`
      };
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const fileSize = fileBuffer.byteLength;

    await updateJobProgress(jobId, 'running', 60, 'validating_file_content');

    // Create data source record
    const { data: dataSource, error: sourceError } = await supabase
      .from('airfreight_data_sources')
      .insert({
        source_name: `US Census Airfreight ${fileName}`,
        source_type: 'CENSUS_AIRCRAFT_XLS',
        file_name: fileName,
        file_url: fileUrl,
        file_size_bytes: fileSize,
        file_hash: `sha256:${Date.now()}-${fileSize}`, // In production, calculate actual hash
        download_date: new Date().toISOString(),
        processing_status: 'pending',
        trade_period_start: `${year}-${month.toString().padStart(2, '0')}-01`,
        trade_period_end: new Date(year, month, 0).toISOString().split('T')[0], // Last day of month
        metadata: {
          download_method: 'census_direct',
          file_type: 'xls',
          year,
          month,
          user_agent: 'Logistic-Intel-Airfreight-Bot/1.0',
          response_status: fileResponse.status,
          content_type: fileResponse.headers.get('content-type')
        }
      })
      .select()
      .single();

    if (sourceError) {
      await updateJobProgress(jobId, 'failed', 0, 'database_error', 
        `Failed to create data source record: ${sourceError.message}`);
      
      return {
        success: false,
        message: `Failed to create data source record: ${sourceError.message}`
      };
    }

    // Update job with data source reference
    await supabase
      .from('airfreight_processing_jobs')
      .update({ data_source_id: dataSource.id })
      .eq('id', jobId);

    await updateJobProgress(jobId, 'running', 80, 'preparing_for_parsing');

    // Complete download job
    await updateJobProgress(jobId, 'completed', 100, 'census_download_completed');

    // Automatically queue parsing job
    await supabase
      .from('airfreight_processing_jobs')
      .insert({
        job_type: 'parse',
        job_status: 'queued',
        data_source_id: dataSource.id,
        priority: 2,
        scheduled_at: new Date(Date.now() + 3000).toISOString(), // Schedule 3 seconds later
        progress_percentage: 0,
        current_step: 'waiting_for_census_parser',
        total_steps: 8,
        created_by: 'census_download_job'
      });

    return {
      success: true,
      message: `Census airfreight file downloaded successfully: ${fileName}`,
      dataSource
    };

  } catch (error) {
    await updateJobProgress(jobId, 'failed', 0, 'download_error', 
      error instanceof Error ? error.message : 'Unknown download error');
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown download error'
    };
  }
}

async function autoDownloadRecentMonths(monthsBack: number) {
  const results = [];
  const currentDate = new Date();
  
  for (let i = 1; i <= monthsBack; i++) {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    
    try {
      const formattedMonth = month.toString().padStart(2, '0');
      const fileName = `airexp${year}${formattedMonth}.xls`;
      
      // Check if already downloaded
      const { data: existing } = await supabase
        .from('airfreight_data_sources')
        .select('id, processing_status')
        .eq('file_name', fileName)
        .single();
      
      if (existing && existing.processing_status === 'completed') {
        results.push({
          year,
          month,
          fileName,
          status: 'skipped',
          message: 'Already processed'
        });
        continue;
      }
      
      // Initiate download
      const response = await fetch('/api/airfreight/census-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, fileType: 'export' })
      });
      
      const result = await response.json();
      results.push({
        year,
        month,
        fileName,
        status: result.success ? 'initiated' : 'failed',
        message: result.message,
        jobId: result.jobId
      });
      
    } catch (error) {
      results.push({
        year,
        month,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

async function updateJobProgress(
  jobId: string, 
  status: string, 
  progress: number, 
  step: string, 
  errorMessage?: string
) {
  const updateData: any = {
    job_status: status,
    progress_percentage: progress,
    current_step: step,
    updated_at: new Date().toISOString()
  };

  if (status === 'running' && progress === 20) {
    updateData.started_at = new Date().toISOString();
  }

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  await supabase
    .from('airfreight_processing_jobs')
    .update(updateData)
    .eq('id', jobId);
}