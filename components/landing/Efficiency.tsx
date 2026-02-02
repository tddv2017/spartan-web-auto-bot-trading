"use client";
import React from 'react';
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { useLanguage } from '@/app/context/LanguageContext'; // 👈 1. Import Context

export default function Efficiency() {
  const { t } = useLanguage(); // 👈 2. Lấy từ điển
  const content = t.performance?.efficiency; // Rút gọn cho dễ gọi

  // Fallback nếu chưa load được ngôn ngữ
  if (!content) return null;

  return (
    <section className="py-24 bg-zinc-950 border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Cột trái: Nội dung */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 border border-green-500/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm text-green-400 font-mono tracking-widest">{content.tag}</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-mono text-white leading-tight">
              {content.title_1} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                {content.title_2}
              </span>
            </h2>
            
            <p className="text-gray-400 text-lg mb-8">
              {content.desc}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <TrendingUp />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-mono">88.5%</div>
                  <div className="text-sm text-gray-500">{content.items.winrate}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <DollarSign />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-mono">1:3.5</div>
                  <div className="text-sm text-gray-500">{content.items.rr}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <BarChart3 />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-mono">5.2%</div>
                  <div className="text-sm text-gray-500">{content.items.dd}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Mô phỏng Terminal */}
          <div className="relative">
             {/* Glow effect phía sau */}
             <div className="absolute -inset-4 bg-green-500/20 blur-3xl rounded-full opacity-30"></div>
             
             <div className="relative bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                {/* Thanh tiêu đề giả lập */}
                <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-2 text-xs text-gray-500 font-mono">spartan_v30_log.exe</div>
                </div>
                
                {/* Nội dung Terminal (Đã thay bằng biến content.terminal) */}
                <div className="p-6 font-mono text-sm space-y-3 h-[300px] overflow-y-auto">
                   <div className="text-green-500">user@spartan:~$ ./start_bot.sh</div>
                   <div className="text-white">🚀 {content.terminal.init}</div>
                   <div className="text-gray-500">[10:00:05] {content.terminal.scan}</div>
                   <div className="text-gray-500">[10:05:22] {content.terminal.signal}</div>
                   <div className="text-yellow-400">[10:05:23] <span className="bg-yellow-500/20 px-1 text-yellow-300">{content.terminal.buy}</span> @ 2035.50 | SL: 2030.00 | TP: 2045.00</div>
                   <div className="text-gray-500">[11:45:00] {content.terminal.trailing}</div>
                   <div className="text-green-400">[13:20:10] <span className="bg-green-500/20 px-1 text-green-300">{content.terminal.tp}</span> @ 2045.00 | PnL: +$950.00</div>
                   <div className="text-gray-500">[13:20:11] {content.terminal.balance} $10,950.00</div>
                   <div className="text-blue-400 animate-pulse">_</div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}