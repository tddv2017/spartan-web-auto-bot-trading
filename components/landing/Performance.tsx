"use client";
import React from 'react';
import { TrendingUp, Activity, PieChart, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../app/context/LanguageContext';

// Dữ liệu giả lập cho bảng lịch sử (Sau này Đại tá có thể nối API thật vào đây)
const MOCK_HISTORY = [
  { time: "15 mins ago", symbol: "XAUUSD", type: "BUY", profit: "+$125.50", status: "WIN" },
  { time: "4 hours ago", symbol: "XAUUSD", type: "SELL", profit: "+$89.20", status: "WIN" },
  { time: "Yesterday", symbol: "XAUUSD", type: "BUY", profit: "-$42.00", status: "LOSS" },
  { time: "Yesterday", symbol: "XAUUSD", type: "BUY", profit: "+$210.00", status: "WIN" },
  { time: "2 days ago", symbol: "XAUUSD", type: "SELL", profit: "+$55.40", status: "WIN" },
];

export default function Performance() {
  const { t } = useLanguage();

  return (
    <section id="performance" className="relative z-10 py-24 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        
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
          
          {/* --- CỘT TRÁI: THỐNG KÊ TỔNG QUAN --- */}
          <div className="grid grid-cols-2 gap-6">
            <StatCard 
              label={t.performance.stats.total_gain} 
              value="+$7.2M" // Hoặc ghi %: "+72,000%"
              trend="Profit Factor 3.27" // Số PF quá đẹp, phải khoe ở đây
              icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            />
             <StatCard 
              label={t.performance.stats.monthly} 
              value="Autoscale" // Vì lãi kép nên không tính tháng cố định được
              trend="Lãi kép cực đại"
              icon={<Activity className="w-6 h-6 text-blue-500" />}
            />
             <StatCard 
              label={t.performance.stats.drawdown} 
              value="2.80%" // Con số huỷ diệt mọi đối thủ
              trend="Rủi ro siêu thấp"
              icon={<PieChart className="w-6 h-6 text-yellow-500" />}
            />
             <StatCard 
              label={t.performance.stats.won_trades} 
              value="10,450" 
              trend="Winrate ~97.4%" // Winrate này là vô đối
              icon={<CheckCircle2 className="w-6 h-6 text-purple-500" />}
            />

            {/* Link sang Myfxbook (Tăng độ uy tín) */}
            <div className="col-span-2 mt-4 p-4 bg-slate-900 rounded-xl border border-dashed border-slate-700 flex items-center justify-between hover:border-green-500/50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded flex items-center justify-center font-bold text-white text-xs">MYFX</div>
                <div>
                  <p className="text-white font-bold text-sm">Verified by Myfxbook</p>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 
                    Live Tracking
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-green-500 transition-colors"/>
            </div>
          </div>

          {/* --- CỘT PHẢI: BẢNG LIVE LOG --- */}
          <div className="relative">
            {/* Decor nền */}
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
                
                {/* Gradient che mờ phía dưới để tạo cảm giác danh sách dài */}
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-900 to-transparent"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// Component con: Card thống kê
function StatCard({ label, value, trend, icon }: any) {
  return (
    <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-green-500/30 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
          {icon}
        </div>
        <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
          {trend}
        </span>
      </div>
      <p className="text-2xl font-black text-white mb-1">{value}</p>
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}