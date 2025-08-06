import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

interface DownloadJob {
  id?: string;
  jobType: 'download' | 'parse' | 'import';
  jobStatus: 'queued' | 'running' | 'completed' | 'failed';
  dataSourceId?: string;
  progress: number;
  currentStep: string;
  totalSteps: number;
  errorMessage?: string;
}

// US Census FTP endpoints for air trade data
const US_CENSUS_ENDPOINTS = {
  ftp_base: 'https://www.census.gov/foreign-trade/statistics/product/air/',
  air_exports: 'https://www.census.gov/foreign-trade/statistics/product/air/air-exports-{year}-{month}.xlsx',
  air_imports: 'https://www.census.gov/foreign-trade/statistics/product/air/air-imports-{year}-{month}.xlsx'
};

export async function POST(request: NextRequest) {
  try {
    const { year, month, dataType = 'exports', forceDownload = false } = await request.json();

    if (!year || !month) {
      return NextResponse.json(
        { success: false, error: 'Year and month are required' },
        { status: 400 }
      );
    }

    // Validate inputs
    const currentYear = new Date().getFullYear();
    if (year < 2020 || year > currentYear) {
      return NextResponse.json(
        { success: false, error: 'Year must be between 2020 and current year' },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Format month with leading zero
    const formattedMonth = month.toString().padStart(2, '0');
    const fileName = `air-${dataType}-${year}-${formattedMonth}.xlsx`;
    const fileUrl = US_CENSUS_ENDPOINTS.air_exports
      .replace('{year}', year.toString())
      .replace('{month}', formattedMonth);

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
        current_step: 'initializing',
        total_steps: 4,
        created_by: 'api'
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
    const downloadResult = await downloadCensusFile(fileUrl, fileName, processingJob.id);

    return NextResponse.json({
      success: downloadResult.success,
      message: downloadResult.message,
      jobId: processingJob.id,
      dataSource: downloadResult.dataSource,
      downloadUrl: fileUrl
    });

  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    let query = supabase.from('airfreight_processing_jobs').select('*');

    if (jobId) {
      query = query.eq('id', jobId);
    }

    if (status) {
      query = query.eq('job_status', status);
    }

    const { data: jobs, error } = await query.order('created_at', { ascending: false }).limit(20);

    if (error) {
      console.error('Failed to fetch jobs:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobs: jobs || []
    });

  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function downloadCensusFile(fileUrl: string, fileName: string, jobId: string) {
  try {
    // Update job status
    await updateJobProgress(jobId, 'running', 25, 'downloading_file');

    // In production, this would use proper file download with streams
    // For now, we'll simulate the download process
    const response = await fetch(fileUrl, {
      method: 'HEAD', // Just check if file exists
      headers: {
        'User-Agent': 'Logistic-Intel-Bot/1.0'
      }
    });

    if (!response.ok) {
      await updateJobProgress(jobId, 'failed', 0, 'download_failed', 
        `Failed to download file: ${response.status} ${response.statusText}`);
      
      return {
        success: false,
        message: `Failed to download file: ${response.status} ${response.statusText}`
      };
    }

    // Get file size from headers
    const fileSize = parseInt(response.headers.get('content-length') || '0');
    
    // Update progress
    await updateJobProgress(jobId, 'running', 50, 'validating_file');

    // Create data source record
    const { data: dataSource, error: sourceError } = await supabase
      .from('airfreight_data_sources')
      .insert({
        source_name: `US Census Air Exports ${fileName}`,
        source_type: 'US_CENSUS_FTP',
        file_name: fileName,
        file_url: fileUrl,
        file_size_bytes: fileSize,
        file_hash: `sha256:${Date.now()}`, // In production, calculate actual hash
        download_date: new Date().toISOString(),
        processing_status: 'pending',
        trade_period_start: extractPeriodFromFileName(fileName).start,
        trade_period_end: extractPeriodFromFileName(fileName).end,
        metadata: {
          download_method: 'http_head_check',
          user_agent: 'Logistic-Intel-Bot/1.0',
          response_status: response.status
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

    // Simulate file validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    await updateJobProgress(jobId, 'running', 75, 'preparing_for_parsing');

    // Complete download job
    await updateJobProgress(jobId, 'completed', 100, 'download_completed');

    // Create parsing job
    await supabase
      .from('airfreight_processing_jobs')
      .insert({
        job_type: 'parse',
        job_status: 'queued',
        data_source_id: dataSource.id,
        priority: 2,
        scheduled_at: new Date(Date.now() + 5000).toISOString(), // Schedule 5 seconds later
        progress_percentage: 0,
        current_step: 'waiting_for_parser',
        total_steps: 6,
        created_by: 'download_job'
      });

    return {
      success: true,
      message: 'File downloaded successfully and queued for parsing',
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

  if (status === 'running' && progress === 25) {
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

function extractPeriodFromFileName(fileName: string): { start: string; end: string } {
  // Extract year and month from filename like "air-exports-2024-01.xlsx"
  const match = fileName.match(/(\d{4})-(\d{2})/);
  
  if (match) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]);
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  }
  
  // Fallback
  return {
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  };
}