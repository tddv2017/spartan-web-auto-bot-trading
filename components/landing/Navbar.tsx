"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, X, Globe, User, LayoutDashboard, 
  ChevronRight, Shield, Zap 
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';

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
    <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${
      isScrolled 
        ? 'border-slate-800 bg-[#0B1120]/90 backdrop-blur-md py-4' 
        : 'border-transparent bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group z-50">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-[#0B1120] text-xl shadow-sm">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white leading-none">
              SPARTAN
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Trading System</span>
          </div>
        </Link>

        {/* MENU GIỮA */}
        <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">{t.nav?.features}</a>
          <a href="#performance" className="hover:text-white transition-colors">{t.nav?.performance}</a>
          <a href="#pricing" className="hover:text-white transition-colors">{t.nav?.pricing}</a>
        </div>

        {/* BÊN PHẢI */}
        <div className="flex items-center gap-3 md:gap-4">
          
          <button 
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="flex items-center gap-1.5 text-xs font-bold border border-slate-800 rounded-lg px-3 py-2 hover:bg-[#111827] hover:text-white transition-colors bg-[#0B1120] text-slate-400"
          >
            <Globe size={14} className="text-slate-500" />
            <span className="uppercase">{language}</span>
          </button>

          <div className="hidden md:block">
            {user ? (
              <Link 
                href="/dashboard" 
                className="flex items-center gap-3 bg-[#111827] border border-slate-800 hover:border-slate-600 pl-2 pr-4 py-1.5 rounded-full transition-all group shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 overflow-hidden">
                   {user.photoURL ? (
                     <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                   ) : (
                     <User size={16} />
                   )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[100px]">
                    {profile?.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Active
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2">
                  {t.nav?.login}
                </Link>
                <Link href="/login" className="flex items-center gap-2 bg-white hover:bg-slate-200 text-[#0B1120] px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm">
                  {t.nav?.join}
                </Link>
              </div>
            )}
          </div>

          <button 
            className="md:hidden text-slate-400 hover:text-white transition-colors p-2 bg-[#111827] border border-slate-800 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      
      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0B1120] border-b border-slate-800 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-5 h-screen z-40">
          <div className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
             <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-between items-center hover:bg-[#111827] hover:text-white px-4 py-3 rounded-xl transition-colors">
               {t.nav?.features} <ChevronRight size={16} className="text-slate-600"/>
             </a>
             <a href="#performance" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-between items-center hover:bg-[#111827] hover:text-white px-4 py-3 rounded-xl transition-colors">
               {t.nav?.performance} <ChevronRight size={16} className="text-slate-600"/>
             </a>
             <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-between items-center hover:bg-[#111827] hover:text-white px-4 py-3 rounded-xl transition-colors">
               {t.nav?.pricing} <ChevronRight size={16} className="text-slate-600"/>
             </a>
          </div>

          {user ? (
            <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 mt-2">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 overflow-hidden">
                  {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <User size={20} />}
                </div>
                <div>
                  <p className="font-bold text-white text-base tracking-tight">{profile?.displayName || t.nav?.warrior}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1 mt-1">
                     <Shield size={12} /> {t.nav?.activated}
                  </p>
                </div>
              </div>
              <Link 
                href="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors shadow-sm"
              >
                <LayoutDashboard size={18} /> {t.nav?.dashboard}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-auto mb-10">
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3.5 bg-[#111827] text-white font-bold rounded-xl flex items-center justify-center border border-slate-800 hover:border-slate-600 transition-colors text-sm"
              >
                {t.nav?.login}
              </Link>
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3.5 bg-white hover:bg-slate-200 text-[#0B1120] font-bold rounded-xl flex items-center justify-center shadow-sm transition-colors text-sm"
              >
                {t.nav?.join}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}