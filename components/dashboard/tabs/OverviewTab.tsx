"use client";
import React, { useState } from 'react';
import { ShieldCheck, Wallet, Activity, CreditCard, Download, Terminal, Medal, Copy, Check } from 'lucide-react';
import { StatBox } from '../shared/StatBox';
// 🔥 IMPORT COMPONENT ĐIỀU KHIỂN
import { BotControlPanel } from '@/components/BotControlPanel';

export const OverviewTab = ({ profile, botData, isExpired, formatExpiryDate, onOpenPay, onOpenGuide }: any) => {
  const [copied, setCopied] = useState(false);

  // Logic xác định Quân Hàm (Rank)
  const getRankInfo = () => {
      if (profile?.plan === 'LIFETIME') return { label: "COMMANDER", color: "text-amber-400" };
      if (profile?.plan === 'yearly') return { label: "CAPTAIN", color: "text-yellow-400" };
      if (profile?.plan === 'starter') return { label: "LIEUTENANT", color: "text-blue-400" };
      return { label: "RECRUIT", color: "text-green-400" };
  };

  const handleCopy = () => {
    if (profile?.licenseKey) {
      navigator.clipboard.writeText(profile.licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const rankInfo = getRankInfo();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="text-3xl font-black text-white italic tracking-tighter">HEADQUARTERS</h1>
                <div className="flex flex-col gap-1 mt-1">
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                        MT5 ID: <span className="text-white font-mono font-bold">{profile?.mt5Account || 'N/A'}</span>
                    </p>
                    <div 
                        onClick={handleCopy}
                        className="group flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer hover:border-green-500/50 transition-all w-fit"
                        title="Click để sao chép License Key"
                    >
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">License Key:</span>
                        <code className="text-xs font-mono font-bold text-green-400">{profile?.licenseKey || 'SPARTAN-XXXXXX'}</code>
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-600 group-hover:text-white transition-colors" />}
                    </div>
                </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border tracking-widest shadow-lg ${isExpired ? 'border-red-500 text-red-500 bg-red-500/10 shadow-red-900/20' : 'border-green-500 text-green-500 bg-green-500/10 shadow-green-900/20'}`}>
                {isExpired ? '● LICENSE EXPIRED' : '● LICENSE ACTIVE'}
            </div>
        </div>

        {/* Stats Grid */}
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
            <StatBox 
                label="CẤP BẬC (RANK)" 
                value={rankInfo.label} 
                icon={<Medal size={20}/>} 
                color={rankInfo.color} 
            />
        </div>

        {/* 🔥 VỊ TRÍ MỚI: BỘ ĐIỀU KHIỂN BOT TỪ XA */}
        {profile && (
            <div className="animate-in zoom-in-95 duration-500">
                <BotControlPanel userData={profile} />
            </div>
        )}
        
        {/* Renewal Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-[2rem] border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                    <CreditCard size={24} className="text-green-500" />
                </div>
                <div>
                    <h3 className="font-black text-white uppercase tracking-tight">Gia hạn License</h3>
                    <p className="text-sm text-slate-400">Hết hạn vào: <span className="text-white font-bold">{formatExpiryDate()}</span></p>
                </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button onClick={() => onOpenPay("yearly")} className="flex-1 md:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold transition-all active:scale-95">GIA HẠN NĂM</button>
                <button onClick={() => onOpenPay("LIFETIME")} className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-black rounded-xl text-xs font-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95">NÂNG CẤP VIP</button>
            </div>
        </div>

        {/* Download & Guide Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/50">
            <a href="https://docs.google.com/uc?export=download&id=1shBbyi97q9danrZaWY9vCQtv8OOqR4op" className="bg-slate-900/50 hover:bg-slate-800 p-6 rounded-[2rem] border border-slate-800 flex items-center gap-4 group transition-all hover:border-green-500/50 cursor-pointer shadow-xl">
                <div className="bg-green-500/10 p-4 rounded-2xl text-green-500 group-hover:bg-green-500/20 group-hover:scale-110 transition-all border border-green-500/20"><Download size={28}/></div>
                <div><h4 className="font-black text-white text-lg tracking-tight uppercase">Tải Bot V7.3.3</h4><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Phiên bản Auto-update</p></div>
            </a>
            <button onClick={onOpenGuide} className="bg-slate-900/50 hover:bg-slate-800 p-6 rounded-[2rem] border border-slate-800 flex items-center gap-4 group transition-all hover:border-blue-500/50 text-left shadow-xl">
                <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-500 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all border border-blue-500/20"><Terminal size={28}/></div>
                <div><h4 className="font-black text-white text-lg tracking-tight uppercase">Hướng dẫn cài đặt</h4><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Xem URL & Các bước</p></div>
            </button>
        </div>
    </div>
  );
};