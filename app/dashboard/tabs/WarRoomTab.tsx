"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Radar, List, Wallet, TrendingUp, Shield, Activity, 
  AlertTriangle, Zap, Users, Search, Loader2, ChevronDown, CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/app/context/AuthContext"; 
import SignalFeed from '@/app/dashboard/SignalFeed'; 
import TradesLog from '@/app/dashboard/components/TradesLog'; 

import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';

const CustomizedDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.time === 'Start') return null;
    const isBuy = payload.type === 0 || payload.type === '0' || payload.type?.toString().toUpperCase().includes('BUY');
    return (
        <circle cx={cx} cy={cy} r={3} stroke={isBuy ? '#059669' : '#dc2626'} strokeWidth={2} fill={isBuy ? '#10b981' : '#ef4444'} />
    );
};

export const WarRoomTab = ({ trades: initialTrades, accountInfo: initialAccountInfo }: any) => {
  const { isAdmin, user } = useAuth(); 

  const [memberList, setMemberList] = useState<any[]>([]); 
  const [selectedMT5, setSelectedMT5] = useState("");      
  const [displayTrades, setDisplayTrades] = useState(initialTrades || []);
  const [displayAccountInfo, setDisplayAccountInfo] = useState(initialAccountInfo || {});
  const [loading, setLoading] = useState(false);
  const [clientMT5, setClientMT5] = useState("");
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    if (!user?.uid) { setIsCheckingProfile(false); return; }
    const userDocRef = doc(db, "users", user.uid);
    const unsubUserProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) { setClientMT5(docSnap.data().mt5Account || ""); }
      setIsCheckingProfile(false);
    });
    return () => unsubUserProfile();
  }, [user]);

  const targetMT5 = (isAdmin && selectedMT5) ? selectedMT5 : clientMT5;

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/members-with-mt5')
        .then(async (res) => { if (res.ok) return res.json(); throw new Error("API Lỗi"); })
        .then(data => setMemberList(data)).catch(console.error);
    }
  }, [isAdmin]);

  useEffect(() => {
    let unsubAccount = () => {}; let unsubTrades = () => {};
    if (!targetMT5) { setDisplayAccountInfo({}); setDisplayTrades([]); return; }
    try {
      const accountQ = query(collection(db, "bots"), where("mt5Account", "==", Number(targetMT5)), limit(1));
      unsubAccount = onSnapshot(accountQ, (snap) => {
        if (!snap.empty) setDisplayAccountInfo(snap.docs[0].data());
        setLoading(false); 
      });

      const tradesRef = collection(db, "bots", String(targetMT5), "trades");
      const tradesQ = query(tradesRef, orderBy("time", "desc"), limit(50));
      unsubTrades = onSnapshot(tradesQ, (snap) => {
        setDisplayTrades(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false); 
      });
    } catch (error) { setLoading(false); }
    return () => { unsubAccount(); unsubTrades(); };
  }, [targetMT5]);

  const handleInspect = (mt5Account: string) => {
    if (mt5Account !== selectedMT5) { setLoading(true); setSelectedMT5(mt5Account); }
  };

  const formatMoney = (val: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val || 0));
  const safeBalance = Number(displayAccountInfo?.balance || 0);
  const safeEquity = Number(displayAccountInfo?.equity || safeBalance); 
  const netProfit = useMemo(() => displayTrades.reduce((total: number, trade: any) => total + Number(trade.profit || 0), 0), [displayTrades]);

  const getAccountStatus = () => {
      if (loading && (!safeBalance || safeBalance === 0)) return { label: "SYNCING...", color: "text-blue-500", icon: Loader2, anim: "animate-spin" };
      if(!safeBalance || safeBalance === 0) return { label: "OFFLINE", color: "text-slate-500", icon: Wallet, anim: "" };
      
      const dd = ((safeBalance - safeEquity) / safeBalance) * 100;
      if (safeEquity > safeBalance) return { label: "PROFITABLE", color: "text-emerald-400", icon: CheckCircle2, anim: "" };
      if (dd > 50) return { label: "CRITICAL", color: "text-red-500", icon: AlertTriangle, anim: "animate-pulse" };
      if (dd > 20) return { label: "WARNING", color: "text-amber-500", icon: AlertTriangle, anim: "" };
      return { label: "HEALTHY", color: "text-blue-400", icon: Shield, anim: "" };
  };

  const status = getAccountStatus();

  const chartData = useMemo(() => {
    if (!safeBalance || !displayTrades) return [];
    let currentBal = safeBalance;
    const history = [...displayTrades].map((trade: any) => {
        const profit = Number(trade.profit || 0);
        const point = { time: trade.time ? new Date(trade.time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : 'N/A', balance: Number(currentBal.toFixed(2)), profit: profit, type: trade.type, symbol: trade.symbol };
        currentBal -= profit; return point;
    });
    history.push({ time: 'Start', balance: Number(currentBal.toFixed(2)), profit: 0, type: null, symbol: '' });
    return history.reverse();
  }, [displayTrades, safeBalance]);
  
  if (isCheckingProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-[#111827] border border-slate-800 rounded-2xl">
          <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang kết nối trạm Radar...</p>
      </div>
    );
  }

  if (!isAdmin && !clientMT5) {
      return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-[#111827] border border-slate-800 rounded-2xl">
          <Shield size={48} className="mb-4 text-slate-600" />
          <h2 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Tín hiệu bị ngắt</h2>
          <p className="text-sm text-slate-500 text-center max-w-sm">Tài khoản chưa liên kết MT5. Vui lòng hoàn tất xác minh tại mục Headquarters.</p>
      </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        
        {isAdmin && (
            <div className="bg-[#111827] border border-blue-500/20 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
                        <Radar size={20} className="text-blue-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-sm tracking-wide uppercase">ADMIN SATELLITE</h2>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Override Target Selection</p>
                    </div>
                </div>

                <div className="relative w-full md:w-80">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                        {loading ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Search size={16} />}
                    </div>
                    <select 
                        value={selectedMT5}
                        onChange={(e) => handleInspect(e.target.value)}
                        className="w-full bg-[#0B1120] border border-slate-700 text-slate-200 text-sm rounded-xl pl-11 pr-10 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer font-medium"
                    >
                        <option value="">-- Radar cá nhân của tôi --</option>
                        {memberList.map((m: any) => (
                            <option key={m.mt5Account} value={m.mt5Account}>
                                🎯 {m.email?.split('@')[0]} (MT5: {m.mt5Account})
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                </div>
            </div>
        )}

        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : ''}`}>
            <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Balance</p>
                <p className="text-2xl font-bold text-white font-mono">{formatMoney(safeBalance)}</p>
            </div>

            <div className="bg-emerald-900/10 border border-emerald-500/20 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-bold mb-1">Equity</p>
                <p className="text-2xl font-bold text-emerald-400 font-mono">{formatMoney(safeEquity)}</p>
                <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${safeEquity > safeBalance ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min((safeEquity / (safeBalance || 1)) * 100, 100)}%` }}></div>
                </div>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Net Realized Profit</p>
                <p className={`text-2xl font-bold font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {netProfit > 0 ? '+' : ''}{formatMoney(netProfit)}
                </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className={`text-[10px] uppercase tracking-wider font-bold mb-2 ${status.color}`}>System Status</p>
                <div className="flex items-center gap-2">
                    <status.icon size={20} className={`${status.color} ${status.anim}`}/>
                    <span className={`font-bold text-sm tracking-wide ${status.color}`}>{status.label}</span>
                </div>
            </div>
        </div>

        <div className={`bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-sm h-[420px] flex flex-col transition-opacity duration-300 ${loading ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h3 className="font-bold text-white flex items-center gap-2 uppercase text-[11px] tracking-wider">
                    <TrendingUp size={16} className="text-blue-500"/> Account Growth Matrix
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> BUY</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase"><span className="w-2 h-2 rounded-full bg-red-500"></span> SELL</div>
                </div>
            </div>
            
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis stroke="#475569" fontSize={10} tickFormatter={(val) => `$${val}`} domain={['auto', 'auto']} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1e293b', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                            formatter={(value: any, name: any) => name === 'balance' ? [`$${Number(value).toFixed(2)}`, 'Balance'] : [value, name]}
                        />
                        <Area type="step" dataKey="balance" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" dot={<CustomizedDot />} isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : ''}`}>
            <div className="xl:col-span-2 space-y-4">
                <SignalFeed />
            </div>

            <div className="xl:col-span-1">
                <TradesLog trades={displayTrades} />
            </div>
        </div>
    </div>
  );
};