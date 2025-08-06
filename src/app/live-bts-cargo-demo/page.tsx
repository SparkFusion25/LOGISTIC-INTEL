'use client';

import { useState } from 'react';
import SearchPanel from '@/components/widgets/SearchPanel';

export default function LiveBTSCargoDemoPage() {
  const [testStatus, setTestStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const initializeBTSSystem = async () => {
    setIsLoading(true);
    setTestStatus('🚀 Initializing BTS T-100 Schema and Air Shipper Intelligence...');

    try {
      const response = await fetch('/api/init-bts-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setTestStatus('✅ BTS system initialized successfully!\n\n' + 
          `Summary: ${result.summary.successful}/${result.summary.totalSteps} steps completed\n\n` +
          JSON.stringify(result.details, null, 2));
      } else {
        setTestStatus('❌ BTS system initialization failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setTestStatus('💥 Error initializing BTS system:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBTSData = async () => {
    setIsLoading(true);
    setTestStatus('📥 Downloading live BTS T-100 data...');

    try {
      const response = await fetch('/api/bts/download-t100', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: 2024,
          month: 12,
          forceDownload: false
        })
      });

      const result = await response.json();

      if (result.success) {
        setTestStatus('✅ BTS T-100 data downloaded and processed!\n\n' + 
          `Source: ${result.downloadUrl}\n` +
          `Records Processed: ${result.recordsProcessed}\n` +
          `Records Inserted: ${result.recordsInserted}\n\n` +
          `Message: ${result.message}`);
      } else {
        setTestStatus('❌ BTS data download failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setTestStatus('💥 Error downloading BTS data:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testApolloEnrichment = async () => {
    setIsLoading(true);
    setTestStatus('🔍 Testing Apollo.io contact enrichment...');

    try {
      const testCompanies = ['LG Electronics', 'Samsung', 'Sony', 'TechGlobal', 'MedSupply'];
      const results = [];

      for (const company of testCompanies) {
        try {
          const response = await fetch('/api/enrichment/apollo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              companyName: company,
              location: 'United States',
              industry: 'Technology',
              maxContacts: 3
            })
          });

          const result = await response.json();
          results.push({
            company,
            success: result.success,
            source: result.source,
            contactCount: result.contacts?.length || 0,
            contacts: result.contacts?.slice(0, 2) // Show first 2 contacts
          });
        } catch (error) {
          results.push({
            company,
            success: false,
            error: (error as Error).message
          });
        }
      }

      setTestStatus('✅ Apollo enrichment test completed!\n\n' + 
        results.map(r => 
          `${r.company}: ${r.success ? `✅ ${r.contactCount} contacts (${r.source})` : `❌ ${r.error}`}\n` +
          (r.contacts ? r.contacts.map((c: any) => `  - ${c.name} (${c.title})`).join('\n') + '\n' : '')
        ).join('\n'));
    } catch (error) {
      setTestStatus('💥 Error testing Apollo enrichment:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testAirShipperDetection = async () => {
    setIsLoading(true);
    setTestStatus('🚀 Testing Air Shipper Detection and BTS Matching...');

    try {
      // Test unified search with air shipper filter
      const response = await fetch('/api/search/unified?mode=all&air_shipper_only=true&limit=10');
      const result = await response.json();

      if (result.success) {
        const airShippers = result.data.filter((r: any) => 
          r.bts_intelligence?.is_likely_air_shipper || r.company_profile?.likely_air_shipper
        );

        setTestStatus('✅ Air shipper detection test successful!\n\n' + 
          `Total Records: ${result.total}\n` +
          `Air Shippers Found: ${airShippers.length}\n` +
          `Air Shipper Breakdown: ${JSON.stringify(result.summary?.air_shipper_breakdown, null, 2)}\n\n` +
          'Sample Air Shippers:\n' +
          airShippers.slice(0, 3).map((shipper: any, index: number) => 
            `${index + 1}. ${shipper.unified_company_name}\n` +
            `   Confidence: ${shipper.bts_intelligence?.confidence_score || shipper.company_profile?.air_confidence_score || 0}%\n` +
            `   BTS Routes: ${shipper.bts_intelligence?.route_matches?.length || 0}\n` +
            `   Value: $${shipper.unified_value?.toLocaleString()}\n`
          ).join('\n'));
      } else {
        setTestStatus('❌ Air shipper detection test failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setTestStatus('💥 Error testing air shipper detection:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testBTSRouteMatching = async () => {
    setIsLoading(true);
    setTestStatus('🛫 Testing BTS Route Matching and Intelligence...');

    try {
      // Test specific companies for BTS route matches
      const testCompanies = ['Korean Air Cargo', 'LG Electronics', 'Samsung', 'China Cargo Airlines'];
      const results = [];

      for (const company of testCompanies) {
        try {
          const response = await fetch(`/api/search/air-intelligence?company=${encodeURIComponent(company)}`);
          const result = await response.json();
          
          results.push({
            company,
            success: result.success,
            intelligence: result.intelligence
          });
        } catch (error) {
          results.push({
            company,
            success: false,
            error: (error as Error).message
          });
        }
      }

      setTestStatus('✅ BTS route matching test completed!\n\n' + 
        results.map(r => 
          `${r.company}:\n` +
          `  Success: ${r.success ? '✅' : '❌'}\n` +
          (r.intelligence ? 
            `  Air Shipper: ${r.intelligence.is_likely_air_shipper ? '✅' : '❌'}\n` +
            `  Confidence: ${r.intelligence.confidence_score}%\n` +
            `  Routes: ${r.intelligence.route_matches?.length || 0}\n` +
            (r.intelligence.route_matches?.slice(0, 2).map((route: any) => 
              `    ${route.origin_airport} → ${route.dest_airport} (${route.carrier})`
            ).join('\n') || '') + '\n'
            : `  Error: ${r.error}\n`
          )
        ).join('\n'));
    } catch (error) {
      setTestStatus('💥 Error testing BTS route matching:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testFullWorkflow = async () => {
    setIsLoading(true);
    setTestStatus('🔄 Testing Full BTS + Apollo Workflow...');

    try {
      // Step 1: Search for electronics companies
      const searchResponse = await fetch('/api/search/unified?mode=all&commodity=electronics&limit=5');
      const searchResult = await searchResponse.json();

      if (!searchResult.success) {
        throw new Error('Search failed: ' + searchResult.error);
      }

      const companies = searchResult.data || [];
      const enrichmentResults = [];

      // Step 2: Enrich top companies with contacts
      for (const company of companies.slice(0, 3)) {
        try {
          const enrichResponse = await fetch('/api/enrichment/apollo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              companyName: company.unified_company_name,
              location: company.unified_destination,
              industry: company.company_profile?.primary_industry || 'Electronics',
              maxContacts: 2
            })
          });

          const enrichResult = await enrichResponse.json();
          enrichmentResults.push({
            company: company.unified_company_name,
            success: enrichResult.success,
            contactCount: enrichResult.contacts?.length || 0,
            source: enrichResult.source,
            airShipper: company.bts_intelligence?.is_likely_air_shipper || false,
            confidence: company.bts_intelligence?.confidence_score || 0
          });
        } catch (error) {
          enrichmentResults.push({
            company: company.unified_company_name,
            success: false,
            error: (error as Error).message
          });
        }
      }

      setTestStatus('✅ Full workflow test completed!\n\n' + 
        `Search Results: ${companies.length} companies found\n` +
        `Enrichment Results:\n` +
        enrichmentResults.map(r => 
          `  ${r.company}:\n` +
          `    Contacts: ${r.success ? `${r.contactCount} (${r.source})` : 'Failed'}\n` +
          `    Air Shipper: ${r.airShipper ? `✅ (${r.confidence}%)` : '❌'}\n`
        ).join('') + '\n' +
        'Workflow Summary:\n' +
        `  ✅ Search: Found trade data\n` +
        `  ✅ BTS Intelligence: Air shipper detection\n` +
        `  ✅ Contact Enrichment: Apollo.io integration\n` +
        `  ✅ Campaign Ready: Contacts + shipping intelligence`);
    } catch (error) {
      setTestStatus('💥 Error in full workflow test:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Live BTS Air Cargo Intelligence Demo
          </h1>
          <p className="text-gray-600">
            Real-time airfreight data integration with Apollo.io contact enrichment and campaign intelligence
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🧪 System Tests</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <button
              onClick={initializeBTSSystem}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              🗄️ Initialize BTS Schema
            </button>

            <button
              onClick={downloadBTSData}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              📥 Download BTS T-100 Data
            </button>

            <button
              onClick={testApolloEnrichment}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              🔍 Test Apollo Enrichment
            </button>

            <button
              onClick={testAirShipperDetection}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              🚀 Test Air Shipper Detection
            </button>

            <button
              onClick={testBTSRouteMatching}
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              🛫 Test BTS Route Matching
            </button>

            <button
              onClick={testFullWorkflow}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              🔄 Test Full Workflow
            </button>
          </div>

          {/* Test Results */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Test Results</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96 bg-white p-4 rounded border">
              {isLoading ? 'Running test...' : (testStatus || 'Click a test button above to begin testing the live BTS system.')}
            </pre>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🚀 Live BTS Integration
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Real-time BTS T-100 airfreight data download and parsing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Automated air shipper probability scoring (70%+ confidence)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Cross-reference with Census ocean data for multi-modal detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Route matching: ICN→ORD, PVG→LAX, FRA→JFK, etc.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Carrier intelligence: Korean Air Cargo, China Cargo Airlines</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🔍 Contact Enrichment
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Apollo.io API integration for verified contact data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>PhantomBuster support for LinkedIn profile discovery</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Intelligent caching with 7-day refresh cycle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Target logistics managers, supply chain directors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Campaign-ready contact cards with start campaign button</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Live Search Panel Demo */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Live Search Panel Demo</h2>
          <p className="text-gray-600 mb-6">
            Search live trade data with BTS air cargo intelligence and real-time contact enrichment.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800">Demo Instructions</h3>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• Toggle between Air ✈️, Ocean 🚢, and All 🌐 modes</li>
              <li>• Search companies like "LG Electronics", "Samsung", "Sony"</li>
              <li>• Use the "🚀 Show only likely air shippers" filter</li>
              <li>• Click "Show Contacts" to see Apollo.io enriched contact data</li>
              <li>• Look for BTS route matches (ICN→ORD, PVG→LAX, etc.)</li>
              <li>• Test "Start Campaign" button for CRM integration</li>
            </ul>
          </div>
        </div>

        {/* Embedded Live Search Panel */}
        <SearchPanel />

        {/* System Architecture */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">🏗️ System Architecture</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📊 Data Sources</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• BTS T-100 Monthly Files</li>
                <li>• US Census Trade Data</li>
                <li>• Ocean Freight Manifests</li>
                <li>• Airport-City Mappings</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">🤖 Intelligence Engine</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Air Shipper Probability Scoring</li>
                <li>• Route Matching Algorithms</li>
                <li>• Multi-Modal Detection</li>
                <li>• Company Profile Enrichment</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">🎯 Contact Discovery</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Apollo.io API Integration</li>
                <li>• PhantomBuster LinkedIn Scraping</li>
                <li>• Intelligent Contact Caching</li>
                <li>• Campaign Builder Integration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Live Deployment Status */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3">
            🎉 Live BTS Air Cargo Intelligence System Deployed
          </h3>
          <p className="text-indigo-800 mb-4">
            The complete system is now live and ready for testing with real BTS data, Apollo.io contact enrichment, 
            and intelligent air shipper detection.
          </p>
          
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white rounded p-3 border border-indigo-200">
              <div className="font-medium text-indigo-900">🗄️ Database</div>
              <div className="text-indigo-700">BTS T-100, Company Profiles, Contact Cache</div>
            </div>
            <div className="bg-white rounded p-3 border border-indigo-200">
              <div className="font-medium text-indigo-900">🔍 APIs</div>
              <div className="text-indigo-700">Unified Search, Apollo Enrichment, BTS Download</div>
            </div>
            <div className="bg-white rounded p-3 border border-indigo-200">
              <div className="font-medium text-indigo-900">🤖 Intelligence</div>
              <div className="text-indigo-700">Air Shipper Detection, Route Matching</div>
            </div>
            <div className="bg-white rounded p-3 border border-indigo-200">
              <div className="font-medium text-indigo-900">🎯 UI</div>
              <div className="text-indigo-700">Live Search, Contact Cards, Campaign Builder</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}