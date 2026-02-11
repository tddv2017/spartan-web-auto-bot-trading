"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { 
  Activity, Users, DollarSign, TrendingUp, 
  Server, ShieldAlert, Wifi, WifiOff, Search, Crosshair, 
  Target, Radio, ShieldCheck, Zap, Sword, Lock,
  Trash2, X, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

// --- TYPE DEFINITION ---
interface Order {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  comment?: string;
  time?: string;
}

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
  orders?: Order[];
}

export default function BattlefieldDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedBot, setSelectedBot] = useState<BotData | null>(null);

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-green-800 font-mono animate-pulse">:: CHECKING CLEARANCE ::</div>;

  if (!isAdmin) {
      return (
          <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center text-center p-8">
                  <ShieldAlert size={80} className="text-red-600 animate-pulse mb-8" />
                  <h2 className="text-4xl font-black text-white uppercase mb-4">TOP SECRET</h2>
                  <p className="text-red-500 font-bold tracking-[0.5em] text-xs mb-8 uppercase">:: SPARTAN BATTLEFIELD // EYES ONLY ::</p>
                  <div className="px-6 py-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 font-mono text-xs">
                      <Lock size={14} className="inline mr-2" /> SECURITY_PROTOCOL_403_ENFORCED
                  </div>
              </div>
          </div>
      );
  }

  useEffect(() => {
    const q = query(collection(db, "bots"), orderBy("lastHeartbeat", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setBots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BotData[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDeleteBot = async (botId: string) => {
      if(!confirm("⚠️ CẢNH BÁO: Xóa Bot này?")) return;
      try { await deleteDoc(doc(db, "bots", botId)); } catch (e) { alert("Lỗi: " + e); }
  };

  const stats = useMemo(() => {
    const now = Date.now();
    let totalBalance = 0; let totalEquity = 0; let totalFloating = 0;
    let onlineCount = 0; let offlineCount = 0; let potentialCommission = 0; 

    const processedBots = bots.map(bot => {
      const lastSeen = bot.lastHeartbeat ? new Date(bot.lastHeartbeat).getTime() : 0;
      const isOnline = (now - lastSeen) < 120000; 
      if (isOnline) onlineCount++; else offlineCount++;

      // ✅ BỌC THÉP STATS: Tránh lỗi toLocaleString
      totalBalance += (Number(bot.balance) || 0);
      totalEquity += (Number(bot.equity) || 0);
      totalFloating += (Number(bot.floatingProfit) || 0);
      
      const realizedProfit = Number(bot.profit) || 0; 
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
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

      {/* HEADER HUD */}
      <div className="relative z-10 border-b-2 border-green-900/50 pb-6 mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl md:text-5xl font-black text-white italic flex items-center gap-3">
                <Target className="animate-pulse text-red-500" /> SPARTAN <span className="text-green-600">WAR ROOM</span>
            </h1>
            <p className="text-green-800 text-xs font-bold tracking-[0.3em] uppercase mt-2">System Status: ONLINE</p>
        </div>
        <div className="text-right">
            <p className="text-[10px] text-green-600 font-bold">TOTAL EQUITY</p>
            <p className="text-2xl font-black text-white">${(stats.totalEquity || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 relative z-10">
        <div className="bg-black border border-green-800 p-4">
            <p className="text-green-700 text-[10px] font-bold uppercase mb-1">ACTIVE UNITS</p>
            <h3 className="text-4xl font-black text-white">{stats.totalBots}</h3>
        </div>
        <div className="bg-black border border-green-800 p-4">
            <p className="text-yellow-700 text-[10px] font-bold uppercase mb-1">WAR CHEST</p>
            <h3 className="text-3xl font-black text-white">${(stats.totalBalance || 0).toLocaleString()}</h3>
        </div>
        <div className="bg-black border border-green-800 p-4">
            <p className="text-blue-700 text-[10px] font-bold uppercase mb-1">COMBAT P/L</p>
            <h3 className={`text-3xl font-black ${stats.totalFloating >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                {stats.totalFloating > 0 ? '+' : ''}{(stats.totalFloating || 0).toFixed(2)}
            </h3>
        </div>
        <div className="bg-green-900/20 border border-green-500/50 p-4">
             <p className="text-green-400 text-[10px] font-bold uppercase flex items-center gap-2"><Sword size={12}/> COMMANDER CUT</p>
             <h3 className="text-3xl font-black text-white mt-1">${(stats.potentialCommission || 0).toFixed(2)}</h3>
        </div>
      </div>

      {/* LIVE FEED TABLE */}
      <div className="border border-green-900 bg-black/90 relative z-10">
        <div className="p-4 border-b border-green-900 flex justify-between items-center bg-green-950/30">
            <h3 className="font-bold text-green-500 flex items-center gap-2 text-sm tracking-widest"><Radio size={16} className="animate-pulse"/> LIVE FEED (CLICK TO SCAN)</h3>
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
                        <tr 
                          key={bot.id} 
                          onClick={() => setSelectedBot(bot)}
                          className="hover:bg-green-900/20 cursor-crosshair transition-all group"
                        >
                            <td className="p-3 font-bold">{bot.isOnline ? <span className="text-green-400 flex items-center gap-2"><Target size={14} className="animate-spin-slow"/> ONLINE</span> : <span className="text-red-600 flex items-center gap-2"><WifiOff size={14}/> LOST</span>}</td>
                            <td className="p-3">
                                <div className="font-black text-white text-sm uppercase">{bot.botName || "SPARTAN UNIT"}</div>
                                <div className="text-[10px] text-slate-400">ID: {bot.mt5Account} | {bot.symbol}</div>
                            </td>
                            <td className="p-3 text-right text-green-300 font-mono">${(bot.balance || 0).toLocaleString()}</td>
                            <td className="p-3 text-right font-mono">
                                <div className={`font-black ${(bot.profit ?? 0) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                    {(bot.profit ?? 0).toFixed(2)}
                                </div>
                                <div className={`text-[10px] ${bot.floatingProfit >= 0 ? 'text-green-600' : 'text-red-700'}`}>
                                    ({(bot.floatingProfit || 0).toFixed(2)} Float)
                                </div>
                            </td>
                            <td className="p-3 text-right font-black font-mono text-white bg-green-900/20">+${(bot.commission || 0).toFixed(2)}</td>
                            <td className="p-3 text-center text-[10px] text-green-700">{bot.lastHeartbeat ? new Date(bot.lastHeartbeat).toLocaleTimeString('vi-VN') : 'NEVER'}</td>
                            <td className="p-3 text-right">
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteBot(bot.id); }} className="text-green-900 hover:text-red-500 p-1">
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* ✅ 2. MODAL HUD: CHI TIẾT LỆNH CHIẾN BINH (FIXED TOFIXED ERROR) */}
      {selectedBot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-black border-2 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b-2 border-green-500 bg-green-500/10 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500 text-black rounded-full animate-pulse"><Crosshair size={24} /></div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase italic">Scanning Unit: {selectedBot.botName}</h2>
                  <p className="text-[10px] font-bold text-green-400 tracking-widest uppercase">Operator ID: {selectedBot.mt5Account} // System Status: Active Scan</p>
                </div>
              </div>
              <button onClick={() => setSelectedBot(null)} className="p-2 hover:bg-red-500 hover:text-white transition-all text-green-500 border border-green-500"><X size={20} /></button>
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
                  <p className="text-[10px] text-green-700 font-bold uppercase">Floating P/L</p>
                  <p className={`text-xl font-black ${selectedBot.floatingProfit >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                    ${(selectedBot.floatingProfit || 0).toFixed(2)}
                  </p>
                </div>
                <div className="border border-green-900 p-3 bg-green-950/10">
                  <p className="text-[10px] text-green-700 font-bold uppercase">Symbol</p>
                  <p className="text-xl font-black text-blue-400">{selectedBot.symbol || "N/A"}</p>
                </div>
              </div>

              <h3 className="text-sm font-black text-green-500 mb-4 flex items-center gap-2">
                <Activity size={16} /> MISSION LOG ({selectedBot.orders?.length || 0})
              </h3>

              <div className="border border-green-900 rounded overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-green-950/50 text-green-600 font-black uppercase">
                    <tr>
                      <th className="p-3">Ticket</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-right">Volume</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Profit</th>
                      <th className="p-3 text-center">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-900/30">
                    {(!selectedBot.orders || selectedBot.orders.length === 0) ? (
                      <tr><td colSpan={6} className="p-10 text-center text-green-800 italic uppercase font-bold">No Records Found.</td></tr>
                    ) : (
                      selectedBot.orders.map((order) => (
                        <tr key={order.ticket} className="hover:bg-green-900/10 transition-colors">
                          <td className="p-3 text-slate-400">#{order.ticket}</td>
                          <td className="p-3">
                            <span className={`flex items-center gap-1 font-black ${order.type === 'BUY' ? 'text-blue-400' : 'text-red-400'}`}>
                              {order.type === 'BUY' ? <ArrowUpCircle size={12}/> : <ArrowDownCircle size={12}/>}
                              {order.type}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-white">{(order.volume || 0).toFixed(2)}</td>
                          <td className="p-3 text-right text-slate-400">{(order.openPrice || 0).toFixed(5)}</td>
                          <td className={`p-3 text-right font-black ${order.profit >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                            {order.profit > 0 ? '+' : ''}{(order.profit || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-center text-slate-500">{order.time || "N/A"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}