'use client';

import { useState } from 'react';

export default function TestPersonaPage() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const initializeFollowUpSchema = async () => {
    setIsLoading(true);
    setStatus('🚀 Initializing Follow-Up Schema...');

    try {
      const response = await fetch('/api/init-follow-up-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Follow-Up Schema initialized successfully!\n\n' + JSON.stringify(result.details, null, 2));
      } else {
        setStatus('❌ Follow-Up Schema initialization failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error initializing Follow-Up Schema:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testPersonaEnrichment = async () => {
    setIsLoading(true);
    setStatus('🧠 Testing Persona Enrichment...');

    try {
      // First get a contact ID from the contacts table
      const contactsResponse = await fetch('/api/crm/leads');
      const contactsData = await contactsResponse.json();
      
      if (!contactsData.success || !contactsData.leads || contactsData.leads.length === 0) {
        setStatus('❌ No contacts found. Please seed data first.');
        return;
      }

      const firstContact = contactsData.leads[0];
      
      // Test persona enrichment
      const response = await fetch('/api/persona/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contactId: firstContact.id })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Persona enrichment successful!\n\n' + 
          `Contact: ${firstContact.name} (${firstContact.company})\n` +
          `Enriched with:\n${JSON.stringify(result.persona, null, 2)}`);
      } else {
        setStatus('❌ Persona enrichment failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error testing persona enrichment:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testCompanyNews = async () => {
    setIsLoading(true);
    setStatus('📰 Testing Company News API...');

    try {
      const response = await fetch('/api/company-news?domain=techglobal.com');
      const result = await response.json();

      if (result.success) {
        setStatus('✅ Company news fetch successful!\n\n' + 
          `Domain: ${result.domain}\n` +
          `Articles found: ${result.articles.length}\n\n` +
          JSON.stringify(result.articles, null, 2));
      } else {
        setStatus('❌ Company news fetch failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error testing company news:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDatabase = async () => {
    setIsLoading(true);
    setStatus('🔄 Refreshing Database...');

    try {
      const response = await fetch('/api/init-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Database refreshed successfully!\n\n' + JSON.stringify(result.details, null, 2));
      } else {
        setStatus('❌ Database refresh failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error refreshing database:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧠 PersonaEngine & Follow-Up System Test
          </h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={refreshDatabase}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '🔄 Refresh Database'}
            </button>

            <button
              onClick={initializeFollowUpSchema}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '⚡ Init Follow-Up'}
            </button>

            <button
              onClick={testPersonaEnrichment}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '🧠 Test Persona'}
            </button>

            <button
              onClick={testCompanyNews}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Loading...' : '📰 Test News'}
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Test Results</h2>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
              {status || 'Click a button above to run tests...'}
            </pre>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    PersonaEngine Features
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>AI-powered persona generation</li>
                      <li>Industry-specific insights</li>
                      <li>Buying likelihood scoring</li>
                      <li>Smart talking points</li>
                      <li>Communication style analysis</li>
                      <li>Company news integration</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-purple-800">
                    Follow-Up System Features
                  </h3>
                  <div className="mt-2 text-sm text-purple-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Automated sequence building</li>
                      <li>Trigger-based follow-ups</li>
                      <li>Smart timing optimization</li>
                      <li>Multi-channel support</li>
                      <li>Performance tracking</li>
                      <li>Campaign analytics</li>
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
                    <li>First, run "Refresh Database" to ensure you have sample contacts</li>
                    <li>Then "Init Follow-Up" to set up the follow-up system schema</li>
                    <li>Test "Test Persona" to see AI enrichment in action</li>
                    <li>Try "Test News" to see company news integration</li>
                    <li>Visit <code>/dashboard/crm</code> to see the full PersonaEngine UI</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}