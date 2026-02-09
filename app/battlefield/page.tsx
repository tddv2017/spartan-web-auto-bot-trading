"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { 
  Activity, Users, DollarSign, TrendingUp, AlertTriangle, 
  Server, ShieldAlert, Wifi, WifiOff, Search, Crosshair, 
  Target, Radio, ShieldCheck, Zap, Sword, CheckCircle, XCircle, Clock
} from 'lucide-react';

// --- TYPE DEFINITION ---
interface BotData {
  id: string;
  mt5Account: number;
  botName?: string; // Tên Bot (nếu có)
  balance: number;
  equity: number;
  floatingProfit: number;
  profit?: number; // hoặc dailyProfit, totalProfit tùy code Bot
  lastHeartbeat: string;
  symbol: string;
}

interface PendingUser {
  id: string; // User UID
  email: string;
  displayName: string;
  mt5Account: number;
  submittedAt: string;
}

export default function BattlefieldDashboard() {
  const [bots, setBots] = useState<BotData[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // 🎧 1. LẮNG NGHE BOT REAL-TIME (QUÂN LÍNH)
  useEffect(() => {
    const q = query(collection(db, "bots"), orderBy("lastHeartbeat", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setBots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BotData[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🎧 2. LẮNG NGHE YÊU CẦU KÍCH HOẠT (TÂN BINH)
  useEffect(() => {
    // Lọc ra những user có trạng thái là 'pending'
    const q = query(collection(db, "users"), where("accountStatus", "==", "pending"));
    const unsub = onSnapshot(q, (snapshot) => {
      setPendingUsers(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as PendingUser[]);
    });
    return () => unsub();
  }, []);

  // ⚡ XỬ LÝ DUYỆT / TỪ CHỐI
  const handleApprove = async (uid: string, mt5: number) => {
    if(!confirm(`Xác nhận duyệt MT5: ${mt5}?`)) return;
    try {
        await updateDoc(doc(db, "users", uid), {
            accountStatus: 'active', // Kích hoạt
            plan: 'LIFETIME',        // Tặng gói mặc định
            approvedAt: new Date().toISOString()
        });
        alert("✅ Đã duyệt tân binh!");
    } catch (e) { alert("Lỗi: " + e); }
  };

  const handleReject = async (uid: string) => {
    if(!prompt("Nhập lý do từ chối (để trống cũng được):")) return;
    try {
        await updateDoc(doc(db, "users", uid), {
            accountStatus: 'rejected', // Từ chối
            rejectedAt: new Date().toISOString()
        });
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono">LOADING BATTLEFIELD...</div>;

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

      {/* 🚨🚨🚨 KHU VỰC DUYỆT KHÁCH (CHỈ HIỆN KHI CÓ KHÁCH CHỜ) 🚨🚨🚨 */}
      {pendingUsers.length > 0 && (
        <div className="relative z-10 mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-red-950/30 border border-red-500 rounded-xl p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 opacity-50"><AlertTriangle className="text-red-500" size={100}/></div>
                <h3 className="text-red-500 font-black text-xl mb-4 flex items-center gap-2 uppercase tracking-widest animate-pulse">
                    <Radio size={24}/> PHÁT HIỆN TÍN HIỆU TÂN BINH ({pendingUsers.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                    {pendingUsers.map(user => (
                        <div key={user.id} className="bg-black/80 border border-red-800 p-4 rounded-lg shadow-lg flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white font-bold">{user.displayName || "Unknown Soldier"}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                                <Clock size={16} className="text-yellow-500"/>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-700 mt-2">
                                <p className="text-[10px] text-slate-400 uppercase">ID MT5 YÊU CẦU:</p>
                                <p className="text-xl font-mono font-black text-yellow-400 tracking-wider">{user.mt5Account}</p>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => handleApprove(user.id, user.mt5Account)} className="flex-1 bg-green-600 hover:bg-green-500 text-black font-bold py-2 rounded flex items-center justify-center gap-1 text-xs">
                                    <CheckCircle size={14}/> DUYỆT
                                </button>
                                <button onClick={() => handleReject(user.id)} className="flex-1 bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 font-bold py-2 rounded flex items-center justify-center gap-1 text-xs">
                                    <XCircle size={14}/> TỪ CHỐI
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-600 text-center mt-1">Gửi lúc: {user.submittedAt ? new Date(user.submittedAt).toLocaleTimeString('vi-VN') : 'N/A'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

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
                    <tr><th className="p-3">SIGNAL</th><th className="p-3">OPERATOR</th><th className="p-3 text-right">AMMO (BAL)</th><th className="p-3 text-right">COMBAT (P/L)</th><th className="p-3 text-right text-white">LOOT (20%)</th><th className="p-3 text-center">LAST COMMS</th></tr>
                </thead>
                <tbody className="divide-y divide-green-900/30">
                    {displayBots.map(bot => (
                        <tr key={bot.id} className="hover:bg-green-900/10">
                            <td className="p-3 font-bold">{bot.isOnline ? <span className="flex items-center gap-2 text-green-400"><Target size={14} className="animate-spin-slow"/> ONLINE</span> : <span className="text-red-600 flex items-center gap-2"><WifiOff size={14}/> LOST</span>}</td>
                                <td className="p-3">
                                    {/* Dòng 1: Tên Bot (Nếu không có thì hiện mặc định SPARTAN UNIT) */}
                                    <div className="font-black text-white text-sm uppercase">
                                        {bot.botName || "SPARTAN UNIT"} 
                                    </div>
                                    
                                    {/* Dòng 2: Số MT5 (Cho nhỏ lại) */}
                                    <div className="text-[10px] text-slate-400 font-mono">
                                        ID: {bot.mt5Account}
                                    </div>

                                    {/* Dòng 3: Cặp tiền */}
                                    <div className="text-[10px] text-green-600 font-bold bg-green-900/10 px-1 rounded w-fit mt-1">
                                        {bot.symbol || 'UNK'}
                                    </div>
                                </td>
                            <td className="p-3 text-right text-green-300 font-mono">${bot.balance.toLocaleString()}</td>
                            <td className="p-3 text-right font-mono">
                                {/* Dòng 1: Lợi nhuận đã chốt (Realized) - Dùng ?? 0 để chặn lỗi undefined */}
                                <div className={`font-black ${(bot.profit ?? 0) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                    {(bot.profit ?? 0) > 0 ? '+' : ''}{(bot.profit ?? 0).toFixed(2)} <span className="text-[8px] text-slate-500">REALIZED</span>
                                </div>
                                
                                {/* Dòng 2: Lợi nhuận thả nổi (Floating) */}
                                <div className={`text-[10px] ${bot.floatingProfit >= 0 ? 'text-green-600' : 'text-red-700'}`}>
                                    ({bot.floatingProfit > 0 ? '+' : ''}{bot.floatingProfit.toFixed(2)} Float)
                                </div>
                            </td>
                            <td className="p-3 text-right font-black font-mono text-white bg-green-900/20">+${bot.commission.toFixed(2)}</td>
                            <td className="p-3 text-center text-[10px] text-green-700 font-mono">{bot.lastHeartbeat ? new Date(bot.lastHeartbeat).toLocaleTimeString('vi-VN') : 'NEVER'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}