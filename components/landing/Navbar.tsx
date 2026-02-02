"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, X, Globe, User, LayoutDashboard, LogIn, 
  ChevronRight, Shield, Zap 
} from 'lucide-react';
import { useLanguage } from '../../app/context/LanguageContext';
import { useAuth } from '../../app/context/AuthContext';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage(); 
  const { user, profile } = useAuth(); 

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'border-b border-white/10 bg-slate-950/90 backdrop-blur-md py-4 shadow-2xl' 
        : 'bg-transparent py-4 md:py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        
        {/* --- 1. LOGO --- */}
        <Link href="/" className="flex items-center gap-2 group z-50">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-green-500 rounded-xl flex items-center justify-center font-black text-black text-xl italic shadow-[0_0_15px_rgba(34,197,94,0.4)] group-hover:rotate-12 transition-transform">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-black tracking-wider text-white leading-none">
              SPARTAN <span className="text-green-500">V7.2</span>
            </span>
          </div>
        </Link>

        {/* --- 2. MENU GIỮA (DESKTOP ONLY) --- */}
        <div className="hidden md:flex gap-8 text-sm font-bold text-slate-400">
          <a href="#features" className="hover:text-green-400 transition-colors">{t.nav?.features || "Tính năng"}</a>
          <a href="#performance" className="hover:text-green-400 transition-colors">{t.nav?.performance || "Hiệu suất"}</a>
          <a href="#pricing" className="hover:text-green-400 transition-colors">{t.nav?.pricing || "Bảng giá"}</a>
        </div>

        {/* --- 3. KHU VỰC BÊN PHẢI (CHỨA CẢ LANG + USER + MENU MOBILE) --- */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* 🔥 NÚT ĐỔI NGÔN NGỮ (LUÔN HIỆN TRÊN CẢ MOBILE & PC) */}
          <button 
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="flex items-center gap-1.5 text-xs font-bold border border-slate-700 rounded-lg px-2.5 py-2 hover:border-green-500 transition-colors bg-slate-900/80 text-slate-300"
          >
            <Globe size={16} className="text-green-500" />
            <span className="uppercase">{language}</span>
          </button>

          {/* --- USER / LOGIN (CHỈ HIỆN TRÊN PC) --- */}
          <div className="hidden md:block">
            {user ? (
              // ✅ PC: ĐÃ LOGIN
              <Link 
                href="/dashboard" 
                className="flex items-center gap-3 bg-slate-900 border border-slate-700 hover:border-green-500/50 pl-2 pr-4 py-1.5 rounded-full transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold overflow-hidden">
                   {user.photoURL ? (
                     <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                   ) : (
                     <User size={18} />
                   )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white uppercase group-hover:text-green-400 truncate max-w-[100px]">
                    {profile?.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[9px] text-green-500 font-bold tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    ONLINE
                  </span>
                </div>
              </Link>
            ) : (
              // ❌ PC: CHƯA LOGIN
              <Link 
                href="/login"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-6 py-2 rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-105"
              >
                <LogIn className="w-4 h-4" />
                {t.nav?.login || "Đăng nhập"}
              </Link>
            )}
          </div>

          {/* --- NÚT 3 GẠCH (CHỈ HIỆN TRÊN MOBILE) --- */}
          <button 
            className="md:hidden text-white hover:text-green-500 transition-colors p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

        </div>

      </div>
      
      {/* --- 4. MOBILE MENU DROPDOWN --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-5 h-screen z-40">
          
          {/* Links Mobile */}
          <div className="flex flex-col gap-4 text-base font-bold text-slate-300">
             <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-between items-center hover:text-green-400 py-3 border-b border-slate-800/50">
               {t.nav?.features || "Tính năng"} <ChevronRight size={16}/>
             </a>
             <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-between items-center hover:text-green-400 py-3 border-b border-slate-800/50">
               {t.nav?.pricing || "Bảng giá"} <ChevronRight size={16}/>
             </a>
          </div>

          {/* Mobile Auth Section */}
          {user ? (
            // ✅ Mobile: Đã Login
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 mt-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-black font-bold overflow-hidden border-2 border-slate-700">
                  {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <User size={24} />}
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{profile?.displayName || "Chiến Binh"}</p>
                  <p className="text-xs text-green-500 font-mono flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded w-fit mt-1">
                     <Shield size={10} /> Đã kích hoạt
                  </p>
                </div>
              </div>
              <Link 
                href="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 bg-green-500 text-black font-black rounded-xl flex items-center justify-center gap-2 text-lg shadow-lg active:scale-95 transition-transform"
              >
                <LayoutDashboard size={20} /> {t.nav?.dashboard || "VÀO DASHBOARD"}
              </Link>
            </div>
          ) : (
            // ❌ Mobile: Chưa Login
            <div className="flex flex-col gap-3 mt-auto mb-10">
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center border border-slate-700 hover:bg-slate-700"
              >
                <User size={20} className="mr-2"/> Đăng nhập
              </Link>
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 bg-green-500 text-black font-black rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:scale-105 transition-transform"
              >
                <Zap size={20} fill="currentColor" className="mr-2"/> THAM CHIẾN NGAY
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}