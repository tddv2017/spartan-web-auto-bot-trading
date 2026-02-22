"use client";
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { ArrowLeft, ShieldCheck, FileText, AlertTriangle, Lock } from 'lucide-react';

export default function TermsPage() {
  const { t } = useLanguage();
  const content = t.termsPage;

  if (!content) return null;

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans selection:bg-emerald-500/30">
      
      {/* HEADER STICKY */}
      <div className="bg-[#0B1120]/90 border-b border-slate-800 py-5 md:py-6 sticky top-0 z-50 backdrop-blur-md shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-lg transition-colors group">
            <ArrowLeft className="text-slate-400 group-hover:text-white transition-colors" size={20} />
          </Link>
          <h1 className="text-lg md:text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="text-emerald-500" size={24} />
            {content.header} <span className="text-emerald-500 hidden sm:inline ml-1">SPARTAN AI</span>
          </h1>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        
        {/* 1. ĐIỀU KHOẢN SỬ DỤNG */}
        <section id="terms" className="scroll-mt-28">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <FileText className="text-blue-500" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">{content.sec1.title}</h2>
          </div>
          <div className="bg-[#111827] p-6 md:p-8 rounded-2xl border border-slate-800 text-sm leading-relaxed space-y-5 shadow-sm">
            <p className="font-semibold text-white">{content.sec1.intro}</p>
            <ul className="list-none space-y-4">
              {content.sec1.items.map((item: any, index: number) => (
                <li key={index} className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></div>
                  <div>
                    <strong className="text-slate-200">{item.label}</strong> <span className="text-slate-400">{item.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 2. CẢNH BÁO RỦI RO (MÀU HỔ PHÁCH) */}
        <section className="scroll-mt-28">
          <div className="flex items-center gap-3 mb-6 border-b border-amber-900/30 pb-4">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <AlertTriangle className="text-amber-500 animate-pulse" size={24} />
            </div>
            <h2 className="text-xl font-bold text-amber-500 uppercase tracking-wider">{content.sec2.title}</h2>
          </div>
          <div className="bg-amber-500/5 p-6 md:p-8 rounded-2xl border border-amber-500/20 text-sm leading-relaxed space-y-5 shadow-sm">
            <p className="font-bold text-amber-500 uppercase tracking-widest text-xs">{content.sec2.warning}</p>
            <ul className="list-none space-y-4">
              {content.sec2.items.map((item: any, index: number) => (
                 <li key={index} className="flex gap-3">
                   <div className="mt-1.5 w-1.5 h-1.5 bg-amber-500/50 rounded-full shrink-0"></div>
                   <div>
                     <strong className="text-amber-200">{item.label}</strong> <span className="text-amber-100/70">{item.text}</span>
                   </div>
                 </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. CHÍNH SÁCH BẢO MẬT & HOÀN TIỀN */}
        <section id="policy" className="scroll-mt-28">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Lock className="text-emerald-500" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">{content.sec3.title}</h2>
          </div>
          <div className="bg-[#111827] p-6 md:p-8 rounded-2xl border border-slate-800 text-sm leading-relaxed shadow-sm">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Cột Bảo mật */}
              <div>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></span> {content.sec3.privacy_title}
                </h3>
                <p className="text-slate-400 text-justify">{content.sec3.privacy_text}</p>
              </div>
              {/* Cột Hoàn tiền */}
              <div>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"></span> {content.sec3.refund_title}
                </h3>
                <p className="text-slate-400 text-justify">{content.sec3.refund_text}</p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER ACTION */}
        <div className="text-center pt-12 border-t border-slate-800">
          <p className="text-slate-500 text-xs mb-8 italic">
            {content.last_update}
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-sm text-sm uppercase tracking-wider"
          >
            <ShieldCheck size={18} />
            {content.btn_home}
          </Link>
        </div>

      </div>
    </div>
  );
}