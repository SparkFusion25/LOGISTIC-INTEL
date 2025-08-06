'use client';

import { useState } from 'react';

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const initializeDatabase = async () => {
    setIsLoading(true);
    setStatus('🚀 Initializing database...');

    try {
      const response = await fetch('/api/init-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Database initialized successfully!\n\n' + JSON.stringify(result.details, null, 2));
      } else {
        setStatus('❌ Database initialization failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error initializing database:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testCRMConnection = async () => {
    setIsLoading(true);
    setStatus('🔍 Testing CRM connection...');

    try {
      const response = await fetch('/api/crm/leads');
      const result = await response.json();

      if (result.success) {
        setStatus('✅ CRM connection successful!\n\n' + 
          `Found ${result.total_count} contacts:\n` +
          JSON.stringify(result.leads, null, 2));
      } else {
        setStatus('❌ CRM connection failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error testing CRM:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const seedOutreachData = async () => {
    setIsLoading(true);
    setStatus('📊 Seeding outreach data...');

    try {
      const response = await fetch('/api/seed-outreach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Outreach data seeded successfully!\n\n' + JSON.stringify(result, null, 2));
      } else {
        setStatus('❌ Outreach data seeding failed:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setStatus('💥 Error seeding data:\n\n' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔧 Supabase Connection Test
          </h1>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={initializeDatabase}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Initializing...' : '🚀 Initialize Database'}
            </button>

            <button
              onClick={testCRMConnection}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Testing...' : '🔍 Test CRM'}
            </button>

            <button
              onClick={seedOutreachData}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Seeding...' : '📊 Seed Data'}
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status</h2>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
              {status || 'Click a button above to test the connection...'}
            </pre>
          </div>

          <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Connection Details
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p><strong>Supabase URL:</strong> https://zupuxlrtixhfnbuhxhum.supabase.co</p>
                  <p><strong>Database:</strong> PostgreSQL with simplified schema</p>
                  <p><strong>Tables:</strong> users, campaigns, contacts, outreach_logs, personas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}