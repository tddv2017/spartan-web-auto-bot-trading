// app/dashboard/layout.tsx
"use client";
import Sidebar from '@/components/landing/Sidebar';
import { useAuth } from '@/app/context/AuthContext';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, profile } = useAuth();

  // Màn hình chờ phong cách TailAdmin
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
        </div>
        <p className="text-slate-400 font-bold tracking-widest text-[11px] animate-pulse uppercase">Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0B1120] text-slate-300">
      {/* 1. Sidebar */}
      <Sidebar />
      
      {/* 2. Nội dung Dashboard */}
      <main className="flex-1 ml-20 min-h-screen transition-all duration-300 relative z-10">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}