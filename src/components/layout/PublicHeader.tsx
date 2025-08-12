'use client';

import Link from 'next/link';

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B1220]/70 backdrop-blur supports-[backdrop-filter]:bg-[#0B1220]/60">
      <div className="mx-auto w-full max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg" aria-hidden />
          <span className="font-semibold text-white tracking-wide">Logistic Intel</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-white/80">
          <Link href="/pricing" className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md px-1 py-1">Pricing</Link>
          <Link href="/docs" className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md px-1 py-1">Docs</Link>
          <Link href="/changelog" className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md px-1 py-1">Changelog</Link>
          <Link href="/login" className="rounded-lg px-4 py-2 ring-1 ring-white/15 hover:bg-white/5 text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">Sign in</Link>
          <Link href="/signup" className="rounded-lg px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-600 hover:to-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Start free</Link>
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <Link href="/login" className="text-white/80 hover:text-white px-3 py-1.5 rounded-lg ring-1 ring-white/15 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">Sign in</Link>
          <Link href="/signup" className="text-white px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Start free</Link>
        </div>
      </div>
    </header>
  );
}