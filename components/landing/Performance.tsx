"use client";
import React from 'react';
import { TrendingUp, Activity, PieChart, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

const MOCK_HISTORY = [
  { time: "15 mins ago", symbol: "XAUUSD", type: "BUY", profit: "+$125.50", status: "WIN" },
  { time: "4 hours ago", symbol: "XAUUSD", type: "SELL", profit: "+$89.20", status: "WIN" },
  { time: "Yesterday", symbol: "XAUUSD", type: "BUY", profit: "-$42.00", status: "LOSS" },
  { time: "Yesterday", symbol: "XAUUSD", type: "BUY", profit: "+$210.00", status: "WIN" },
  { time: "2 days ago", symbol: "XAUUSD", type: "SELL", profit: "+$55.40", status: "WIN" },
];

export default function Performance() {
  const { t } = useLanguage();
  const h = t.performance?.highlights; 

  if (!h) return null;

  return (
    <section id="performance" className="relative z-10 py-24 bg-[#0B1120] overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-emerald-500 font-bold text-xs tracking-widest uppercase mb-3">
            {t.performance.sub}
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            {t.performance.title}
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
            {t.performance.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <StatCard 
              label={h.card1_label} 
              value={h.card1_val} 
              trend={h.pf_badge}
              trendColor="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
            />
            <StatCard 
              label={h.card2_label} 
              value={h.card2_val} 
              trend={h.compounding_badge}
              trendColor="text-blue-400 bg-blue-500/10 border-blue-500/20"
              icon={<Activity className="w-5 h-5 text-blue-500" />}
            />
            <StatCard 
              label={h.card3_label} 
              value={h.card3_val} 
              trend={h.risk_badge}
              trendColor="text-amber-400 bg-amber-500/10 border-amber-500/20"
              icon={<PieChart className="w-5 h-5 text-amber-500" />}
            />
            <StatCard 
              label={h.card4_label} 
              value={h.card4_val} 
              trend={h.winrate_badge}
              trendColor="text-purple-400 bg-purple-500/10 border-purple-500/20"
              icon={<CheckCircle2 className="w-5 h-5 text-purple-500" />}
            />
          </div>

          <div className="relative">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-5 py-4 border-b border-slate-800 bg-[#0B1120] flex items-center justify-between">
                <h4 className="font-bold text-slate-300 uppercase text-xs tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  {t.performance.live_log.title}
                </h4>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Server: GMT+0</span>
              </div>
              
              <div className="p-0">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-[#111827] border-b border-slate-800">
                      <th className="py-3 px-5">{t.performance.live_log.col_symbol}</th>
                      <th className="py-3 px-5">{t.performance.live_log.col_type}</th>
                      <th className="py-3 px-5 text-right">{t.performance.live_log.col_profit}</th>
                      <th className="py-3 px-5 text-right">{t.performance.live_log.col_time}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {MOCK_HISTORY.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-5 font-bold text-white text-xs">{item.symbol}</td>
                        <td className="py-3 px-5">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                            item.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className={`py-3 px-5 text-right font-mono font-bold text-xs ${
                          item.status === 'WIN' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {item.profit}
                        </td>
                        <td className="py-3 px-5 text-right text-slate-500 text-[11px] font-mono">
                          {item.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, trend, icon, trendColor }: any) {
  return (
    <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-[#0B1120] rounded-xl border border-slate-800">
          {icon}
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${trendColor}`}>
          {trend}
        </span>
      </div>
      <p className="text-2xl font-bold text-white mb-1 tracking-tight">{value}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{label}</p>
    </div>
  );
}