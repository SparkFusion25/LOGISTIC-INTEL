'use client';

import { useState } from 'react';

export default function TestAirfreightPage() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const initializeAirfreightSchema = async () => {
    setIsLoading(true);
    setStatus('✈️ Initializing Airfreight Schema...');

    try {
      const response = await fetch('/api/init-airfreight-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Airfreight schema initialized successfully!\n\n' + JSON.stringify(result.details, null, 2));
      } else {
        setStatus('❌ Airfreight schema initialization failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error initializing airfreight schema:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testDownload = async () => {
    setIsLoading(true);
    setStatus('📥 Testing Census Data Download...');

    try {
      const response = await fetch('/api/airfreight/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: 2024,
          month: 1,
          dataType: 'exports',
          forceDownload: false
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Download test successful!\n\n' + 
          `Job ID: ${result.jobId}\n` +
          `Message: ${result.message}\n` +
          `Download URL: ${result.downloadUrl}\n\n` +
          JSON.stringify(result.dataSource, null, 2));
      } else {
        setStatus('❌ Download test failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error testing download:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testParsing = async () => {
    setIsLoading(true);
    setStatus('📊 Testing Excel Parsing...');

    try {
      // First get a data source to parse
      const jobsResponse = await fetch('/api/airfreight/download?status=completed');
      const jobsData = await jobsResponse.json();
      
      if (!jobsData.success || !jobsData.jobs || jobsData.jobs.length === 0) {
        setStatus('❌ No completed download jobs found. Please run download test first.');
        return;
      }

      const completedJob = jobsData.jobs[0];
      
      // Test parsing
      const response = await fetch('/api/airfreight/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataSourceId: completedJob.data_source_id,
          forceReparse: true
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Parsing test successful!\n\n' + 
          `Job ID: ${result.jobId}\n` +
          `Message: ${result.message}\n` +
          `Records Processed: ${result.recordsProcessed}\n\n` +
          JSON.stringify(result.summary, null, 2));
      } else {
        setStatus('❌ Parsing test failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error testing parsing:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testInsights = async () => {
    setIsLoading(true);
    setStatus('🔍 Testing Airfreight Insights...');

    try {
      const response = await fetch('/api/airfreight/insights?aggregation=summary&limit=10');
      const result = await response.json();

      if (result.success) {
        setStatus('✅ Insights test successful!\n\n' + 
          `Aggregation Type: ${result.aggregation_type}\n\n` +
          JSON.stringify(result.data, null, 2));
      } else {
        setStatus('❌ Insights test failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error testing insights:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testCarrierAnalysis = async () => {
    setIsLoading(true);
    setStatus('🚛 Testing Carrier Analysis...');

    try {
      const response = await fetch('/api/airfreight/insights?aggregation=carriers');
      const result = await response.json();

      if (result.success) {
        setStatus('✅ Carrier analysis successful!\n\n' + 
          `Top Carriers by Value:\n` +
          result.data.slice(0, 5).map((carrier: any, index: number) => 
            `${index + 1}. ${carrier.carrier_name}: $${carrier.total_value_usd?.toLocaleString()} (${carrier.total_shipments} shipments)`
          ).join('\n') + '\n\n' +
          JSON.stringify(result.data.slice(0, 3), null, 2));
      } else {
        setStatus('❌ Carrier analysis failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error testing carrier analysis:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testCommodityBreakdown = async () => {
    setIsLoading(true);
    setStatus('📦 Testing Commodity Breakdown...');

    try {
      const response = await fetch('/api/airfreight/insights?aggregation=commodities');
      const result = await response.json();

      if (result.success) {
        setStatus('✅ Commodity breakdown successful!\n\n' + 
          `Top Commodities by Value:\n` +
          result.data.slice(0, 5).map((commodity: any, index: number) => 
            `${index + 1}. ${commodity.hs_code} - ${commodity.hs_description?.substring(0, 50)}...: $${commodity.total_value_usd?.toLocaleString()}`
          ).join('\n') + '\n\n' +
          JSON.stringify(result.data.slice(0, 2), null, 2));
      } else {
        setStatus('❌ Commodity breakdown failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error testing commodity breakdown:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testAdvancedFilters = async () => {
    setIsLoading(true);
    setStatus('🔎 Testing Advanced Filters...');

    try {
      const response = await fetch('/api/airfreight/insights?' + new URLSearchParams({
        country_origin: 'CN',
        destination_state: 'CA',
        min_value: '50000',
        sort_by: 'value_usd',
        sort_order: 'desc',
        limit: '5'
      }));

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Advanced filters test successful!\n\n' + 
          `Filters Applied: ${JSON.stringify(result.filters_applied, null, 2)}\n\n` +
          `Summary: ${JSON.stringify(result.summary, null, 2)}\n\n` +
          `Sample Records:\n` +
          result.data.slice(0, 3).map((record: any, index: number) => 
            `${index + 1}. ${record.hs_code} from ${record.country_origin} to ${record.arrival_city}, ${record.destination_state}: $${record.value_usd?.toLocaleString()}`
          ).join('\n'));
      } else {
        setStatus('❌ Advanced filters test failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error testing advanced filters:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            ✈️ Airfreight Insights Test Suite
          </h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <button
              onClick={initializeAirfreightSchema}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '🗄️ Init Schema'}
            </button>

            <button
              onClick={testDownload}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '📥 Test Download'}
            </button>

            <button
              onClick={testParsing}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '📊 Test Parsing'}
            </button>

            <button
              onClick={testInsights}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '🔍 Test Insights'}
            </button>

            <button
              onClick={testCarrierAnalysis}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '🚛 Carrier Analysis'}
            </button>

            <button
              onClick={testCommodityBreakdown}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '📦 Commodity Breakdown'}
            </button>

            <button
              onClick={testAdvancedFilters}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '🔎 Advanced Filters'}
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Test Results</h2>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
              {status || 'Click a button above to run airfreight tests...'}
            </pre>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Airfreight System Features
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Automated US Census data downloads</li>
                      <li>Excel file parsing with SheetJS</li>
                      <li>Real-time job processing tracking</li>
                      <li>Advanced filtering and aggregations</li>
                      <li>Carrier performance analytics</li>
                      <li>Trade lane analysis</li>
                      <li>Commodity breakdown insights</li>
                      <li>Data validation and cleaning</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Data Pipeline
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Download → Parse → Validate → Import</li>
                      <li>Background job queue system</li>
                      <li>Automatic retry on failures</li>
                      <li>Progress tracking and logging</li>
                      <li>Data quality monitoring</li>
                      <li>Incremental updates support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Testing Instructions
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Start with "Init Schema" to set up the database tables</li>
                    <li>Run "Test Download" to simulate downloading Census data</li>
                    <li>Execute "Test Parsing" to process the downloaded Excel files</li>
                    <li>Try "Test Insights" for basic analytics queries</li>
                    <li>Explore "Carrier Analysis" and "Commodity Breakdown" for detailed insights</li>
                    <li>Test "Advanced Filters" to see complex query capabilities</li>
                    <li>Check the database views for pre-computed aggregations</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-purple-50 border-l-4 border-purple-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800">
                  Production Setup Notes
                </h3>
                <div className="mt-2 text-sm text-purple-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Set up cron jobs to run daily/weekly downloads</li>
                    <li>Configure real file downloads instead of mock data</li>
                    <li>Add rate limiting and retry logic</li>
                    <li>Implement data archiving for old files</li>
                    <li>Set up monitoring and alerting for failed jobs</li>
                    <li>Configure backup and disaster recovery</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}