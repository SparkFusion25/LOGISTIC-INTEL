"use client";

import { useRouter } from 'next/navigation';
import PublicHeader from '@/components/layout/PublicHeader';
import HeroGlobe from '@/components/landing/HeroGlobe';

export default function LandingPage() {
  const router = useRouter();

  return (
    <>
      <PublicHeader />
      <HeroGlobe
        onDemo={() => router.push('/signup?demo=1')}
        onExplore={() => router.push('/dashboard/search')}
      />
      {/* Additional landing sections can follow here */}
    </>
  );
}