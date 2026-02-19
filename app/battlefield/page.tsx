"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { 
  Activity, ShieldAlert, WifiOff, Target, Radio, Sword, Lock,
  Trash2, X, History, ArrowDownAZ, Signal
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
  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-green-800 font-mono animate-pulse">:: CHECKING CLEARANCE ::</div>;
  if (!isAdmin) {
      return (
          <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center text-center p-8">
                  <ShieldAlert size={80} className="text-red-600 animate-pulse mb-8" />
                  <h2 className="text-4xl font-black text-white uppercase mb-4">TOP SECRET</h2>
                  <div className="px-6 py-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 font-mono text-xs">
                      <Lock size={14} className="inline mr-2" /> SECURITY_PROTOCOL_403_ENFORCED
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
      if(!confirm("⚠️ CẢNH BÁO: Xóa Bot này?")) return;
      try { await deleteDoc(doc(db, "bots", botId)); } catch (e) { alert("Lỗi: " + e); }
  };

  // ✅ TRUY LỤC TRADES THEO TRƯỜNG "TIME"
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
      
      // 🔥 SỬA: Ưu tiên lấy realizedProfit, nếu không có mới lấy profit
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono animate-pulse">LOADING BATTLEFIELD...</div>;

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

      {/* HEADER HUD */}
      <div className="relative z-10 border-b-2 border-green-900/50 pb-6 mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl md:text-5xl font-black text-white italic flex items-center gap-3">
                <Target className="animate-pulse text-red-500" /> SPARTAN <span className="text-green-600">WAR ROOM</span>
            </h1>
        </div>
        <div className="text-right">
            <p className="text-[10px] text-green-600 font-bold">TOTAL EQUITY</p>
            <p className="text-2xl font-black text-white">${stats.totalEquity.toLocaleString()}</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 relative z-10">
        <div className="bg-black border border-green-800 p-4">
            <p className="text-green-700 text-[10px] font-bold uppercase mb-1">ACTIVE UNITS</p>
            <h3 className="text-4xl font-black text-white">{stats.onlineCount} <span className="text-sm text-green-600">/ {stats.totalBots}</span></h3>
        </div>
        <div className="bg-black border border-green-800 p-4">
            <p className="text-yellow-700 text-[10px] font-bold uppercase mb-1">WAR CHEST</p>
            <h3 className="text-3xl font-black text-white">${stats.totalBalance.toLocaleString()}</h3>
        </div>
        <div className="bg-black border border-green-800 p-4">
            <p className="text-green-700 text-[10px] font-bold uppercase mb-1">NET PROFIT (REALIZED)</p>
            <h3 className={`text-3xl font-black ${stats.totalRealized >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                {stats.totalRealized > 0 ? '+' : ''}{stats.totalRealized.toLocaleString()}
            </h3>
            <p className={`text-[10px] mt-1 ${stats.totalFloating >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                (Floating: {stats.totalFloating.toFixed(2)})
            </p>
        </div>
        <div className="bg-green-900/20 border border-green-500/50 p-4">
             <p className="text-green-400 text-[10px] font-bold uppercase flex items-center gap-2"><Sword size={12}/> COMMANDER CUT</p>
             <h3 className="text-3xl font-black text-white mt-1">${stats.potentialCommission.toFixed(2)}</h3>
        </div>
      </div>

      {/* LIVE FEED TABLE */}
      <div className="border border-green-900 bg-black/90 relative z-10">
        <div className="p-4 border-b border-green-900 flex justify-between items-center bg-green-950/30">
            <h3 className="font-bold text-green-500 flex items-center gap-2 text-sm tracking-widest">
                <Radio size={16} className="animate-pulse"/> LIVE FEED
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-green-700 font-bold border border-green-800 px-2 py-1 rounded">
                <Signal size={12}/> PRIORITY: ONLINE &gt; OFFLINE &gt; A-Z
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
                <thead className="bg-green-900/20 text-green-600 uppercase font-black">
                    <tr><th className="p-3">SIGNAL</th><th className="p-3">OPERATOR</th><th className="p-3 text-right">AMMO (BAL)</th><th className="p-3 text-right">NET PROFIT</th><th className="p-3 text-right text-white">LOOT (20%)</th><th className="p-3 text-center">LAST COMMS</th><th className="p-3 text-right">ACTION</th></tr>
                </thead>
                <tbody className="divide-y divide-green-900/30">
                    {stats.processedBots.map((bot: any) => (
                        <tr key={bot.id} onClick={() => openBotDetail(bot)} className={`hover:bg-green-900/20 cursor-crosshair transition-all group ${!bot.isOnline ? 'opacity-50 grayscale' : ''}`}>
                            <td className="p-3 font-bold">
                                {bot.isOnline ? (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-green-400 flex items-center gap-2">
                                            <Target size={14} className="animate-spin-slow"/> ONLINE
                                        </span>
                                        {bot.brainActive === false && (
                                            <span className="text-[9px] text-red-500 animate-pulse flex items-center gap-1 font-black">
                                                <ShieldAlert size={10}/> PYTHON LOST
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-red-600 flex items-center gap-2"><WifiOff size={14}/> LOST</span>
                                )}
                            </td>
                            <td className="p-3">
                                <div className="font-black text-white text-sm uppercase">{bot.botName || "SPARTAN UNIT"}</div>
                                <div className="text-[10px] text-slate-400">ID: {bot.mt5Account} | {bot.symbol || "UNK"}</div>
                            </td>
                            <td className="p-3 text-right text-green-300 font-mono">${(bot.balance || 0).toLocaleString()}</td>
                            <td className="p-3 text-right font-mono">
                                {/* 🔥 SỬA: Hiển thị realizedProfit */}
                                <div className={`font-black ${(bot.realizedProfit ?? 0) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                    {(bot.realizedProfit ?? bot.profit ?? 0).toFixed(2)}
                                </div>
                                <div className={`text-[9px] ${bot.floatingProfit >= 0 ? 'text-green-600' : 'text-red-700'}`}>Float: {(bot.floatingProfit || 0).toFixed(2)}</div>
                            </td>
                            <td className="p-3 text-right font-black font-mono text-white bg-green-900/20">+${(bot.commission || 0).toFixed(2)}</td>
                            <td className="p-3 text-center text-[10px] text-green-700">{bot.lastHeartbeat ? new Date(bot.lastHeartbeat).toLocaleTimeString('vi-VN') : 'NEVER'}</td>
                            <td className="p-3 text-right">
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteBot(bot.id); }} className="text-green-900 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* ✅ MODAL HUD */}
      {selectedBot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-black border-2 border-green-500 flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(34,197,94,0.2)]">
            <div className="p-4 border-b-2 border-green-500 bg-green-500/10 flex justify-between items-center">
              <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-2">
                <History size={20} className="animate-pulse"/> COMMAND ARCHIVE: {selectedBot.botName}
              </h2>
              <button onClick={() => setSelectedBot(null)} className="p-2 text-green-500 hover:text-red-500 border border-green-500 hover:bg-red-500/20 transition-all"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="border border-green-900 p-3 bg-green-950/10">
                  <p className="text-[10px] text-green-700 font-bold uppercase">Balance</p>
                  <p className="text-xl font-black text-white">${(selectedBot.balance || 0).toLocaleString()}</p>
                </div>
                <div className="border border-green-900 p-3 bg-green-950/10">
                  <p className="text-[10px] text-green-700 font-bold uppercase">Equity</p>
                  <p className="text-xl font-black text-white">${(selectedBot.equity || 0).toLocaleString()}</p>
                </div>
                <div className="border border-green-900 p-3 bg-green-950/10">
                  <p className="text-[10px] text-green-700 font-bold uppercase">Net Profit</p>
                  {/* 🔥 SỬA: Hiển thị realizedProfit */}
                  <p className={`text-xl font-black ${(selectedBot.realizedProfit ?? 0) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                      ${(selectedBot.realizedProfit ?? selectedBot.profit ?? 0).toFixed(2)}
                  </p>
                  <p className={`text-[9px] mt-1 ${selectedBot.floatingProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Float: {(selectedBot.floatingProfit || 0).toFixed(2)}</p>
                </div>
                <div className="border border-green-500/30 p-3 bg-green-900/20">
                  <p className="text-[10px] text-green-400 font-bold uppercase flex items-center gap-1"><Sword size={10}/> Commander Loot</p>
                  {/* 🔥 SỬA: Tính Loot dựa trên realizedProfit */}
                  <p className="text-xl font-black text-white">
                      ${((selectedBot.realizedProfit ?? selectedBot.profit ?? 0) > 0 ? (selectedBot.realizedProfit ?? selectedBot.profit ?? 0) * 0.2 : 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <h3 className="text-sm font-black text-green-500 mb-4 flex items-center gap-2">📂 KHO LỊCH SỬ TÁC CHIẾN</h3>
              
              {loadingHistory ? (
                <div className="p-20 text-center animate-pulse text-green-800 font-black italic">DANG TRUY LỤC HỒ SƠ...</div>
              ) : (
                <div className="border border-green-900 rounded overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-green-950/50 text-green-600 font-black">
                      <tr><th className="p-3">TICKET</th><th className="p-3">TYPE</th><th className="p-3 text-right">LOTS</th><th className="p-3 text-right text-white">PROFIT (NET)</th><th className="p-3 text-center">TIME</th></tr>
                    </thead>
                    <tbody className="divide-y divide-green-900/30">
                      {tradeHistory.length === 0 ? (
                        <tr><td colSpan={5} className="p-10 text-center text-green-800 italic uppercase">Chưa có dữ liệu lệnh.</td></tr>
                      ) : (
                        tradeHistory.map((trade: any) => (
                          <tr key={trade.id} className="hover:bg-green-900/10">
                            <td className="p-3 text-slate-500">#{trade.ticket}</td>
                            <td className={`p-3 font-bold ${trade.type === 'BUY' ? 'text-blue-400' : 'text-red-400'}`}>{trade.type}</td>
                            <td className="p-3 text-right text-white">{(trade.volume || trade.lots || 0).toFixed(2)}</td>
                            <td className={`p-3 text-right font-black ${trade.profit >= 0 ? 'text-green-400' : 'text-red-500'}`}>${(trade.profit || 0).toFixed(2)}</td>
                            <td className="p-3 text-center text-slate-500">
                              {(() => {
                                const rawDate = trade.time || trade.timestamp;
                                if (!rawDate) return "---";
                                const dateObj = new Date(rawDate);
                                return isNaN(dateObj.getTime()) ? "Format Error" : dateObj.toLocaleString('vi-VN', {
                                  hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit'
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
            
            <div className="p-4 border-t-2 border-green-500 bg-green-500/5 text-center">
                <p className="text-[9px] text-green-800 font-black tracking-[0.4em] uppercase">:: Dữ liệu được trích xuất từ sổ cái trung tâm ::</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}