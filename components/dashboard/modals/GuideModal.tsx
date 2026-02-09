import React, { useState } from 'react';
import { X, Terminal } from 'lucide-react';

export const GuideModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const WEB_URL = "https://spartan-web-auto-bot-trading.vercel.app";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
       <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 md:p-8 relative shadow-2xl animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24}/></button>
        <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-6 uppercase"><Terminal className="text-green-500"/> Thiết lập Bot</h2>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-400 border border-slate-700 shrink-0">1</div>
            <div>
              <h3 className="font-bold text-white mb-1">Cấp quyền WebRequest (Quan trọng ⚠️)</h3>
              <p className="text-sm text-slate-400 mb-3">Vào <span className="text-yellow-400 font-mono">Tools</span> → <span className="text-yellow-400 font-mono">Options</span> → <span className="text-yellow-400 font-mono">Expert Advisors</span>. Tích chọn <span className="text-white font-bold">Allow WebRequest</span> và thêm link sau:</p>
              <div className="bg-black p-3 rounded-xl border border-slate-700 flex items-center gap-2 group">
                <code className="text-green-400 font-mono text-xs flex-1 truncate">{WEB_URL}</code>
                <button onClick={() => { navigator.clipboard.writeText(WEB_URL); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">{copied ? "ĐÃ COPY" : "COPY URL"}</button>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-400 border border-slate-700 shrink-0">2</div>
            <div>
              <h3 className="font-bold text-white mb-1">Cài đặt Bot vào MT5</h3>
              <p className="text-sm text-slate-400">Mở thư mục Data (File → Open Data Folder) → <span className="text-white font-mono">MQL5/Experts</span> và dán file Bot vào đó.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-400 border border-slate-700 shrink-0">3</div>
            <div>
              <h3 className="font-bold text-white mb-1">Bật Algo Trading</h3>
              <p className="text-sm text-slate-400">Nhấn nút <span className="text-green-500 font-bold uppercase">Algo Trading</span> trên thanh công cụ MT5 cho chuyển sang màu xanh (▶️).</p>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <button onClick={onClose} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-900/50">ĐÃ HIỂU, LÀM NGAY!</button>
        </div>
      </div>
    </div>
  );
};