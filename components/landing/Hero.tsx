"use client";
import React, { useState } from 'react';
import { ArrowRight, PlayCircle, X } from 'lucide-react';
import { useLanguage } from '../../app/context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();
  const [isOpen, setOpen] = useState(false); // Trạng thái mở video

  // ID Video Youtube của Đại tá
  const VIDEO_ID = "Jf2CZdV1TuU"; 

  return (
    <section className="relative z-10 pt-32 pb-20 text-center px-4">
      {/* BADGE TRẠNG THÁI */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-8 animate-fade-in-up">
        <span className="relative flex h-2 w-2">
           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
           <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-xs font-mono text-green-400 tracking-widest uppercase">
          {t.hero.badge}
        </span>
      </div>

      {/* TIÊU ĐỀ CHIẾN THUẬT */}
      <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-tight">
        {t.hero.title_1} <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-yellow-400">
          {t.hero.title_2}
        </span>
      </h1>

      <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.hero.desc }} />

      {/* CỤM NÚT BẤM ĐIỀU KHIỂN */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <a href="#pricing" className="px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
          {t.hero.cta_primary} <ArrowRight className="w-5 h-5"/>
        </a>

        <button 
          onClick={() => setOpen(true)}
          className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 group"
        >
          <PlayCircle className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform"/>
          <span>{t.hero.cta_secondary}</span>
        </button>
      </div>

      {/* STATS BAR */}
      <div className="mt-20 border-y border-white/5 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-8">
           <StatItem label={t.hero.stats.winrate} value="97.56%" color="text-green-400" />
           <StatItem label={t.hero.stats.profit} value="7.3M" color="text-yellow-400" />
           <StatItem label={t.hero.stats.latency} value="< 5ms" color="text-blue-400" />
           <StatItem label={t.hero.stats.users} value="1,204" color="text-white" />
        </div>
      </div>

      {/* --- MODAL VIDEO POPUP (BẢN NÂNG CẤP) --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Lớp nền đen mờ - Nhấn vào đây là đóng phim (Hủy Autoplay ngay lập tức) */}
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setOpen(false)}></div>
          
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.2)] border border-slate-700 animate-in fade-in zoom-in duration-300">
            
            {/* Nút đóng X siêu ngầu */}
            <button 
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full transition-all group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform" />
            </button>

            {/* IFRAME YOUTUBE: AUTOPLAY + LOOP + NO RELATED VIDEOS */}
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
      <p className={`text-3xl font-black ${color} font-mono mb-1`}>{value}</p>
      <p className="text-xs text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}