"use client";
import React from 'react';
import { TrendingUp, DollarSign, BarChart3, Terminal } from "lucide-react";
import { useLanguage } from '@/app/context/LanguageContext';

export default function Efficiency() {
  const { t } = useLanguage(); 
  const content = t.performance?.efficiency; 

  if (!content) return null;

  return (
    <section className="py-24 bg-[#0B1120] border-y border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Cột trái: Nội dung */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{content.tag}</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight tracking-tight">
              {content.title_1} <br/>
              <span className="text-emerald-500">
                {content.title_2}
              </span>
            </h2>
            
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              {content.desc}
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-center text-emerald-500 shadow-sm">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-mono tracking-tight">88.5%</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{content.items.winrate}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-center text-blue-500 shadow-sm">
                  <DollarSign size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-mono tracking-tight">1:3.5</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{content.items.rr}</div>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-center text-amber-500 shadow-sm">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-mono tracking-tight">5.2%</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{content.items.dd}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Mô phỏng Terminal */}
          <div className="relative">
             <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full opacity-50"></div>
             
             <div className="relative bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-[#0B1120] px-4 py-3 border-b border-slate-800 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-red-500 transition-colors"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-amber-500 transition-colors"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-emerald-500 transition-colors"></div>
                  </div>
                  <div className="ml-2 text-xs text-slate-500 font-mono font-medium flex items-center gap-2">
                    <Terminal size={14} /> spartan_v7.3_syslog.exe
                  </div>
                </div>
                
                <div className="p-6 font-mono text-sm space-y-3 h-[320px] overflow-y-auto custom-scrollbar">
                   <div className="text-emerald-500 font-semibold">admin@spartan-core:~$ ./initialize_bot.sh</div>
                   <div className="text-slate-300">⚡ {content.terminal.init}</div>
                   <div className="text-slate-500">[10:00:05] {content.terminal.scan}</div>
                   <div className="text-slate-500">[10:05:22] {content.terminal.signal}</div>
                   <div className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded inline-block border border-emerald-500/20">
                     [10:05:23] {content.terminal.buy} @ 2035.50 | SL: 2030.00 | TP: 2045.00
                   </div>
                   <div className="text-slate-500">[11:45:00] {content.terminal.trailing}</div>
                   <div className="text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded inline-block border border-blue-500/20">
                     [13:20:10] {content.terminal.tp} @ 2045.00 | PnL: +$950.00
                   </div>
                   <div className="text-slate-400 font-semibold">[13:20:11] {content.terminal.balance} <span className="text-white">$10,950.00</span></div>
                   <div className="text-emerald-500 animate-pulse font-black">_</div>
                </div>
             </div>
          </div>

        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0B1120; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </section>
  );
}