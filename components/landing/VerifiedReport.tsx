"use client";
import React from 'react';
import { Download, ShieldCheck, FileText } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function VerifiedReport() {
  const { t } = useLanguage();

  return (
    <section className="relative z-10 py-24 bg-[#0B1120] border-t border-slate-800/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-t-2xl p-5 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#111827] rounded-xl border border-slate-800">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-white font-bold tracking-tight text-base md:text-lg">
                {t.report.title}
              </h3>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">{t.report.subtitle}</p>
            </div>
          </div>
          <div className="hidden md:block px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
            {t.report.status}
          </div>
        </div>

        <div className="border-x border-b border-slate-800 bg-[#111827] p-6 md:p-10 rounded-b-2xl shadow-sm">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-sm font-mono text-slate-300 border-b border-slate-800 pb-8">
            <div>
              <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{t.report.server_info.server}</span>
              <span className="font-semibold">Exness-MT5Trial8</span>
            </div>
            <div>
              <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{t.report.server_info.ea}</span>
              <span className="font-semibold text-emerald-400">Spartan_FinalSniper_V7.3</span>
            </div>
            <div>
              <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{t.report.server_info.period}</span>
              <span className="font-semibold">2025.01.01 - 2025.12.31</span>
            </div>
          </div>

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

          <div className="bg-[#0B1120] rounded-xl border border-slate-800 p-5 mb-8 font-mono overflow-x-auto">
            <div className="flex justify-between items-center mb-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>{t.report.journal.title}</span>
              <span>LOG_ID: #279469177</span>
            </div>
            <table className="w-full text-left whitespace-nowrap text-sm">
              <thead className="text-slate-500 border-b border-slate-800 text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="pb-3">{t.report.journal.headers[0]}</th>
                  <th className="pb-3">{t.report.journal.headers[1]}</th>
                  <th className="pb-3">{t.report.journal.headers[2]}</th>
                  <th className="pb-3 text-right">{t.report.journal.headers[3]}</th>
                  <th className="pb-3 text-right">{t.report.journal.headers[4]}</th>
                  <th className="pb-3 pl-6">{t.report.journal.headers[5]}</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-2.5 text-slate-500 text-xs">2025.12.24 16:15</td>
                  <td className="text-xs">#20888</td>
                  <td className="text-red-400 text-xs">sell out</td>
                  <td className="text-right text-xs">4467.346</td>
                  <td className="text-right text-emerald-400 font-bold">+3,294.23</td>
                  <td className="pl-6 text-slate-500 text-xs">sl 4467.352 (Trailing)</td>
                </tr>
                <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-2.5 text-slate-500 text-xs">2025.12.24 16:45</td>
                  <td className="text-xs">#20892</td>
                  <td className="text-red-400 text-xs">sell out</td>
                  <td className="text-right text-xs">4475.489</td>
                  <td className="text-right text-emerald-400 font-bold">+618.99</td>
                  <td className="pl-6 text-slate-500 text-xs">sl 4475.490 (Trailing)</td>
                </tr>
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-2.5 text-slate-500 text-xs">2025.12.24 17:00</td>
                  <td className="text-xs">#20896</td>
                  <td className="text-red-400 text-xs">sell out</td>
                  <td className="text-right text-xs">4478.547</td>
                  <td className="text-right text-emerald-400 font-bold">+5,848.01</td>
                  <td className="pl-6 text-slate-500 text-xs">sl 4478.571 (Trailing)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-5 bg-[#0B1120] border border-slate-800 p-5 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#111827] border border-slate-800 rounded-xl">
                <FileText className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-white font-bold tracking-tight">{t.report.btn.title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{t.report.btn.desc}</p>
              </div>
            </div>
            
            <a 
              href="/spartan-backtest-v7.html" 
              target="_blank"
              download
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-200 text-[#0B1120] text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
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
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#0B1120] border-slate-800'}`}>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">{label}</p>
      <p className={`font-mono font-bold tracking-tight ${highlight ? 'text-xl md:text-2xl text-emerald-400' : 'text-lg md:text-xl text-white'}`}>
        {value}
      </p>
    </div>
  );
}