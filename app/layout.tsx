"use client";
import { Be_Vietnam_Pro, Chakra_Petch } from "next/font/google"; 
import "./globals.css";
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from '@/components/landing/Sidebar';
import { Loader2 } from 'lucide-react';

// 1. Cấu hình Font
const beVietnam = Be_Vietnam_Pro({ 
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam",
});

const chakra = Chakra_Petch({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra",
});

// 🛡️ COMPONENT XỬ LÝ GIAO DIỆN VÀ LOADING
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  // Màn hình chờ phong cách Cyber-Spartan khi đang quét dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 font-chakra">
        <div className="relative">
          {/* Vòng xoay Neon */}
          <div className="w-20 h-20 border-4 border-green-500/10 border-t-green-500 rounded-full animate-spin shadow-[0_0_20px_rgba(34,197,94,0.3)]"></div>
          {/* Icon trung tâm */}
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500 animate-pulse" size={32} />
        </div>
        <div className="text-center space-y-2">
          <p className="text-green-500 font-black italic tracking-[0.3em] text-sm animate-pulse">
            SPARTAN SYSTEM INITIALIZING
          </p>
          <div className="flex gap-1 justify-center">
            <span className="w-1 h-1 bg-green-500/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1 h-1 bg-green-500/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1 h-1 bg-green-500/50 rounded-full animate-bounce"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 selection:bg-green-500/30">
      {/* 1. Sidebar ẩn (Hover to Expand) */}
      <Sidebar />
      
      {/* 2. Nội dung chính 
          Sử dụng ml-20 để chừa chỗ cho Sidebar khi thu nhỏ
          Transition mượt mà khi Sidebar bung ra
      */}
      <main className="flex-1 ml-20 min-h-screen transition-all duration-300 ease-in-out relative z-10">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// 🛡️ ROOT LAYOUT TỔNG
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className={`${beVietnam.variable} ${chakra.variable} antialiased bg-slate-950 text-slate-200`}>
        <AuthProvider>
          <LanguageProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}