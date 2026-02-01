"use client";
import React from 'react';
import { Download, ShieldCheck, FileText } from 'lucide-react';
import { useLanguage } from '../../app/context/LanguageContext';

export default function VerifiedReport() {
  const { t } = useLanguage();

  return (
    <section className="relative z-10 py-20 bg-slate-950">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header */}
        <div className="border border-green-500/30 bg-slate-900/80 rounded-t-xl p-4 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="text-white font-bold font-mono tracking-wider text-sm md:text-base">
                {t.report.title}
              </h3>
              <p className="text-[10px] text-green-500 uppercase">{t.report.subtitle}</p>
            </div>
          </div>
          <div className="hidden md:block px-3 py-1 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400 font-mono animate-pulse">
            {t.report.status}
          </div>
        </div>

        {/* Nội dung báo cáo */}
        <div className="border-x border-b border-slate-800 bg-slate-900/50 p-6 md:p-10">
          
          {/* Thông tin Server */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-sm font-mono text-slate-400 border-b border-slate-800 pb-6">
            <div>
              <span className="block text-slate-600 text-xs uppercase mb-1">{t.report.server_info.server}</span>
              <span className="text-white">Exness-MT5Trial8</span>
            </div>
            <div>
              <span className="block text-slate-600 text-xs uppercase mb-1">{t.report.server_info.ea}</span>
              <span className="text-white">Spartan_FinalSniper_V7.2</span>
            </div>
            <div>
              <span className="block text-slate-600 text-xs uppercase mb-1">{t.report.server_info.period}</span>
              <span className="text-white">2025.01.01 - 2025.12.31</span>
            </div>
          </div>

          {/* CÁC CON SỐ HUỶ DIỆT */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <ReportItem label={t.report.stats.net_profit} value="$7,283,197.95" highlight={true} />
            <ReportItem label={t.report.stats.profit_factor} value="3.27" />
            <ReportItem label={t.report.stats.total_trades} value="10,450" />
            <ReportItem label={t.report.stats.max_dd} value="2.80%" />
            <ReportItem label={t.report.stats.short_win} value="97.56%" />
            <ReportItem label={t.report.stats.long_win} value="97.35%" />
            <ReportItem label={t.report.stats.initial_deposit} value="$10,000.00" />
            <ReportItem label={t.report.stats.abs_dd} value="$1,324.60" />
          </div>

          {/* TRÍCH XUẤT NHẬT KÝ (ĐÃ XOÁ COMMENT GÂY LỖI) */}
          <div className="bg-black/50 rounded-lg border border-slate-800 p-4 mb-8 font-mono text-xs overflow-x-auto">
            <div className="flex justify-between items-center mb-2 text-slate-500">
              <span>{t.report.journal.title}</span>
              <span>LOG_ID: #279469177</span>
            </div>
            <table className="w-full text-left whitespace-nowrap">
              <thead className="text-slate-600 border-b border-slate-800">
                <tr>
                  <th className="pb-2">{t.report.journal.headers[0]}</th>
                  <th className="pb-2">{t.report.journal.headers[1]}</th>
                  <th className="pb-2">{t.report.journal.headers[2]}</th>
                  <th className="pb-2 text-right">{t.report.journal.headers[3]}</th>
                  <th className="pb-2 text-right">{t.report.journal.headers[4]}</th>
                  <th className="pb-2 pl-4">{t.report.journal.headers[5]}</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-800/50">
                  <td className="py-1 text-slate-500">2025.12.24 16:15</td>
                  <td>#20888</td>
                  <td className="text-red-400">sell out</td>
                  <td className="text-right">4467.346</td>
                  <td className="text-right text-green-400 font-bold">+3,294.23</td>
                  <td className="pl-4 text-yellow-500">sl 4467.352 (Trailing)</td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-1 text-slate-500">2025.12.24 16:45</td>
                  <td>#20892</td>
                  <td className="text-red-400">sell out</td>
                  <td className="text-right">4475.489</td>
                  <td className="text-right text-green-400 font-bold">+618.99</td>
                  <td className="pl-4 text-yellow-500">sl 4475.490 (Trailing)</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500">2025.12.24 17:00</td>
                  <td>#20896</td>
                  <td className="text-red-400">sell out</td>
                  <td className="text-right">4478.547</td>
                  <td className="text-right text-green-400 font-bold">+5,848.01</td>
                  <td className="pl-4 text-yellow-500">sl 4478.571 (Trailing)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Nút tải file gốc */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-green-500/5 border border-green-500/20 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-full">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{t.report.btn.title}</p>
                <p className="text-slate-400 text-xs">{t.report.btn.desc}</p>
              </div>
            </div>
            
            <a 
              href="/spartan-backtest-v7.html" 
              target="_blank"
              download
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-black font-bold rounded-lg transition-all shadow-lg shadow-green-500/20 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              {t.report.btn.download}
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}

function ReportItem({ label, value, highlight = false }: any) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'bg-green-500/10 border-green-500/50' : 'bg-slate-950 border-slate-800'}`}>
      <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-mono font-bold ${highlight ? 'text-xl md:text-2xl text-green-400' : 'text-lg md:text-xl text-white'}`}>
        {value}
      </p>
    </div>
  );
}