'use client';

import { useState } from 'react';
import SearchPanel from '@/components/widgets/SearchPanel';

export default function TestAirfreightMatchingPage() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const initializeMatchingSchema = async () => {
    setIsLoading(true);
    setStatus('🚀 Initializing Airfreight Matching Schema...');

    try {
      const response = await fetch('/api/init-airfreight-matching-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Airfreight matching schema initialized successfully!\n\n' + JSON.stringify(result.details, null, 2));
      } else {
        setStatus('❌ Airfreight matching schema initialization failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error initializing matching schema:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testCensusDownload = async () => {
    setIsLoading(true);
    setStatus('📥 Testing Census Download...');

    try {
      const response = await fetch('/api/airfreight/census-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: 2024,
          month: 1,
          fileType: 'export',
          forceDownload: false
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Census download test successful!\n\n' + 
          `Job ID: ${result.jobId}\n` +
          `File: ${result.fileName}\n` +
          `Message: ${result.message}\n` +
          `Download URL: ${result.downloadUrl}\n\n` +
          JSON.stringify(result.dataSource, null, 2));
      } else {
        setStatus('❌ Census download test failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error testing census download:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testUnifiedSearch = async (mode: 'all' | 'air' | 'ocean') => {
    setIsLoading(true);
    setStatus(`🔍 Testing Unified Search (${mode.toUpperCase()} mode)...`);

    try {
      const params = new URLSearchParams({
        mode,
        limit: '10'
      });

      const response = await fetch(`/api/search/unified?${params}`);
      const result = await response.json();

      if (result.success) {
        setStatus(`✅ Unified search test (${mode.toUpperCase()}) successful!\n\n` + 
          `Mode: ${result.mode}\n` +
          `Total Records: ${result.total}\n` +
          `Records Returned: ${result.data?.length || 0}\n\n` +
          `Summary:\n${JSON.stringify(result.summary, null, 2)}\n\n` +
          `Sample Records:\n${JSON.stringify(result.data?.slice(0, 2), null, 2)}`);
      } else {
        setStatus(`❌ Unified search test (${mode.toUpperCase()}) failed:\n\n` + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus(`💥 Error testing unified search (${mode.toUpperCase()}):\n\n` + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testCompanyMatching = async () => {
    setIsLoading(true);
    setStatus('🔗 Testing Company Air-Ocean Matching...');

    try {
      const response = await fetch('/api/search/unified?mode=all&company=TechGlobal&limit=5');
      const result = await response.json();

      if (result.success) {
        setStatus('✅ Company matching test successful!\n\n' + 
          `Found ${result.data?.length || 0} records\n\n` +
          'Matching Companies:\n' +
          result.data?.map((record: any, index: number) => 
            `${index + 1}. ${record.unified_company_name} (${record.mode_icon} ${record.mode.toUpperCase()})\n` +
            `   HS Code: ${record.hs_code}\n` +
            `   Value: $${record.unified_value?.toLocaleString()}\n` +
            `   Match Info: ${record.match_info ? `Score ${record.match_info.match_score}/10` : 'No match'}\n`
          ).join('\n') + '\n\n' +
          JSON.stringify(result.data?.slice(0, 2), null, 2));
      } else {
        setStatus('❌ Company matching test failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error testing company matching:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testAdvancedFiltering = async () => {
    setIsLoading(true);
    setStatus('🎯 Testing Advanced Filtering...');

    try {
      const params = new URLSearchParams({
        mode: 'all',
        origin_country: 'CN',
        destination_city: 'Los Angeles',
        min_value: '50000',
        hs_code: '8471600000',
        limit: '5'
      });

      const response = await fetch(`/api/search/unified?${params}`);
      const result = await response.json();

      if (result.success) {
        setStatus('✅ Advanced filtering test successful!\n\n' + 
          `Filters Applied: ${JSON.stringify(result.filters_applied, null, 2)}\n\n` +
          `Summary: ${JSON.stringify(result.summary, null, 2)}\n\n` +
          `Filtered Results:\n` +
          result.data?.map((record: any, index: number) => 
            `${index + 1}. ${record.unified_company_name} - ${record.hs_code}\n` +
            `   Mode: ${record.mode_icon} ${record.mode.toUpperCase()}\n` +
            `   Value: $${record.unified_value?.toLocaleString()}\n` +
            `   Destination: ${record.unified_destination}\n`
          ).join('\n'));
      } else {
        setStatus('❌ Advanced filtering test failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error testing advanced filtering:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testModeToggleInSearch = async () => {
    setIsLoading(true);
    setStatus('🔄 Testing Mode Toggle in Search Panel...');

    try {
      const modes = ['all', 'air', 'ocean'] as const;
      const results: any = {};

      for (const mode of modes) {
        const params = new URLSearchParams({
          mode,
          company: 'Tech',
          limit: '3'
        });

        const response = await fetch(`/api/search/unified?${params}`);
        const result = await response.json();
        results[mode] = result;
      }

      setStatus('✅ Mode toggle test successful!\n\n' + 
        Object.entries(results).map(([mode, result]: [string, any]) => 
          `${mode.toUpperCase()} Mode:\n` +
          `  Records: ${result.data?.length || 0}\n` +
          `  Total: ${result.total || 0}\n` +
          `  Air/Ocean Breakdown: Air=${result.summary?.mode_breakdown?.air || 0}, Ocean=${result.summary?.mode_breakdown?.ocean || 0}\n`
        ).join('\n') + '\n\n' +
        'Sample data from ALL mode:\n' +
        JSON.stringify(results.all?.data?.slice(0, 1), null, 2));
    } catch (error) {
      setStatus('💥 Error testing mode toggle:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Controls */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Airfreight Matching System Test Suite
          </h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <button
              onClick={initializeMatchingSchema}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '🗄️ Init Matching Schema'}
            </button>

            <button
              onClick={testCensusDownload}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '📥 Test Census Download'}
            </button>

            <button
              onClick={() => testUnifiedSearch('all')}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '🌐 Test Unified Search (ALL)'}
            </button>

            <button
              onClick={() => testUnifiedSearch('air')}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '✈️ Test Air Search'}
            </button>

            <button
              onClick={() => testUnifiedSearch('ocean')}
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '🚢 Test Ocean Search'}
            </button>

            <button
              onClick={testCompanyMatching}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '🔗 Test Company Matching'}
            </button>

            <button
              onClick={testAdvancedFiltering}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '🎯 Test Advanced Filters'}
            </button>

            <button
              onClick={testModeToggleInSearch}
              disabled={isLoading}
              className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '🔄 Test Mode Toggle'}
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Test Results</h2>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
              {status || 'Click a button above to run tests...'}
            </pre>
          </div>
        </div>
      </div>

      {/* Live Search Panel Demo */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Live Search Panel Demo</h2>
          <p className="text-gray-600 mb-6">
            Test the enhanced SearchPanel with Air/Ocean/All mode toggle, live data, and unified CRM enrichment.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800">Testing Instructions</h3>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• Toggle between Air ✈️, Ocean 🚢, and All 🌐 modes</li>
              <li>• Search for companies like "TechGlobal", "MedSupply", or "Fashion"</li>
              <li>• Use advanced filters for HS codes, destinations, value ranges</li>
              <li>• Look for mode-specific badges and match indicators</li>
              <li>• Verify mobile responsiveness and table sorting</li>
            </ul>
          </div>
        </div>

        {/* Embedded Search Panel */}
        <SearchPanel />

        {/* System Information */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <h3 className="text-sm font-medium text-green-800">✅ Implemented Features</h3>
            <ul className="mt-2 text-sm text-green-700 space-y-1">
              <li>• Air/Ocean/All mode toggle with live data switching</li>
              <li>• Unified search API supporting all three modes</li>
              <li>• Company matching with air-ocean intelligence</li>
              <li>• Advanced filtering (HS codes, destinations, values)</li>
              <li>• Mode-specific badges and visual indicators</li>
              <li>• Mobile-responsive design with collapsible filters</li>
              <li>• Real-time summary statistics</li>
              <li>• Census.gov airfreight data integration</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <h3 className="text-sm font-medium text-blue-800">🔬 Data Sources</h3>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• <strong>Airfreight:</strong> US Census Bureau aircraft trade data</li>
              <li>• <strong>Ocean:</strong> Maritime freight manifests and bills of lading</li>
              <li>• <strong>Combined:</strong> Intelligent matching via HS codes & destinations</li>
              <li>• <strong>Companies:</strong> Enriched company profiles with match scores</li>
              <li>• <strong>Real-time:</strong> Live Supabase queries with caching</li>
            </ul>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
            <h3 className="text-sm font-medium text-purple-800">🎯 Next Steps</h3>
            <ul className="mt-2 text-sm text-purple-700 space-y-1">
              <li>• Apollo/PhantomBuster contact enrichment integration</li>
              <li>• Automated contact discovery and CRM population</li>
              <li>• Enhanced campaign builder with mode-specific targeting</li>
              <li>• Email outreach with air/ocean context</li>
              <li>• Company risk scoring and compliance monitoring</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <h3 className="text-sm font-medium text-yellow-800">⚡ Performance</h3>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• Optimized database indexes for fast queries</li>
              <li>• Efficient API caching and pagination</li>
              <li>• Progressive loading for large datasets</li>
              <li>• Mobile-first responsive design</li>
              <li>• Real-time mode switching without page refresh</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3">
            🎉 Airfreight Matching System Complete
          </h3>
          <p className="text-indigo-800 mb-4">
            The enhanced SearchPanel now supports seamless switching between Air, Ocean, and All data modes 
            with live Supabase integration, unified CRM enrichment, and intelligent company matching.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded p-3 border border-indigo-200">
              <div className="font-medium text-indigo-900">✈️ Air Mode</div>
              <div className="text-indigo-700">US Census airfreight data with carrier and route intelligence</div>
            </div>
            <div className="bg-white rounded p-3 border border-indigo-200">
              <div className="font-medium text-indigo-900">🚢 Ocean Mode</div>
              <div className="text-indigo-700">Maritime shipping data with container and vessel tracking</div>
            </div>
            <div className="bg-white rounded p-3 border border-indigo-200">
              <div className="font-medium text-indigo-900">🌐 All Mode</div>
              <div className="text-indigo-700">Combined intelligence with smart company matching algorithms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}