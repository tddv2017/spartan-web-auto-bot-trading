"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  Activity, Users, DollarSign, TrendingUp, AlertTriangle, 
  Server, ShieldAlert, Wifi, WifiOff, Search, Crosshair, 
  Target, Radio, ShieldCheck, Zap, Sword
} from 'lucide-react';

// --- TYPE DEFINITION ---
interface BotData {
  id: string;
  mt5Account: number;
  licenseKey: string;
  balance: number;
  equity: number;
  floatingProfit: number;
  lastHeartbeat: string;
  symbol: string;
  userEmail?: string; // Nếu có lưu email
}

export default function BattlefieldDashboard() {
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // 🎧 LẮNG NGHE REAL-TIME
  useEffect(() => {
    const q = query(collection(db, "bots"), orderBy("lastHeartbeat", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const botList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BotData[];
      setBots(botList);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🧮 TÍNH TOÁN CHIẾN TRƯỜNG
  const stats = useMemo(() => {
    const now = Date.now();
    let totalBalance = 0;
    let totalEquity = 0;
    let totalFloating = 0;
    let onlineCount = 0;
    let offlineCount = 0;
    let potentialCommission = 0; // 30% chiến lợi phẩm

    const processedBots = bots.map(bot => {
      // 120s không báo cáo = Tử trận (Offline)
      const lastSeen = bot.lastHeartbeat ? new Date(bot.lastHeartbeat).getTime() : 0;
      const isOnline = (now - lastSeen) < 120000; 

      if (isOnline) onlineCount++; else offlineCount++;

      totalBalance += bot.balance || 0;
      totalEquity += bot.equity || 0;
      totalFloating += bot.floatingProfit || 0;

      // Tính 30% phí chỉ huy trên các lệnh xanh
      const comm = (bot.floatingProfit > 0) ? bot.floatingProfit * 0.3 : 0;
      potentialCommission += comm;

      return { ...bot, isOnline, commission: comm };
    });

    return {
      totalBots: bots.length,
      onlineCount,
      offlineCount,
      totalBalance,
      totalEquity,
      totalFloating,
      potentialCommission,
      processedBots
    };
  }, [bots]);

  // Lọc quân
  const displayBots = stats.processedBots.filter(bot => {
    if (filter === 'ONLINE') return bot.isOnline;
    if (filter === 'OFFLINE') return !bot.isOnline;
    return true;
  });

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-green-500 font-mono tracking-widest">
        <div className="animate-spin mb-4"><Radio size={48} /></div>
        <span className="animate-pulse">INITIALIZING BATTLEFIELD RADAR...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-6 relative overflow-hidden selection:bg-green-500 selection:text-black">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20" 
           style={{backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
      </div>

      {/* HEADER HUD */}
      <div className="relative z-10 border-b-2 border-green-900/50 pb-6 mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <div className="flex items-center gap-3 mb-1">
                <Target className="animate-pulse text-red-500" size={28} />
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                    SPARTAN <span className="text-green-600">WAR ROOM</span>
                </h1>
            </div>
            <p className="text-green-800 text-xs font-bold tracking-[0.3em] uppercase">System Status: DEFCON 1 - READY TO ENGAGE</p>
        </div>
        
        {/* Radar Scan Animation */}
        <div className="flex items-center gap-4 bg-green-950/20 border border-green-800/50 px-4 py-2 rounded-none clip-path-polygon">
            <div className="text-right">
                <p className="text-[10px] text-green-600 uppercase font-bold">TOTAL EQUITY</p>
                <p className="text-2xl font-black text-white glow-text">${stats.totalEquity.toLocaleString()}</p>
            </div>
            <Activity className="text-green-500 animate-bounce" />
        </div>
      </div>

      {/* 1. INTEL CARDS (THÔNG SỐ CHIẾN TRƯỜNG) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 relative z-10">
        
        {/* Card 1: ACTIVE UNITS */}
        <div className="bg-black/80 border border-green-800 p-4 hover:border-green-500 transition-all group">
            <div className="flex justify-between items-start mb-2">
                <p className="text-green-700 text-[10px] font-bold uppercase tracking-widest">ACTIVE UNITS</p>
                <ShieldCheck size={16} className="text-green-600 group-hover:text-green-400"/>
            </div>
            <h3 className="text-4xl font-black text-white mb-2">{stats.totalBots}</h3>
            <div className="flex gap-2 text-[10px] font-bold uppercase">
                <span className="text-green-400 flex items-center gap-1"><span className="w-1 h-1 bg-green-400 rounded-full animate-ping"></span> {stats.onlineCount} ONLINE</span>
                <span className="text-red-500 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span> {stats.offlineCount} MIA</span>
            </div>
        </div>

        {/* Card 2: WAR CHEST (VỐN) */}
        <div className="bg-black/80 border border-green-800 p-4 hover:border-yellow-500 transition-all group">
             <div className="flex justify-between items-start mb-2">
                <p className="text-yellow-700 text-[10px] font-bold uppercase tracking-widest">WAR CHEST</p>
                <Server size={16} className="text-yellow-700 group-hover:text-yellow-500"/>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight">${stats.totalBalance.toLocaleString()}</h3>
        </div>

        {/* Card 3: BATTLEFRONT (LÃI CHẠY) */}
        <div className={`bg-black/80 border p-4 transition-all group ${stats.totalFloating >= 0 ? 'border-green-800 hover:border-green-400' : 'border-red-900 hover:border-red-500'}`}>
             <div className="flex justify-between items-start mb-2">
                <p className={`${stats.totalFloating >= 0 ? 'text-green-700' : 'text-red-700'} text-[10px] font-bold uppercase tracking-widest`}>CURRENT BATTLE</p>
                <Crosshair size={16} className={stats.totalFloating >= 0 ? 'text-green-600' : 'text-red-600'}/>
            </div>
            <h3 className={`text-3xl font-black tracking-tight ${stats.totalFloating >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                {stats.totalFloating > 0 ? '+' : ''}{stats.totalFloating.toFixed(2)}
            </h3>
        </div>

        {/* Card 4: THE TRIBUTE (HOA HỒNG 30%) */}
        <div className="bg-green-900/20 border border-green-500/50 p-4 relative overflow-hidden group">
             <div className="absolute inset-0 bg-green-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
             <div className="flex justify-between items-start mb-2 relative z-10">
                <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Sword size={12}/> COMMANDER CUT (30%)
                </p>
            </div>
            <h3 className="text-4xl font-black text-white relative z-10">
                ${stats.potentialCommission.toFixed(2)}
            </h3>
        </div>
      </div>

      {/* 2. LIVE FEED (DANH SÁCH LÍNH) */}
      <div className="border border-green-900 bg-black/90 relative z-10">
        {/* Toolbar */}
        <div className="p-4 border-b border-green-900 flex flex-col md:flex-row justify-between items-center gap-4 bg-green-950/30">
            <h3 className="font-bold text-green-500 flex items-center gap-2 uppercase tracking-widest text-sm">
                <Radio size={16} className="animate-pulse"/> LIVE SQUADRON FEED
            </h3>
            <div className="flex gap-1">
                {['ALL', 'ONLINE', 'OFFLINE'].map((f) => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1 text-[10px] font-bold uppercase border transition-all ${filter === f ? 'bg-green-600 border-green-600 text-black' : 'bg-transparent border-green-900 text-green-700 hover:border-green-500 hover:text-green-500'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        {/* Tactical Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
                <thead className="bg-green-900/20 text-green-600 uppercase font-black">
                    <tr>
                        <th className="p-3">SIGNAL</th>
                        <th className="p-3">OPERATOR (MT5)</th>
                        <th className="p-3 text-right">AMMO (BAL)</th>
                        <th className="p-3 text-right">COMBAT (P/L)</th>
                        <th className="p-3 text-right text-white bg-green-900/40">LOOT (20%)</th>
                        <th className="p-3 text-center">LAST COMMS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-green-900/30">
                    {displayBots.map((bot) => (
                        <tr key={bot.id} className="hover:bg-green-900/10 transition-colors group">
                            <td className="p-3 font-bold">
                                {bot.isOnline ? (
                                    <span className="flex items-center gap-2 text-green-400">
                                        <Target size={14} className="animate-spin-slow"/> ONLINE
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-red-600 opacity-50">
                                        <WifiOff size={14}/> LOST SIGNAL
                                    </span>
                                )}
                            </td>
                            <td className="p-3">
                                <div className="font-bold text-white text-sm tracking-wider">{bot.mt5Account}</div>
                                <div className="text-[10px] text-green-800">{bot.symbol || 'UNKNOWN'}</div>
                            </td>
                            <td className="p-3 text-right text-green-300 font-mono">
                                ${bot.balance.toLocaleString()}
                            </td>
                            <td className={`p-3 text-right font-black font-mono text-sm ${bot.floatingProfit >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                {bot.floatingProfit > 0 ? '+' : ''}{bot.floatingProfit.toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-black font-mono text-white bg-green-900/20 border-l border-green-900/30">
                                +${bot.commission.toFixed(2)}
                            </td>
                            <td className="p-3 text-center text-[10px] text-green-700 font-mono">
                                {bot.lastHeartbeat ? new Date(bot.lastHeartbeat).toLocaleTimeString('vi-VN') : 'NEVER'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {displayBots.length === 0 && (
                <div className="p-12 text-center text-green-800 italic uppercase tracking-widest border-t border-green-900">
                    NO UNITS FOUND IN SECTOR.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}