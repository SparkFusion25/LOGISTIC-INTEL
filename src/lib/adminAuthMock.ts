// Mock admin authentication for development/demo purposes

export const mockAdminCredentials = {
  username: 'admin@logisticintel.com',
  password: 'admin123'
}

export const mockAdminUser = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@logisticintel.com',
  role: 'admin',
  permissions: [
    'users.read',
    'users.write',
    'users.delete',
    'analytics.read',
    'system.read',
    'system.write'
  ],
  lastLogin: '2024-08-15T12:00:00Z',
  created: '2024-01-01T00:00:00Z'
}

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === mockAdminCredentials.username && 
         password === mockAdminCredentials.password
}

export function generateAdminToken(): string {
  // In a real app, this would be a proper JWT token
  return Buffer.from(JSON.stringify({
    user: mockAdminUser,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  })).toString('base64')
}

export function validateAdminToken(token: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    return decoded.exp > Date.now()
  } catch {
    return false
  }
}

export function getAdminUserFromToken(token: string): typeof mockAdminUser | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    if (decoded.exp > Date.now()) {
      return decoded.user
    }
    return null
  } catch {
    return null
  }
}