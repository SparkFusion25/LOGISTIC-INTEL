'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminAuth } from '@/lib/supabase'

export default function AdminRoot() {
  const router = useRouter()

  useEffect(() => {
    checkAuthAndRedirect()
  }, [])

  const checkAuthAndRedirect = async () => {
    const { user } = await adminAuth.getCurrentUser()
    
    if (user) {
      const { isAdmin } = await adminAuth.checkAdminRole(user.id)
      if (isAdmin) {
        router.push('/admin/dashboard')
      } else {
        router.push('/admin/login')
      }
    } else {
      router.push('/admin/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}