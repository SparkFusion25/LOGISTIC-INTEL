'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { adminAuth } from '@/lib/adminAuthMock'
import Logo from '@/components/ui/Logo'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check for error parameters in URL
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    if (errorParam === 'access_denied') {
      setError('Access denied. Admin privileges required.')
    } else if (errorParam === 'auth_failed') {
      setError('Authentication failed. Please try again.')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await adminAuth.signIn(email, password)
      
      if (signInError) {
        setError('Invalid email or password')
        return
      }

      if (data.user) {
        const { isAdmin, error: roleError } = await adminAuth.checkAdminRole(data.user.id)
        
        if (roleError || !isAdmin) {
          setError('Access denied. Admin privileges required.')
          await adminAuth.signOut()
          return
        }

        router.push('/admin/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Demo credentials helper
  const fillDemoCredentials = () => {
    setEmail('admin@logisticintel.com')
    setPassword('demo123')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" variant="default" showText={true} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-600 mt-2">System Administration</p>
          </div>

          {/* Demo credentials banner */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                <strong>Demo:</strong> admin@logisticintel.com / demo123
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Use Demo
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
                placeholder="Enter your admin email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input pr-10"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full admin-button-primary flex items-center justify-center space-x-2 py-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Logistic Intel Admin Portal v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}