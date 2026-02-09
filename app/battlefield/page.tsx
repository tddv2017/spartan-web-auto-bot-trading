"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { 
  Activity, Users, DollarSign, TrendingUp, 
  Server, ShieldAlert, Wifi, WifiOff, Search, Crosshair, 
  Target, Radio, ShieldCheck, Zap, Sword, Lock,
  Trash2 
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

// --- TYPE DEFINITION ---
interface BotData {
  id: string;
  mt5Account: number;
  botName?: string;
  balance: number;
  equity: number;
  floatingProfit: number;
  profit?: number; 
  lastHeartbeat: string;
  symbol: string;
}

export default function BattlefieldDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // 🔒 1. CHỐT CHẶN AN NINH
  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-green-800 font-mono animate-pulse">:: CHECKING CLEARANCE ::</div>;

  if (!isAdmin) {
      return (
          <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center relative overflow-hidden font-sans">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ef444405_10px,#ef444405_20px)] pointer-events-none"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] pointer-events-none"></div>
              <div className="relative z-10 flex flex-col items-center text-center p-8 animate-in zoom-in duration-500">
                  <div className="bg-red-900/10 p-8 rounded-full border border-red-500/20 mb-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                      <ShieldAlert size={80} className="text-red-600 animate-pulse" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">TOP SECRET</h2>
                  <p className="text-red-500 font-bold tracking-[0.5em] text-xs md:text-sm mb-8 uppercase">:: SPARTAN BATTLEFIELD // EYES ONLY ::</p>
                  <div className="flex items-center gap-3 px-6 py-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 font-mono text-xs shadow-lg">
                      <Lock size={14} /> SECURITY_PROTOCOL_403_ENFORCED
                  </div>
              </div>
          </div>
      );
  }

  // 🎧 1. LẮNG NGHE BOT REAL-TIME (QUÂN LÍNH)
  useEffect(() => {
    const q = query(collection(db, "bots"), orderBy("lastHeartbeat", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setBots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BotData[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔥 XÓA BOT (DỌN DẸP CHIẾN TRƯỜNG)
  const handleDeleteBot = async (botId: string) => {
      if(!confirm("⚠️ CẢNH BÁO: Xóa Bot này khỏi danh sách theo dõi?")) return;
      try {
          await deleteDoc(doc(db, "bots", botId));
      } catch (e) { alert("Lỗi: " + e); }
  };

  // 🧮 TÍNH TOÁN CHIẾN TRƯỜNG
  const stats = useMemo(() => {
    const now = Date.now();
    let totalBalance = 0;
    let totalEquity = 0;
    let totalFloating = 0;
    let onlineCount = 0;
    let offlineCount = 0;
    let potentialCommission = 0; 

    const processedBots = bots.map(bot => {
      const lastSeen = bot.lastHeartbeat ? new Date(bot.lastHeartbeat).getTime() : 0;
      const isOnline = (now - lastSeen) < 120000; 
      if (isOnline) onlineCount++; else offlineCount++;

      totalBalance += bot.balance || 0;
      totalEquity += bot.equity || 0;
      totalFloating += bot.floatingProfit || 0;
      
      const realizedProfit = bot.profit ?? 0; 
      const comm = (realizedProfit > 0) ? realizedProfit * 0.2 : 0;
      potentialCommission += comm;

      return { ...bot, isOnline, commission: comm };
    });

    return { totalBots: bots.length, onlineCount, offlineCount, totalBalance, totalEquity, totalFloating, potentialCommission, processedBots };
  }, [bots]);

  const displayBots = stats.processedBots.filter(bot => {
    if (filter === 'ONLINE') return bot.isOnline;
    if (filter === 'OFFLINE') return !bot.isOnline;
    return true;
  });

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono animate-pulse">LOADING BATTLEFIELD...</div>;

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-6 relative overflow-hidden selection:bg-green-500 selection:text-black">
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

      {/* HEADER HUD */}
      <div className="relative z-10 border-b-2 border-green-900/50 pb-6 mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                <Target className="animate-pulse text-red-500" /> SPARTAN <span className="text-green-600">WAR ROOM</span>
            </h1>
            <p className="text-green-800 text-xs font-bold tracking-[0.3em] uppercase mt-2">System Status: ONLINE</p>
        </div>
        <div className="text-right">
            <p className="text-[10px] text-green-600 uppercase font-bold">TOTAL EQUITY</p>
            <p className="text-2xl font-black text-white glow-text">${stats.totalEquity.toLocaleString()}</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 relative z-10">
        <div className="bg-black/80 border border-green-800 p-4">
            <p className="text-green-700 text-[10px] font-bold uppercase tracking-widest mb-1">ACTIVE UNITS</p>
            <h3 className="text-4xl font-black text-white">{stats.totalBots}</h3>
            <div className="flex gap-2 text-[10px] font-bold mt-2"><span className="text-green-400">{stats.onlineCount} ONLINE</span> <span className="text-red-500">{stats.offlineCount} MIA</span></div>
        </div>
        <div className="bg-black/80 border border-green-800 p-4">
            <p className="text-yellow-700 text-[10px] font-bold uppercase tracking-widest mb-1">WAR CHEST</p>
            <h3 className="text-3xl font-black text-white">${stats.totalBalance.toLocaleString()}</h3>
        </div>
        <div className="bg-black/80 border border-green-800 p-4">
            <p className="text-blue-700 text-[10px] font-bold uppercase tracking-widest mb-1">CURRENT BATTLE</p>
            <h3 className={`text-3xl font-black ${stats.totalFloating >= 0 ? 'text-green-400' : 'text-red-500'}`}>{stats.totalFloating > 0 ? '+' : ''}{stats.totalFloating.toFixed(2)}</h3>
        </div>
        <div className="bg-green-900/20 border border-green-500/50 p-4">
             <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Sword size={12}/> COMMANDER CUT (20%)</p>
             <h3 className="text-3xl font-black text-white mt-1">${stats.potentialCommission.toFixed(2)}</h3>
        </div>
      </div>

      {/* LIVE FEED */}
      <div className="border border-green-900 bg-black/90 relative z-10">
        <div className="p-4 border-b border-green-900 flex justify-between items-center bg-green-950/30">
            <h3 className="font-bold text-green-500 flex items-center gap-2 text-sm tracking-widest"><Radio size={16} className="animate-pulse"/> LIVE SQUADRON FEED</h3>
            <div className="flex gap-1">
                {['ALL', 'ONLINE', 'OFFLINE'].map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-[10px] font-bold border ${filter === f ? 'bg-green-600 border-green-600 text-black' : 'border-green-900 text-green-700'}`}>{f}</button>)}
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
                <thead className="bg-green-900/20 text-green-600 uppercase font-black">
                    <tr><th className="p-3">SIGNAL</th><th className="p-3">OPERATOR</th><th className="p-3 text-right">AMMO (BAL)</th><th className="p-3 text-right">COMBAT (P/L)</th><th className="p-3 text-right text-white">LOOT (20%)</th><th className="p-3 text-center">LAST COMMS</th><th className="p-3 text-right">ACTION</th></tr>
                </thead>
                <tbody className="divide-y divide-green-900/30">
                    {displayBots.map(bot => (
                        <tr key={bot.id} className="hover:bg-green-900/10 group">
                            <td className="p-3 font-bold">{bot.isOnline ? <span className="flex items-center gap-2 text-green-400"><Target size={14} className="animate-spin-slow"/> ONLINE</span> : <span className="text-red-600 flex items-center gap-2"><WifiOff size={14}/> LOST</span>}</td>
                                <td className="p-3">
                                    <div className="font-black text-white text-sm uppercase">
                                        {bot.botName || "SPARTAN UNIT"} 
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                        ID: {bot.mt5Account}
                                    </div>
                                    <div className="text-[10px] text-green-600 font-bold bg-green-900/10 px-1 rounded w-fit mt-1">
                                        {bot.symbol || 'UNK'}
                                    </div>
                                </td>
                            <td className="p-3 text-right text-green-300 font-mono">${bot.balance.toLocaleString()}</td>
                            <td className="p-3 text-right font-mono">
                                <div className={`font-black ${(bot.profit ?? 0) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                    {(bot.profit ?? 0) > 0 ? '+' : ''}{(bot.profit ?? 0).toFixed(2)} <span className="text-[8px] text-slate-500">REALIZED</span>
                                </div>
                                <div className={`text-[10px] ${bot.floatingProfit >= 0 ? 'text-green-600' : 'text-red-700'}`}>
                                    ({bot.floatingProfit > 0 ? '+' : ''}{bot.floatingProfit.toFixed(2)} Float)
                                </div>
                            </td>
                            <td className="p-3 text-right font-black font-mono text-white bg-green-900/20">+${bot.commission.toFixed(2)}</td>
                            <td className="p-3 text-center text-[10px] text-green-700 font-mono">{bot.lastHeartbeat ? new Date(bot.lastHeartbeat).toLocaleTimeString('vi-VN') : 'NEVER'}</td>
                            
                            {/* 🗑️ NÚT XÓA BOT */}
                            <td className="p-3 text-right">
                                <button onClick={() => handleDeleteBot(bot.id)} className="text-green-800 hover:text-red-500 transition-colors p-1" title="Xóa Bot khỏi danh sách">
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}