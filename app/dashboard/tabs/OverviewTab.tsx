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
      if (profile?.plan === 'yearly') return { label: "CAPTAIN", color: "text-blue-400" };
      if (profile?.plan === 'starter') return { label: "LIEUTENANT", color: "text-blue-400" };
      return { label: "RECRUIT", color: "text-emerald-400" };
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
    <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight uppercase">SỞ CHỈ HUY TỐI CAO</h1>
                <div className="flex flex-col gap-2 mt-2">
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                        MT5 ID: <span className="text-white font-mono font-bold bg-slate-800 px-2 py-0.5 rounded">{profile?.mt5Account || 'N/A'}</span>
                    </p>
                    <div 
                        onClick={handleCopy}
                        className="group flex items-center gap-2 bg-[#0B1120] border border-slate-700/60 px-3 py-2 rounded-lg cursor-pointer hover:border-emerald-500/50 transition-colors w-fit"
                        title="Click để sao chép License Key"
                    >
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">License Key:</span>
                        <code className="text-xs font-mono font-bold text-emerald-400 select-all">{profile?.licenseKey || 'SPARTAN-XXXXXX'}</code>
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />}
                    </div>
                </div>
            </div>
            <div className={`px-4 py-2 rounded-lg text-xs font-bold border tracking-wider shadow-sm uppercase ${isExpired ? 'border-red-500/30 text-red-500 bg-red-500/10' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'}`}>
                {isExpired ? '● LICENSE EXPIRED' : '● LICENSE ACTIVE'}
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatBox 
                label="VỐN (EQUITY)" 
                value={`$${botData?.equity?.toFixed(2) || '0.00'}`} 
                icon={<ShieldCheck size={18}/>} 
                color="text-blue-500" 
            />
            <StatBox 
                label="SỐ DƯ (BALANCE)" 
                value={`$${botData?.balance?.toFixed(2) || '0.00'}`} 
                icon={<Wallet size={18}/>} 
                color="text-amber-500" 
            />
            <StatBox 
                label="TRẠNG THÁI" 
                value={botData && (Date.now() - new Date(botData.lastHeartbeat).getTime() < 120000) ? "ONLINE 🟢" : "OFFLINE 🔴"} 
                icon={<Activity size={18}/>} 
                color={botData && (Date.now() - new Date(botData.lastHeartbeat).getTime() < 120000) ? "text-emerald-500" : "text-red-500"} 
            />
            <StatBox 
                label="CẤP BẬC (RANK)" 
                value={rankInfo.label} 
                icon={<Medal size={18}/>} 
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
        <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
            <div className="flex items-center gap-5">
                <div className="p-4 bg-blue-600/10 rounded-xl border border-blue-600/20">
                    <CreditCard size={24} className="text-blue-500" />
                </div>
                <div>
                    <h3 className="font-bold text-white uppercase tracking-tight text-lg">Quản lý Gia hạn</h3>
                    <p className="text-sm text-slate-400 mt-1">Ngày hết hạn: <span className="text-slate-200 font-bold font-mono">{formatExpiryDate()}</span></p>
                </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button onClick={() => onOpenPay("yearly")} className="flex-1 md:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors uppercase tracking-wider">GIA HẠN 1 NĂM</button>
                <button onClick={() => onOpenPay("LIFETIME")} className="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors uppercase tracking-wider shadow-lg shadow-blue-500/20">NÂNG CẤP LIFETIME</button>
            </div>
        </div>

        {/* Download & Guide Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href="https://docs.google.com/uc?export=download&id=1shBbyi97q9danrZaWY9vCQtv8OOqR4op" className="bg-[#111827] hover:bg-slate-800/80 p-6 rounded-2xl border border-slate-800 flex items-center gap-5 transition-colors cursor-pointer shadow-sm group">
                <div className="bg-[#0B1120] p-4 rounded-xl text-emerald-500 border border-slate-700/60 group-hover:border-emerald-500/30 transition-colors"><Download size={24}/></div>
                <div>
                    <h4 className="font-bold text-white text-base tracking-tight uppercase">Tải File Bot V7.3.3</h4>
                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Hỗ trợ Auto-update</p>
                </div>
            </a>
            <button onClick={onOpenGuide} className="bg-[#111827] hover:bg-slate-800/80 p-6 rounded-2xl border border-slate-800 flex items-center gap-5 transition-colors text-left shadow-sm group">
                <div className="bg-[#0B1120] p-4 rounded-xl text-purple-500 border border-slate-700/60 group-hover:border-purple-500/30 transition-colors"><Terminal size={24}/></div>
                <div>
                    <h4 className="font-bold text-white text-base tracking-tight uppercase">Hướng dẫn cài đặt MT5</h4>
                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Xem URL & Các bước</p>
                </div>
            </button>
        </div>
    </div>
  );
};