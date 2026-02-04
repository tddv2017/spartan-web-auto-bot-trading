// app/dashboard/layout.tsx
"use client";
import Sidebar from '@/components/landing/Sidebar';
import { useAuth } from '@/app/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, profile } = useAuth();

  // Màn hình chờ khi đang quét dữ liệu chiến binh
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-green-500/10 border-t-green-500 rounded-full animate-spin shadow-[0_0_20px_rgba(34,197,94,0.3)]"></div>
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500 animate-pulse" size={32} />
        </div>
        <p className="text-green-500 font-black tracking-[0.3em] text-sm animate-pulse uppercase">Initializing Command Center...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* 1. Sidebar chỉ xuất hiện trong khu vực Dashboard */}
      <Sidebar />
      
      {/* 2. Nội dung Dashboard đẩy lề ml-20 */}
      <main className="flex-1 ml-20 min-h-screen transition-all duration-300 relative z-10">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}