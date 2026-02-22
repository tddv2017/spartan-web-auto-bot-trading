"use client";
import React, { useState } from 'react';
import { ArrowRight, PlayCircle, X } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();
  const [isOpen, setOpen] = useState(false); 

  const VIDEO_ID = "Jf2CZdV1TuU"; 

  return (
    <section className="relative z-10 pt-32 pb-20 text-center px-4 sm:px-6 lg:px-8">
      
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <span className="relative flex h-2 w-2">
           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
           <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
          {t.hero.badge}
        </span>
      </div>

      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 leading-[1.1] max-w-5xl mx-auto">
        {t.hero.title_1} <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
          {t.hero.title_2}
        </span>
      </h1>

      <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-400 mb-10 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: t.hero.desc }} />

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <a href="#pricing" className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm">
          {t.hero.cta_primary} <ArrowRight className="w-4 h-4"/>
        </a>

        <button 
          onClick={() => setOpen(true)}
          className="w-full sm:w-auto px-8 py-4 bg-[#111827] hover:bg-slate-800 text-white font-bold text-sm rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-2 group shadow-sm"
        >
          <PlayCircle className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform"/>
          <span>{t.hero.cta_secondary}</span>
        </button>
      </div>

      <div className="mt-24 border-y border-slate-800/50 bg-[#111827]/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-800/50">
           <StatItem label={t.hero.stats.winrate} value="97.56%" color="text-emerald-400" />
           <StatItem label={t.hero.stats.profit} value="7.3M" color="text-amber-400" />
           <StatItem label={t.hero.stats.latency} value="< 5ms" color="text-blue-400" />
           <StatItem label={t.hero.stats.users} value="1,204" color="text-white" />
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-[#0B1120]/95 backdrop-blur-sm" onClick={() => setOpen(false)}></div>
          
          <div className="relative w-full max-w-5xl aspect-video bg-[#0B1120] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-10 bg-[#111827]/80 hover:bg-red-500 border border-slate-700 hover:border-red-500 text-slate-300 hover:text-white p-2 rounded-xl transition-all group backdrop-blur-md"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform" />
            </button>
            <iframe 
              src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&loop=1&playlist=${VIDEO_ID}&rel=0&controls=1`} 
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture" 
              allowFullScreen
              title="Spartan V30 Backtest Demo"
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
}

function StatItem({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="text-center">
      <p className={`text-3xl font-bold ${color} font-mono mb-1 tracking-tight`}>{value}</p>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}