'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestSupabaseClientPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSupabaseQuery = async () => {
    setLoading(true);
    setError(null);

    try {
      // Test the exact line you specified
      const { data, error } = await supabase.from('users').select('*');
      
      if (error) {
        setError(`Supabase error: ${error.message}`);
        console.error('Supabase error:', error);
      } else {
        setUsers(data || []);
        console.log('✅ Supabase query successful:', data);
      }
    } catch (err) {
      setError(`Client error: ${(err as Error).message}`);
      console.error('Client error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Test the connection on component mount
    testSupabaseQuery();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔧 Supabase Client Test
          </h1>

          <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Testing Configuration
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p><strong>File:</strong> /lib/supabaseClient.ts</p>
                  <p><strong>URL:</strong> https://zupuxlrtixhfnbuhxhum.supabase.co</p>
                  <p><strong>Query:</strong> await supabase.from('users').select('*')</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={testSupabaseQuery}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Testing...' : '🔍 Test Supabase Query'}
            </button>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-gray-100 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Status</h2>
              {loading && (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Testing Supabase connection...
                </div>
              )}
              {error && (
                <div className="text-red-600 bg-red-50 p-3 rounded-md">
                  <strong>❌ Error:</strong> {error}
                </div>
              )}
              {!loading && !error && users.length >= 0 && (
                <div className="text-green-600 bg-green-50 p-3 rounded-md">
                  <strong>✅ Success:</strong> Found {users.length} users in the database
                </div>
              )}
            </div>

            {/* Users Data */}
            {users.length > 0 && (
              <div className="bg-gray-100 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Users Data</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-mono text-xs">{user.id}</td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">{user.name}</td>
                          <td className="px-4 py-2">{new Date(user.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <div className="bg-gray-100 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Raw Data (JSON)</h2>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-64 bg-white p-4 rounded border">
                {JSON.stringify(users, null, 2)}
              </pre>
            </div>

            {/* Code Example */}
            <div className="bg-gray-900 text-green-400 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Code Being Tested</h2>
              <pre className="text-sm font-mono">
{`// Import from your supabaseClient
import { supabase } from '@/lib/supabaseClient';

// The exact line you specified
const { data, error } = await supabase.from('users').select('*');

// Result:
// data: ${users.length} users found
// error: ${error ? 'Yes' : 'None'}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}