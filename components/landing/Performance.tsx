"use client";
import React from 'react';
import { TrendingUp, Activity, PieChart, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import Efficiency from './Efficiency'; // Nếu có dùng Efficiency thì import vào

// Dữ liệu giả lập cho bảng lịch sử
const MOCK_HISTORY = [
  { time: "15 mins ago", symbol: "XAUUSD", type: "BUY", profit: "+$125.50", status: "WIN" },
  { time: "4 hours ago", symbol: "XAUUSD", type: "SELL", profit: "+$89.20", status: "WIN" },
  { time: "Yesterday", symbol: "XAUUSD", type: "BUY", profit: "-$42.00", status: "LOSS" },
  { time: "Yesterday", symbol: "XAUUSD", type: "BUY", profit: "+$210.00", status: "WIN" },
  { time: "2 days ago", symbol: "XAUUSD", type: "SELL", profit: "+$55.40", status: "WIN" },
];

export default function Performance() {
  const { t } = useLanguage();
  
  // 👇 LẤY DỮ LIỆU TỪ MỤC HIGHLIGHTS (Đã tạo ở content.ts)
  const h = t.performance?.highlights; 

  // Lưới an toàn: Nếu chưa load được từ điển thì không render để tránh lỗi
  if (!h) return null;

  return (
    <section id="performance" className="relative z-10 py-24 bg-slate-950 border-t border-slate-900 overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-green-500 font-mono text-sm tracking-widest uppercase mb-2">
            {t.performance.sub}
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t.performance.title}
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {t.performance.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* --- CỘT TRÁI: THỐNG KÊ TỔNG QUAN (ĐÃ KẾT NỐI TỪ ĐIỂN) --- */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* Card 1: Tổng lợi nhuận */}
            <StatCard 
              label={h.card1_label} 
              value={h.card1_val} 
              trend={h.pf_badge}
              trendColor="text-green-400 bg-green-500/10"
              icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            />
            
            {/* Card 2: Lãi kép (Autoscale) */}
            <StatCard 
              label={h.card2_label} 
              value={h.card2_val} 
              trend={h.compounding_badge}
              trendColor="text-blue-400 bg-blue-500/10"
              icon={<Activity className="w-6 h-6 text-blue-500" />}
            />
            
            {/* Card 3: Drawdown (Rủi ro) */}
            <StatCard 
              label={h.card3_label} 
              value={h.card3_val} 
              trend={h.risk_badge}
              trendColor="text-yellow-400 bg-yellow-500/10"
              icon={<PieChart className="w-6 h-6 text-yellow-500" />}
            />
            
            {/* Card 4: Winrate */}
            <StatCard 
              label={h.card4_label} 
              value={h.card4_val} 
              trend={h.winrate_badge}
              trendColor="text-purple-400 bg-purple-500/10"
              icon={<CheckCircle2 className="w-6 h-6 text-purple-500" />}
            />

          </div>

          {/* --- CỘT PHẢI: BẢNG LIVE LOG (Giữ nguyên logic cũ) --- */}
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/5 blur-3xl -z-10 rounded-full"></div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                <h4 className="font-mono text-sm font-bold text-slate-300 uppercase flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {t.performance.live_log.title}
                </h4>
                <span className="text-xs text-slate-500 font-mono">Server Time: GMT+0</span>
              </div>
              
              <div className="p-4">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 font-mono border-b border-slate-800/50">
                      <th className="pb-3 pl-2">{t.performance.live_log.col_symbol}</th>
                      <th className="pb-3">{t.performance.live_log.col_type}</th>
                      <th className="pb-3 text-right">{t.performance.live_log.col_profit}</th>
                      <th className="pb-3 text-right pr-2">{t.performance.live_log.col_time}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {MOCK_HISTORY.map((item, index) => (
                      <tr key={index} className="group hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 pl-2 font-bold text-white">{item.symbol}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className={`py-3 text-right font-mono font-bold ${
                          item.status === 'WIN' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {item.profit}
                        </td>
                        <td className="py-3 text-right text-slate-500 text-xs pr-2 font-mono">
                          {item.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-900 to-transparent"></div>
              </div>
            </div>
          </div>

        </div>
        
      </div>
    </section>
  );
}

// Component con: Card thống kê (Đã nâng cấp để nhận màu sắc động)
function StatCard({ label, value, trend, icon, trendColor }: any) {
  return (
    <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-green-500/30 transition-all hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
          {icon}
        </div>
        {/* Badge động */}
        <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded-full ${trendColor || 'text-slate-400 bg-slate-800'}`}>
          {trend}
        </span>
      </div>
      <p className="text-2xl font-black text-white mb-1">{value}</p>
      <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{label}</p>
    </div>
  );
}