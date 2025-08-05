// src/app/dashboard/layout.tsx
"use client";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-md">Sidebar Placeholder</div>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}