'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CampaignBuilder from '@/components/user/CampaignBuilder'

export default function CampaignsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100">
      <CampaignBuilder />
    </div>
  )
}