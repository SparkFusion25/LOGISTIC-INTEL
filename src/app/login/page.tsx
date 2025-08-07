'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Eye, EyeOff, AlertCircle, Copy, Check, Users } from 'lucide-react'
import Logo from '@/components/ui/Logo'

export default function UserLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Demo user credentials
  const DEMO_EMAIL = 'user@demo.com'
  const DEMO_PASSWORD = 'demo123'
  
  // Admin test credentials
  const ADMIN_EMAIL = 'info@getb3acon.com'
  const ADMIN_PASSWORD = '7354'

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const fillDemoCredentials = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError('')
  }

  const fillAdminCredentials = () => {
    setEmail(ADMIN_EMAIL)
    setPassword(ADMIN_PASSWORD)
    setError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Try to sign in first
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (signInError && signInError.message?.includes('Invalid login credentials')) {
        // User doesn't exist, try to create them automatically for demo/admin users
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          // Create admin user via signup
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                full_name: 'Admin Test User',
                first_name: 'Admin',
                last_name: 'User',
                company: 'LogisticIntel',
                plan: 'enterprise',
                role: 'admin'
              }
            }
          })
          
          if (signUpError) {
            throw signUpError
          }
          
          // If signup succeeded, try to sign in again
          if (signUpData.user) {
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email: email,
              password: password
            })
            
                          if (!retryError && retryData.user) {
                router.push('/dashboard')
                return
            } else {
              // Signup worked but signin failed, user might need email confirmation
              alert('Admin account created! Please check your email for verification, then try signing in again.')
              return
            }
          }
        } else if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          // Create demo user via signup
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                full_name: 'Demo User',
                first_name: 'Demo',
                last_name: 'User',
                company: 'Demo Company',
                plan: 'free',
                role: 'user'
              }
            }
          })
          
          if (signUpError) {
            throw signUpError
          }
          
          // If signup succeeded, try to sign in again
          if (signUpData.user) {
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email: email,
              password: password
            })
            
            if (!retryError && retryData.user) {
              router.push('/dashboard')
              return
            } else {
              // Signup worked but signin failed, user might need email confirmation
              alert('Demo account created! Please check your email for verification, then try signing in again.')
              return
            }
          }
        }
        
        // Still failed, show error
        throw signInError
      } else if (signInError) {
        throw signInError
      }

      if (data.user) {
        // Check if this is the admin test user
        if (email === ADMIN_EMAIL) {
          // Redirect to dashboard for admin flow
          router.push('/dashboard')
        } else {
          // Regular users go to dashboard
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      
      if (error.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Please check your email and click the verification link before signing in.')
      } else if (error.message?.includes('signup')) {
        setError('Account not found. Please sign up first.')
      } else {
        setError(error.message || 'An error occurred during login. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Logo size="xl" variant="default" showText={true} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your trade intelligence platform</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Admin Test Credentials */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="w-5 h-5 text-yellow-600" />
            <h3 className="text-sm font-medium text-yellow-800">Admin Test Account</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-700">Email:</span>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-yellow-100 px-2 py-1 rounded">{ADMIN_EMAIL}</code>
                <button
                  onClick={() => copyToClipboard(ADMIN_EMAIL, 'admin-email')}
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  {copiedField === 'admin-email' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-700">Password:</span>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-yellow-100 px-2 py-1 rounded">{ADMIN_PASSWORD}</code>
                <button
                  onClick={() => copyToClipboard(ADMIN_PASSWORD, 'admin-password')}
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  {copiedField === 'admin-password' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            
            <button
              onClick={fillAdminCredentials}
              className="w-full mt-3 bg-yellow-600 text-white text-xs py-2 px-3 rounded hover:bg-yellow-700 transition-colors"
            >
              Use Admin Credentials
            </button>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-blue-800">Demo Account</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-700">Email:</span>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-blue-100 px-2 py-1 rounded">{DEMO_EMAIL}</code>
                <button
                  onClick={() => copyToClipboard(DEMO_EMAIL, 'demo-email')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {copiedField === 'demo-email' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-700">Password:</span>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-blue-100 px-2 py-1 rounded">{DEMO_PASSWORD}</code>
                <button
                  onClick={() => copyToClipboard(DEMO_PASSWORD, 'demo-password')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {copiedField === 'demo-password' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            
            <button
              onClick={fillDemoCredentials}
              className="w-full mt-3 bg-blue-600 text-white text-xs py-2 px-3 rounded hover:bg-blue-700 transition-colors"
            >
              Use Demo Credentials
            </button>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Admin Setup Required</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p>1. Sign up with admin email: {ADMIN_EMAIL}</p>
            <p>2. Run admin SQL scripts in Supabase</p>
            <p>3. Sign in and visit /test-admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}