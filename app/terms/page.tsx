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
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-green-500 selection:text-black">
      
      {/* HEADER STICKY */}
      <div className="bg-slate-900 border-b border-slate-800 py-6 sticky top-0 z-50 backdrop-blur-md bg-opacity-80 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors group">
            <ArrowLeft className="text-white group-hover:-translate-x-1 transition-transform" />
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="text-green-500" />
            {content.header} <span className="text-green-500 hidden sm:inline">SPARTAN AI</span>
          </h1>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-16">
        
        {/* 1. ĐIỀU KHOẢN SỬ DỤNG */}
        <section id="terms" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <FileText className="text-blue-500" size={32} />
            <h2 className="text-2xl font-bold text-white uppercase">{content.sec1.title}</h2>
          </div>
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 text-sm leading-relaxed space-y-4 shadow-lg">
            <p className="font-medium text-white">{content.sec1.intro}</p>
            <ul className="list-disc pl-5 space-y-3 marker:text-blue-500 text-slate-400">
              {content.sec1.items.map((item: any, index: number) => (
                <li key={index}>
                  <strong className="text-slate-200">{item.label}</strong> {item.text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 2. CẢNH BÁO RỦI RO (MÀU HỔ PHÁCH) */}
        <section className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-6 border-b border-amber-900/30 pb-4">
            <AlertTriangle className="text-amber-500 animate-pulse" size={32} />
            <h2 className="text-2xl font-bold text-amber-500 uppercase">{content.sec2.title}</h2>
          </div>
          <div className="bg-amber-950/20 p-8 rounded-3xl border border-amber-500/20 text-sm leading-relaxed space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <p className="font-bold text-amber-200 uppercase tracking-wide">{content.sec2.warning}</p>
            <ul className="list-disc pl-5 space-y-3 marker:text-amber-500 text-amber-100/70">
              {content.sec2.items.map((item: any, index: number) => (
                 <li key={index}>
                   <strong className="text-amber-100">{item.label}</strong> {item.text}
                 </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. CHÍNH SÁCH BẢO MẬT & HOÀN TIỀN */}
        <section id="policy" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <Lock className="text-green-500" size={32} />
            <h2 className="text-2xl font-bold text-white uppercase">{content.sec3.title}</h2>
          </div>
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 text-sm leading-relaxed space-y-4 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Cột Bảo mật */}
              <div>
                <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-base">
                  <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></span> {content.sec3.privacy_title}
                </h3>
                <p className="text-slate-400 text-justify">{content.sec3.privacy_text}</p>
              </div>
              {/* Cột Hoàn tiền */}
              <div>
                <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-base">
                  <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></span> {content.sec3.refund_title}
                </h3>
                <p className="text-slate-400 text-justify">{content.sec3.refund_text}</p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER ACTION */}
        <div className="text-center pt-8 border-t border-slate-900">
          <p className="text-slate-500 text-xs mb-8 italic">
            {content.last_update}
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 text-slate-900 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95"
          >
            <ShieldCheck size={20} />
            {content.btn_home}
          </Link>
        </div>

      </div>
    </div>
  );
}