// app/admin/layout.tsx
"use client";
import Sidebar from '@/components/landing/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={24} />
        </div>
        <p className="text-slate-400 font-bold tracking-widest text-xs animate-pulse uppercase">Initializing Command Center...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0B1120]">
      <Sidebar />
      <main className="flex-1 ml-20 min-h-screen transition-all duration-300 relative z-10">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}