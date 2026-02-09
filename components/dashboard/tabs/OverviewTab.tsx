import React from 'react';
import { ShieldCheck, Wallet, Activity, CreditCard, Download, FileText, Terminal, Medal } from 'lucide-react';
import { StatBox } from '../shared/StatBox';

export const OverviewTab = ({ profile, botData, isExpired, formatExpiryDate, onOpenPay, onOpenGuide }: any) => {
  
  // Logic xác định Quân Hàm (Rank)
  const getRankInfo = () => {
      if (profile?.plan === 'LIFETIME') return { label: "COMMANDER", color: "text-amber-400" };
      if (profile?.plan === 'yearly') return { label: "CAPTAIN", color: "text-yellow-400" };
      if (profile?.plan === 'starter') return { label: "LIEUTENANT", color: "text-blue-400" };
      return { label: "RECRUIT", color: "text-green-400" };
  };

  const rankInfo = getRankInfo();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black text-white">HEADQUARTERS</h1>
                <p className="text-slate-400 text-sm">Trung tâm chỉ huy tài khoản {profile?.mt5Account}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${isExpired ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-green-500 text-green-500 bg-green-500/10'}`}>
                {isExpired ? 'LICENSE EXPIRED' : 'LICENSE ACTIVE'}
            </div>
        </div>

        {/* Stats Grid - Đã thêm lại QUÂN HÀM */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatBox 
                label="VỐN (EQUITY)" 
                value={`$${botData?.equity?.toFixed(2) || '0.00'}`} 
                icon={<ShieldCheck size={20}/>} 
                color="text-blue-400" 
            />
            <StatBox 
                label="SỐ DƯ (BALANCE)" 
                value={`$${botData?.balance?.toFixed(2) || '0.00'}`} 
                icon={<Wallet size={20}/>} 
                color="text-yellow-400" 
            />
            <StatBox 
                label="TRẠNG THÁI" 
                value={botData && (Date.now() - new Date(botData.lastHeartbeat).getTime() < 120000) ? "ONLINE 🟢" : "OFFLINE 🔴"} 
                icon={<Activity size={20}/>} 
                color={botData && (Date.now() - new Date(botData.lastHeartbeat).getTime() < 120000) ? "text-green-400" : "text-red-500"} 
            />
            {/* 👇 QUÂN HÀM ĐÃ TRỞ LẠI 👇 */}
            <StatBox 
                label="CẤP BẬC (RANK)" 
                value={rankInfo.label} 
                icon={<Medal size={20}/>} 
                color={rankInfo.color} 
            />
        </div>
        
        {/* Renewal Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h3 className="font-bold text-white flex items-center gap-2"><CreditCard size={18}/> Gia hạn License</h3>
                <p className="text-sm text-slate-400">Ngày hết hạn: <span className="text-white font-bold">{formatExpiryDate()}</span></p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => onOpenPay("yearly")} className="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold transition-all">Gia hạn năm</button>
                <button onClick={() => onOpenPay("LIFETIME")} className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black rounded-xl text-xs font-black hover:scale-105 transition-all shadow-lg shadow-amber-900/20">NÂNG CẤP VIP</button>
            </div>
        </div>

        {/* Download & Guide Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/50">
            <a href="https://docs.google.com/uc?export=download&id=1BGtSMioGSIk-kkSrhmvipGW1gTg4LHTQ" className="bg-slate-900/50 hover:bg-slate-800 p-6 rounded-2xl border border-slate-800 flex items-center gap-4 group transition-all hover:border-green-500/50 cursor-pointer">
                <div className="bg-green-500/20 p-4 rounded-xl text-green-500 group-hover:scale-110 transition-transform"><Download size={24}/></div>
                <div><h4 className="font-bold text-white text-lg">Tải Bot V7.3.3</h4><p className="text-xs text-slate-400">Phiên bản mới nhất (Auto-update)</p></div>
            </a>
            <button onClick={onOpenGuide} className="bg-slate-900/50 hover:bg-slate-800 p-6 rounded-2xl border border-slate-800 flex items-center gap-4 group transition-all hover:border-blue-500/50 text-left">
                <div className="bg-blue-500/20 p-4 rounded-xl text-blue-500 group-hover:scale-110 transition-transform"><Terminal size={24}/></div>
                <div><h4 className="font-bold text-white text-lg">Hướng dẫn cài đặt</h4><p className="text-xs text-slate-400">Xem URL & Các bước</p></div>
            </button>
        </div>
    </div>
  );
};