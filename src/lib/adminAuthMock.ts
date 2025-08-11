// Demo credentials
const DEMO_CREDENTIALS = {
  email: 'admin@logisticintel.com',
  password: 'demo123'
}

// Mock admin user data
const MOCK_ADMIN_USER = {
  id: 'demo-admin-001',
  email: 'admin@logisticintel.com',
  role: 'super_admin',
  name: 'Demo Administrator',
  created_at: '2024-01-01T00:00:00Z'
}

let currentSession: any = null

export const adminAuth = {
  signIn: async (email: string, password: string) => {
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      currentSession = {
        user: MOCK_ADMIN_USER,
        access_token: 'demo-token-' + Date.now(),
        expires_at: Date.now() + (24 * 60 * 60 * 1000)
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_admin_session', JSON.stringify(currentSession))
      }
      return { data: { user: MOCK_ADMIN_USER, session: currentSession }, error: null }
    }
    return { data: null, error: { message: 'Invalid email or password' } }
  },
  signOut: async () => {
    currentSession = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_admin_session')
    }
    return { error: null }
  },
  getCurrentUser: async () => {
    if (currentSession && currentSession.expires_at > Date.now()) {
      return { user: currentSession.user, error: null }
    }
    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('demo_admin_session')
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession)
          if (session.expires_at > Date.now()) {
            currentSession = session
            return { user: session.user, error: null }
          } else {
            localStorage.removeItem('demo_admin_session')
          }
        } catch {
          localStorage.removeItem('demo_admin_session')
        }
      }
    }
    return { user: null, error: { message: 'No active session' } }
  },
  checkAdminRole: async (userId: string) => {
    if (userId === MOCK_ADMIN_USER.id) return { isAdmin: true, error: null }
    return { isAdmin: false, error: { message: 'User not found' } }
  }
}