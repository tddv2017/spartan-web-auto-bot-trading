"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext'; // 👈 1. Import LanguageContext
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const { t } = useLanguage(); // 👈 2. Lấy từ điển t
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tự động chuyển trang khi đã login
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Tránh nháy form
  if (loading || user) {
    return null; 
  }

  const handleLogin = async () => {
    setIsLoggingIn(true);
    await login();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* NÚT QUAY LẠI */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-slate-400 hover:text-white hover:-translate-x-1 transition-all group z-20"
      >
        <div className="p-2 bg-slate-900 rounded-full border border-slate-800 group-hover:border-green-500 group-hover:bg-green-500/10">
           <ArrowLeft className="w-5 h-5 group-hover:text-green-500" />
        </div>
        <span className="font-bold text-sm">{t.loginPage?.back || "Back to Home"}</span>
      </Link>

      {/* Hiệu ứng nền */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* FORM LOGIN */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-lg text-center">
        
        <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-black font-black text-3xl mx-auto mb-6 shadow-lg shadow-green-500/20">
          S
        </div>

        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{t.loginPage?.title || "SPARTAN COMMAND"}</h2>
        <p className="text-slate-400 mb-8 text-sm">
          {t.loginPage?.sub || "Đăng nhập hệ thống"}
        </p>

        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full py-4 bg-white hover:bg-gray-100 active:scale-95 text-black font-bold rounded-xl flex items-center justify-center gap-3 transition-all mb-6 group relative overflow-hidden"
        >
          {isLoggingIn ? (
             <span className="flex items-center gap-2">
               <span className="w-4 h-4 border-2 border-slate-400 border-t-black rounded-full animate-spin"></span>
               {t.loginPage?.processing || "Processing..."}
             </span>
          ) : (
            <>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
              <span>{t.loginPage?.google || "Continue with Google"}</span>
            </>
          )}
        </button>

        <div className="text-xs text-slate-500 space-y-4">
          <p className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>{t.loginPage?.secure || "Secured by Firebase"}</span>
          </p>
          <div className="border-t border-slate-800 pt-4">
            <p>
              {t.loginPage?.no_account} <span className="text-green-500 font-bold">{t.loginPage?.auto_create}</span> {t.loginPage?.when_login}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}