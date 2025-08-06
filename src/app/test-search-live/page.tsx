'use client';

import { useState, useEffect } from 'react';
import SearchPanel from '@/components/widgets/SearchPanel';

export default function TestSearchLivePage() {
  const [apiTestResults, setApiTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAPITests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-search-system');
      const results = await response.json();
      setApiTestResults(results);
    } catch (error) {
      console.error('API test failed:', error);
      setApiTestResults({ error: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const testSpecificAPIs = async () => {
    console.log('Testing specific APIs...');
    
    // Test 1: LG Electronics search
    try {
      const lgResponse = await fetch('/api/search/unified?mode=all&company=LG%20Electronics&limit=3');
      const lgResult = await lgResponse.json();
      console.log('LG Electronics Search:', lgResult);
    } catch (error) {
      console.error('LG search failed:', error);
    }

    // Test 2: Air shipper filter
    try {
      const airResponse = await fetch('/api/search/unified?mode=all&air_shipper_only=true&limit=5');
      const airResult = await airResponse.json();
      console.log('Air Shipper Filter:', airResult);
    } catch (error) {
      console.error('Air shipper filter failed:', error);
    }

    // Test 3: Air intelligence
    try {
      const intelResponse = await fetch('/api/search/air-intelligence?company=LG%20Electronics');
      const intelResult = await intelResponse.json();
      console.log('Air Intelligence:', intelResult);
    } catch (error) {
      console.error('Air intelligence failed:', error);
    }

    // Test 4: Apollo enrichment
    try {
      const apolloResponse = await fetch('/api/enrichment/apollo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: 'LG Electronics', maxContacts: 3 })
      });
      const apolloResult = await apolloResponse.json();
      console.log('Apollo Enrichment:', apolloResult);
    } catch (error) {
      console.error('Apollo enrichment failed:', error);
    }
  };

  useEffect(() => {
    runAPITests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Live Search System Test
          </h1>
          <p className="text-gray-600 mb-4">
            Testing the complete BTS Air Cargo Intelligence system with real data examples
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={runAPITests}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Testing...' : 'Run API Tests'}
            </button>
            
            <button
              onClick={testSpecificAPIs}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Test APIs (Check Console)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* API Test Results */}
        {apiTestResults && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🧪 API Test Results</h2>
            
            {apiTestResults.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Error: {apiTestResults.error}</p>
              </div>
            ) : (
              <div>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {apiTestResults.test_summary?.total_tests || 0}
                    </div>
                    <div className="text-sm text-blue-800">Total Tests</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {apiTestResults.test_summary?.passed || 0}
                    </div>
                    <div className="text-sm text-green-800">Passed</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {apiTestResults.test_summary?.failed || 0}
                    </div>
                    <div className="text-sm text-red-800">Failed</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {apiTestResults.test_summary?.errors || 0}
                    </div>
                    <div className="text-sm text-yellow-800">Errors</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {apiTestResults.detailed_results?.tests?.map((test: any, index: number) => (
                    <div key={index} className={`border rounded-lg p-4 ${
                      test.status === 'PASS' ? 'border-green-200 bg-green-50' :
                      test.status === 'FAIL' ? 'border-red-200 bg-red-50' :
                      'border-yellow-200 bg-yellow-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{test.name}</h3>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          test.status === 'PASS' ? 'bg-green-100 text-green-800' :
                          test.status === 'FAIL' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {test.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        {test.error && <div>Error: {test.error}</div>}
                        {test.result_count !== undefined && <div>Results: {test.result_count}</div>}
                        {test.found_lg !== undefined && <div>Found LG: {test.found_lg ? 'Yes' : 'No'}</div>}
                        {test.air_shippers_only !== undefined && <div>Air Shippers Only: {test.air_shippers_only ? 'Yes' : 'No'}</div>}
                        {test.is_air_shipper !== undefined && <div>Is Air Shipper: {test.is_air_shipper ? 'Yes' : 'No'}</div>}
                        {test.confidence_score !== undefined && <div>Confidence: {test.confidence_score}%</div>}
                        {test.route_matches !== undefined && <div>Route Matches: {test.route_matches}</div>}
                        {test.contact_count !== undefined && <div>Contacts: {test.contact_count}</div>}
                        {test.source && <div>Source: {test.source}</div>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live API Examples */}
                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Live API Examples</h3>
                  <div className="space-y-2 text-sm">
                    {apiTestResults.live_examples && Object.entries(apiTestResults.live_examples).map(([key, url]: [string, any]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Search Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Live Search Panel</h2>
          <p className="text-gray-600 mb-6">
            This is the actual SearchPanel component with live BTS intelligence and Apollo enrichment:
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800">Test Instructions</h3>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• <strong>Search "LG Electronics":</strong> Should show ✈️ BTS CONFIRMED badge</li>
              <li>• <strong>Check "🚀 Show only likely air shippers":</strong> Filters to high-confidence companies</li>
              <li>• <strong>Toggle Air mode:</strong> Shows ICN→ORD, ICN→LAX routes</li>
              <li>• <strong>Click "Show Contacts":</strong> Apollo.io enrichment with logistics contacts</li>
              <li>• <strong>Look for BTS routes:</strong> Korean Air Cargo, China Cargo Airlines</li>
            </ul>
          </div>
        </div>

        {/* Embedded Live SearchPanel */}
        <SearchPanel />

        {/* Expected Results */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            ✅ Expected Results for Testing
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-800 mb-2">LG Electronics Search:</h4>
              <ul className="text-green-700 space-y-1">
                <li>• Shows "✈️ BTS CONFIRMED" badge</li>
                <li>• 85% confidence score</li>
                <li>• ICN→ORD route (Korean Air Cargo, 125K kg)</li>
                <li>• ICN→LAX route (Korean Air Cargo, 98K kg)</li>
                <li>• Apollo contacts: Logistics Director, Supply Chain Manager</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Samsung Electronics Search:</h4>
              <ul className="text-green-700 space-y-1">
                <li>• Shows "✈️ BTS CONFIRMED" badge</li>
                <li>• 90% confidence score</li>
                <li>• ICN→LAX route (Korean Air Cargo, 98K kg)</li>
                <li>• ICN→JFK route (Korean Air Cargo, 87K kg)</li>
                <li>• Apollo contacts with verified emails</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}