import React, { useState } from 'react';
import { X, Terminal, CheckCircle2 } from 'lucide-react';

export const GuideModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const WEB_URL = "https://spartan-web-auto-bot-trading.vercel.app";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0B1120]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
       <div className="bg-[#111827] border border-slate-800 w-full max-w-2xl rounded-2xl p-6 md:p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 p-1.5 rounded-lg"><X size={20}/></button>
        
        <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-8 uppercase tracking-wider border-b border-slate-800 pb-4">
            <Terminal className="text-blue-500"/> Thiết lập Spartan Bot
        </h2>
        
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center font-bold text-blue-500 border border-blue-500/20 shrink-0">1</div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1.5 text-sm uppercase tracking-wide">Cấp quyền WebRequest (Quan trọng ⚠️)</h3>
              <p className="text-sm text-slate-400 mb-3 leading-relaxed">Vào <span className="text-amber-400 font-mono font-semibold">Tools</span> → <span className="text-amber-400 font-mono font-semibold">Options</span> → <span className="text-amber-400 font-mono font-semibold">Expert Advisors</span>. Tích chọn <span className="text-white font-bold">Allow WebRequest</span> và thêm đường dẫn máy chủ sau:</p>
              <div className="bg-[#0B1120] p-1.5 rounded-xl border border-slate-700/60 flex items-center gap-2 group">
                <code className="text-emerald-400 font-mono text-sm flex-1 px-3 truncate select-all">{WEB_URL}</code>
                <button 
                  onClick={() => { navigator.clipboard.writeText(WEB_URL); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {copied ? <><CheckCircle2 size={14} className="text-emerald-500"/> ĐÃ SAO CHÉP</> : "COPY URL"}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700 shrink-0">2</div>
            <div>
              <h3 className="font-bold text-white mb-1.5 text-sm uppercase tracking-wide">Cài đặt Bot vào MT5</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Mở thư mục Data (File → Open Data Folder) → <span className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">MQL5/Experts</span> và dán file Bot `.ex5` vào đó.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700 shrink-0">3</div>
            <div>
              <h3 className="font-bold text-white mb-1.5 text-sm uppercase tracking-wide">Kích hoạt Algo Trading</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Nhấn nút <span className="text-emerald-500 font-bold border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-500/10">Algo Trading</span> trên thanh công cụ MT5 cho chuyển sang biểu tượng màu xanh (▶️).</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
          <button onClick={onClose} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-colors">ĐÃ HIỂU THAO TÁC</button>
        </div>
      </div>
    </div>
  );
};