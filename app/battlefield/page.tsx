"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { 
  Activity, ShieldAlert, WifiOff, Target, Radio, Sword, Lock,
  Trash2, X, History, ArrowDownAZ, Signal, Loader2, Wallet, TrendingUp
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

export default function BattlefieldDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBot, setSelectedBot] = useState<any | null>(null);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 🔒 KIỂM TRA QUYỀN
  if (authLoading) return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center gap-4">
      <Loader2 size={40} className="animate-spin text-blue-500" />
      <div className="text-slate-500 font-mono text-sm tracking-widest uppercase">:: CHECKING CLEARANCE ::</div>
    </div>
  );
  
  if (!isAdmin) {
      return (
          <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center text-center p-8 bg-[#111827] border border-red-500/20 rounded-[2rem] shadow-2xl">
                  <div className="bg-red-500/10 p-5 rounded-2xl mb-6">
                    <ShieldAlert size={64} className="text-red-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white uppercase mb-3 tracking-tight">Khu Vực Hạn Chế</h2>
                  <p className="text-slate-400 mb-8 max-w-md">Bạn không có thẩm quyền truy cập Trung tâm Chỉ huy Chiến trường.</p>
                  <div className="px-6 py-3 bg-[#0B1120] border border-red-500/30 rounded-xl text-red-500 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Lock size={14} /> SECURITY_PROTOCOL_403_ENFORCED
                  </div>
              </div>
          </div>
      );
  }

  // 🎧 LẮNG NGHE BOT REAL-TIME
  useEffect(() => {
    const q = query(collection(db, "bots")); 
    const unsub = onSnapshot(q, (snapshot) => {
      setBots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDeleteBot = async (botId: string) => {
      if(!confirm("⚠️ CẢNH BÁO: Xóa dữ liệu trạm Bot này?")) return;
      try { await deleteDoc(doc(db, "bots", botId)); } catch (e) { alert("Lỗi: " + e); }
  };

  // ✅ TRUY LỤC TRADES 
  const openBotDetail = async (bot: any) => {
    setSelectedBot(bot);
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, "bots", bot.id, "trades"), 
        orderBy("time", "desc") 
      );
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTradeHistory(history);
    } catch (e) {
      console.error("Lỗi truy lục trades:", e);
    }
    setLoadingHistory(false);
  };

  const stats = useMemo(() => {
    const now = Date.now();
    let totalBalance = 0; let totalEquity = 0; 
    let totalFloating = 0; let totalRealized = 0; 
    let potentialCommission = 0; 
    let onlineCount = 0; let offlineCount = 0; 

    let processedList = bots.map(bot => {
      const isOnline = (now - (bot.lastHeartbeat ? new Date(bot.lastHeartbeat).getTime() : 0)) < 120000; 
      if (isOnline) onlineCount++; else offlineCount++;

      totalBalance += (Number(bot.balance) || 0);
      totalEquity += (Number(bot.equity) || 0);
      totalFloating += (Number(bot.floatingProfit) || 0);
      
      const realizedProfit = Number(bot.realizedProfit ?? bot.profit) || 0; 
      totalRealized += realizedProfit;

      const comm = (realizedProfit > 0) ? realizedProfit * 0.2 : 0;
      potentialCommission += comm;

      return { ...bot, isOnline, commission: comm, realizedProfit };
    });

    processedList.sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        const nameA = (a.botName || a.id || "").toString().toLowerCase();
        const nameB = (b.botName || b.id || "").toString().toLowerCase();
        return nameA.localeCompare(nameB);
    });

    return { totalBots: bots.length, onlineCount, offlineCount, totalBalance, totalEquity, totalFloating, totalRealized, potentialCommission, processedBots: processedList };
  }, [bots]);

  if (loading) return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center gap-4">
      <Loader2 size={40} className="animate-spin text-blue-500" />
      <div className="text-slate-500 font-mono text-sm tracking-widest uppercase">INITIALIZING BATTLEFIELD...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans p-4 md:p-8 relative overflow-hidden">
      
      {/* Nền Grid mờ ảo TailAdmin */}
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

      {/* ================= HEADER ================= */}
      <div className="relative z-10 border-b border-slate-800 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-blue-600/10 p-3 rounded-xl border border-blue-500/20">
                <Target className="text-blue-500 animate-pulse" size={28} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
                    SPARTAN <span className="text-blue-500">WAR ROOM</span>
                </h1>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Global Dashboard</p>
            </div>
        </div>
        <div className="text-left sm:text-right bg-[#111827] px-6 py-3 rounded-2xl border border-slate-800 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">TOTAL EQUITY</p>
            <p className="text-3xl font-bold text-white font-mono tracking-tight">${stats.totalEquity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 relative z-10">
        
        {/* ACTIVE UNITS */}
        <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">ACTIVE UNITS</p>
                <div className="p-2 bg-blue-500/10 rounded-lg"><Activity size={16} className="text-blue-500"/></div>
            </div>
            <h3 className="text-3xl font-bold text-white font-mono mt-auto">
                {stats.onlineCount} <span className="text-base text-slate-500 font-sans">/ {stats.totalBots}</span>
            </h3>
        </div>

        {/* WAR CHEST */}
        <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <p className="text-[11px] text-amber-500 font-bold uppercase tracking-wider">WAR CHEST (BAL)</p>
                <div className="p-2 bg-amber-500/10 rounded-lg"><Wallet size={16} className="text-amber-500"/></div>
            </div>
            <h3 className="text-3xl font-bold text-white font-mono mt-auto">${stats.totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
        </div>

        {/* NET PROFIT */}
        <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-wider">NET REALIZED</p>
                <div className="p-2 bg-emerald-500/10 rounded-lg"><TrendingUp size={16} className="text-emerald-500"/></div>
            </div>
            <h3 className={`text-3xl font-bold font-mono mt-auto ${stats.totalRealized >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                {stats.totalRealized > 0 ? '+' : ''}{stats.totalRealized.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </h3>
            <p className={`text-[11px] font-mono mt-1 ${stats.totalFloating >= 0 ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                Float: {stats.totalFloating.toFixed(2)}
            </p>
        </div>

        {/* COMMANDER CUT */}
        <div className="bg-purple-900/10 border border-purple-500/20 p-6 rounded-2xl shadow-sm flex flex-col group hover:border-purple-500/40 transition-colors">
             <div className="flex justify-between items-start mb-2">
                <p className="text-[11px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><Sword size={14}/> LOOT (20%)</p>
             </div>
             <h3 className="text-3xl font-bold text-purple-400 mt-auto font-mono tracking-tight">${stats.potentialCommission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
        </div>
      </div>

      {/* ================= LIVE FEED TABLE ================= */}
      <div className="border border-slate-800 bg-[#111827] rounded-2xl shadow-sm relative z-10 overflow-hidden">
        
        {/* Table Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
            <h3 className="font-bold text-white flex items-center gap-2.5 text-sm uppercase tracking-wider">
                <Radio size={18} className="text-blue-500 animate-pulse"/> LIVE FEED SATELLITE
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold border border-slate-700 bg-[#0B1120] px-3 py-1.5 rounded-lg tracking-wider shadow-inner">
                <Signal size={12} className="text-slate-500"/> SORT: ONLINE &gt; OFFLINE
            </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-[#0B1120] text-slate-400 uppercase font-bold text-[10px] tracking-widest border-b border-slate-800">
                    <tr>
                        <th className="p-5 w-32">STATUS</th>
                        <th className="p-5">OPERATOR ID</th>
                        <th className="p-5 text-right">BALANCE</th>
                        <th className="p-5 text-right">PROFIT</th>
                        <th className="p-5 text-right text-purple-400">LOOT</th>
                        <th className="p-5 text-center">LAST PING</th>
                        <th className="p-5 text-right">ACT</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                    {stats.processedBots.map((bot: any) => (
                        <tr key={bot.id} onClick={() => openBotDetail(bot)} className={`hover:bg-slate-800/30 cursor-pointer transition-colors ${!bot.isOnline ? 'opacity-40 grayscale' : ''}`}>
                            {/* Status */}
                            <td className="p-5">
                                {bot.isOnline ? (
                                    <div className="flex flex-col gap-1.5">
                                        <span className="inline-flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md w-fit border border-emerald-500/20">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div> ONLINE
                                        </span>
                                        {bot.brainActive === false && (
                                            <span className="inline-flex items-center gap-1 text-[9px] text-amber-500 font-bold uppercase">
                                                <ShieldAlert size={10}/> PYTHON LOST
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase bg-slate-800 px-2 py-0.5 rounded-md w-fit border border-slate-700">
                                        <WifiOff size={10}/> OFFLINE
                                    </span>
                                )}
                            </td>
                            
                            {/* Operator */}
                            <td className="p-5">
                                <div className="font-bold text-white uppercase tracking-tight">{bot.botName || "UNKNOWN"}</div>
                                <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-2">
                                    <span className="bg-[#0B1120] px-1.5 py-0.5 rounded border border-slate-700">MT5: {bot.mt5Account}</span>
                                    <span>{bot.symbol || "---"}</span>
                                </div>
                            </td>
                            
                            {/* Balance */}
                            <td className="p-5 text-right text-slate-300 font-mono font-medium">${(bot.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            
                            {/* Profit */}
                            <td className="p-5 text-right font-mono">
                                <div className={`font-bold text-base tracking-tight ${(bot.realizedProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {(bot.realizedProfit ?? bot.profit ?? 0).toFixed(2)}
                                </div>
                                <div className={`text-[10px] mt-0.5 ${(bot.floatingProfit || 0) >= 0 ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                                    F: {(bot.floatingProfit || 0).toFixed(2)}
                                </div>
                            </td>
                            
                            {/* Loot */}
                            <td className="p-5 text-right font-bold font-mono text-purple-400">+${(bot.commission || 0).toFixed(2)}</td>
                            
                            {/* Last Ping */}
                            <td className="p-5 text-center text-[11px] text-slate-500 font-mono">
                                {bot.lastHeartbeat ? new Date(bot.lastHeartbeat).toLocaleTimeString('vi-VN') : 'NEVER'}
                            </td>
                            
                            {/* Action */}
                            <td className="p-5 text-right">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteBot(bot.id); }} 
                                    className="text-slate-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors inline-flex justify-center"
                                    title="Xóa Bot này"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    
                    {stats.processedBots.length === 0 && (
                        <tr>
                            <td colSpan={7} className="py-16 text-center text-slate-500 font-medium text-sm">
                                <div className="flex flex-col items-center gap-3">
                                    <Target size={32} className="opacity-20" />
                                    Không có tín hiệu từ bất kỳ chiến binh nào
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* ================= MODAL DETAIL (ARCHIVE) ================= */}
      {selectedBot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#0B1120]/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-5xl bg-[#111827] border border-slate-700 rounded-3xl flex flex-col max-h-full shadow-2xl overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-[#0B1120] flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white uppercase flex items-center gap-3 tracking-tight">
                    <History size={24} className="text-blue-500"/> 
                    COMMAND ARCHIVE
                </h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">UNIT: {selectedBot.botName}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">MT5: {selectedBot.mt5Account}</span>
                </div>
              </div>
              <button onClick={() => setSelectedBot(null)} className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors bg-slate-900 border border-slate-800">
                  <X size={20} />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* Mini Stats inside Modal */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="border border-slate-800 rounded-2xl p-4 bg-[#0B1120] shadow-inner">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Balance</p>
                  <p className="text-2xl font-bold text-white font-mono">${(selectedBot.balance || 0).toLocaleString()}</p>
                </div>
                <div className="border border-slate-800 rounded-2xl p-4 bg-[#0B1120] shadow-inner">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Equity</p>
                  <p className="text-2xl font-bold text-white font-mono">${(selectedBot.equity || 0).toLocaleString()}</p>
                </div>
                <div className="border border-slate-800 rounded-2xl p-4 bg-[#0B1120] shadow-inner">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Net Profit</p>
                  <p className={`text-2xl font-bold font-mono tracking-tight ${(selectedBot.realizedProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${(selectedBot.realizedProfit ?? selectedBot.profit ?? 0).toFixed(2)}
                  </p>
                  <p className={`text-[10px] mt-1 font-mono ${(selectedBot.floatingProfit || 0) >= 0 ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                      F: {(selectedBot.floatingProfit || 0).toFixed(2)}
                  </p>
                </div>
                <div className="border border-purple-500/20 rounded-2xl p-4 bg-purple-500/10 shadow-inner">
                  <p className="text-[10px] text-purple-400 font-bold uppercase flex items-center gap-1.5 tracking-wider mb-1"><Sword size={14}/> Commander Loot</p>
                  <p className="text-2xl font-bold text-purple-400 font-mono tracking-tight">
                      ${((selectedBot.realizedProfit ?? selectedBot.profit ?? 0) > 0 ? (selectedBot.realizedProfit ?? selectedBot.profit ?? 0) * 0.2 : 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* History Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#0B1120] shadow-inner">
                <div className="p-4 border-b border-slate-800 bg-[#111827]">
                    <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                        <History size={16} className="text-slate-500"/> Trade History Logs
                    </h3>
                </div>
                {loadingHistory ? (
                  <div className="p-16 text-center text-slate-500 font-semibold uppercase tracking-widest flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-blue-500" size={32}/>
                      ĐANG TRUY LỤC HỒ SƠ...
                  </div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#0B1120] text-slate-400 font-bold text-[10px] uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                            <tr><th className="p-4">TICKET</th><th className="p-4">TYPE</th><th className="p-4 text-right">LOTS</th><th className="p-4 text-right text-white">PROFIT (NET)</th><th className="p-4 text-center">TIME</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                            {tradeHistory.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-slate-500 italic text-sm">Không tìm thấy bản ghi giao dịch nào.</td></tr>
                            ) : (
                                tradeHistory.map((trade: any) => (
                                <tr key={trade.id} className="hover:bg-[#111827] transition-colors">
                                    <td className="p-4 text-slate-500 font-mono text-xs">#{trade.ticket}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${trade.type?.toString().toUpperCase().includes('BUY') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${trade.type?.toString().toUpperCase().includes('BUY') ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                            {trade.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right text-slate-300 font-mono">{(trade.volume || trade.lots || 0).toFixed(2)}</td>
                                    <td className={`p-4 text-right font-bold font-mono text-base tracking-tight ${trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {trade.profit > 0 ? '+' : ''}${(trade.profit || 0).toFixed(2)}
                                    </td>
                                    <td className="p-4 text-center text-slate-500 text-[11px] font-mono">
                                    {(() => {
                                        const rawDate = trade.time || trade.timestamp;
                                        if (!rawDate) return "---";
                                        const dateObj = new Date(rawDate);
                                        return isNaN(dateObj.getTime()) ? "Format Error" : dateObj.toLocaleString('vi-VN', {
                                        hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit'
                                        });
                                    })()}
                                    </td>
                                </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
              </div>
            </div>
            
            <div className="p-3 border-t border-slate-800 bg-[#0B1120] text-center shrink-0">
                <p className="text-[9px] text-slate-600 font-bold tracking-[0.3em] uppercase">:: DATA EXTRACTED FROM CENTRAL LEDGER ::</p>
            </div>
          </div>
        </div>
      )}

      {/* Global Style for custom scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0B1120;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}