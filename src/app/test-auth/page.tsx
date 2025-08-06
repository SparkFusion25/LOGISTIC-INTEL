'use client';

import { useSession } from "next-auth/react";
import AuthButton from '@/components/AuthButton';

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔐 NextAuth Google OAuth Test
          </h1>

          <div className="grid gap-6">
            {/* Authentication Status */}
            <div className="bg-gray-100 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication Status</h2>
              <div className="space-y-2">
                <p><strong>Status:</strong> {status}</p>
                <p><strong>Authenticated:</strong> {session ? '✅ Yes' : '❌ No'}</p>
              </div>
            </div>

            {/* Auth Button */}
            <div className="bg-gray-100 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication Control</h2>
              <AuthButton />
            </div>

            {/* Session Information */}
            {session && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-green-900 mb-4">User Session</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {session.user?.name}</p>
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  {session.user?.image && (
                    <div>
                      <strong>Profile Image:</strong>
                      <div className="mt-2">
                        <img 
                          src={session.user.image} 
                          alt="Profile" 
                          className="w-16 h-16 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Configuration Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Configuration</h2>
              <div className="text-sm space-y-2">
                <p><strong>NextAuth API Route:</strong> /api/auth/[...nextauth]</p>
                <p><strong>Sign-in Page:</strong> /login</p>
                <p><strong>Protected Routes:</strong> /dashboard/*</p>
                <p><strong>Provider:</strong> Google OAuth</p>
                <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              </div>
            </div>

            {/* Raw Session Data */}
            {session && (
              <div className="bg-gray-100 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Raw Session Data</h2>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-64 bg-white p-4 rounded border">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-yellow-900 mb-4">Testing Instructions</h2>
              <div className="text-sm space-y-2">
                <p>1. Click "Sign in with Google" to test OAuth flow</p>
                <p>2. Verify redirect back to this page after authentication</p>
                <p>3. Check that user information is displayed correctly</p>
                <p>4. Test sign out functionality</p>
                <p>5. Try accessing /dashboard to test protected routes</p>
              </div>
            </div>

            {/* Test Links */}
            <div className="bg-gray-100 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Test Navigation</h2>
              <div className="flex gap-4">
                <a 
                  href="/dashboard" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                  Test Dashboard (Protected)
                </a>
                <a 
                  href="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Login Page
                </a>
                <a 
                  href="/api/auth/signin" 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  NextAuth Sign-in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}