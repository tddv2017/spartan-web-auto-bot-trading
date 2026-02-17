"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Radar, List, Wallet, TrendingUp, Shield, Activity, 
  AlertTriangle, Zap, Users, Search, Loader2, ChevronDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/app/context/AuthContext"; // 👈 Đảm bảo đường dẫn đúng tới file AuthContext của ngài
import SignalFeed from '@/components/dashboard/SignalFeed'; // Component feed lệnh của ngài

// 🖌️ COMPONENT VẼ NỐT TRÒN TRÊN BIỂU ĐỒ
const CustomizedDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.time === 'Start') return null;
    const isBuy = payload.type === 0 || payload.type === '0' || payload.type?.toString().toUpperCase().includes('BUY');
    return (
        <circle cx={cx} cy={cy} r={4} stroke={isBuy ? '#064e3b' : '#7f1d1d'} strokeWidth={2} fill={isBuy ? '#10b981' : '#ef4444'} fillOpacity={1} />
    );
};

export const WarRoomTab = ({ trades: initialTrades, accountInfo: initialAccountInfo }: any) => {
  const { isAdmin, user } = useAuth(); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [memberList, setMemberList] = useState<any[]>([]); 
  const [selectedMT5, setSelectedMT5] = useState("");      
  
  const [displayTrades, setDisplayTrades] = useState(initialTrades || []);
  const [displayAccountInfo, setDisplayAccountInfo] = useState(initialAccountInfo || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/members-with-mt5')
        .then(async (res) => {
            if (res.ok) return res.json();
            throw new Error("API Lỗi");
        })
        .then(data => setMemberList(data))
        .catch(err => console.error("⚠️ Lỗi quân đoàn:", err));
    }
  }, [isAdmin]);

  const handleInspect = async (mt5Account: string) => {
    setSelectedMT5(mt5Account);
    setCurrentPage(1); 

    if (!mt5Account) {
        setDisplayTrades(initialTrades || []);
        setDisplayAccountInfo(initialAccountInfo || {});
        return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/bot/sync?mt5Account=${mt5Account}`);
      if (!res.ok) throw new Error("Mất kết nối");
      const data = await res.json();
      if (data && data.accountInfo) {
        setDisplayAccountInfo(data.accountInfo);
        setDisplayTrades(data.trades || []);
      }
    } catch (e) {
      console.error("❌ Lỗi soi hồ sơ:", e);
    } finally {
      setLoading(false); 
    }
  };

  const formatMoney = (val: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val || 0));
  
  // 🎯 ĐỒNG BỘ: Ưu tiên lấy realizedProfit từ API để hiện số chuẩn
  const netProfit = useMemo(() => {
      return Number(displayAccountInfo?.realizedProfit || displayAccountInfo?.profit || 0);
  }, [displayAccountInfo]);

  const getAccountStatus = () => {
      if(!displayAccountInfo || !displayAccountInfo.balance) return { label: "OFFLINE", color: "text-slate-500", icon: Activity };
      const balance = Number(displayAccountInfo.balance);
      const equity = Number(displayAccountInfo.equity);
      if(balance === 0) return { label: "EMPTY", color: "text-slate-500", icon: Wallet };
      
      const dd = ((balance - equity) / balance) * 100;
      if (equity > balance) return { label: "PROFITABLE", color: "text-green-400", icon: Zap };
      if (dd > 50) return { label: "CRITICAL", color: "text-red-500 animate-pulse", icon: AlertTriangle };
      if (dd > 20) return { label: "WARNING", color: "text-yellow-500", icon: AlertTriangle };
      return { label: "HEALTHY", color: "text-blue-400", icon: Shield };
  };

  const status = getAccountStatus();

  const chartData = useMemo(() => {
    if (!displayAccountInfo?.balance || !displayTrades) return [];
    let currentBal = Number(displayAccountInfo.balance);
    const history = [...displayTrades].map((trade: any) => {
        const profit = Number(trade.profit);
        const point = {
            time: trade.time ? new Date(trade.time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : 'N/A',
            balance: Number(currentBal.toFixed(2)),
            profit: profit,
            type: trade.type,
            symbol: trade.symbol
        };
        currentBal = currentBal - profit; 
        return point;
    });
    history.push({ time: 'Start', balance: Number(currentBal.toFixed(2)), profit: 0, type: null, symbol: '' });
    return history.reverse();
  }, [displayTrades, displayAccountInfo]);

  const getTradeStyle = (type: any) => {
      const t = type?.toString().toUpperCase();
      if (t === '0' || t?.includes('BUY')) return { color: "text-green-500", bg: "bg-green-500/10", label: "BUY" };
      return { color: "text-red-500", bg: "bg-red-500/10", label: "SELL" };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {isAdmin && (
            <div className="bg-slate-900/60 border border-blue-500/30 p-4 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg shadow-blue-500/5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-3 rounded-2xl text-blue-400">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="text-white font-black text-lg tracking-tighter uppercase leading-none">Sở Chỉ Huy Quân Đoàn</h2>
                        <p className="text-[10px] text-slate-500 font-mono mt-1 italic">Tài khoản Admin: {user?.email}</p>
                    </div>
                </div>

                <div className="relative w-full md:w-80 group">
                    <div className="absolute left-4 top-3.5 text-slate-500 pointer-events-none">
                        {loading ? <Loader2 size={18} className="animate-spin text-blue-500" /> : <Search size={18} />}
                    </div>
                    <select 
                        value={selectedMT5}
                        onChange={(e) => handleInspect(e.target.value)}
                        className="w-full bg-black/60 border border-slate-700 text-slate-300 text-sm rounded-2xl pl-12 pr-10 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer font-bold hover:bg-slate-800"
                    >
                        <option value="">🎯 XEM TÀI KHOẢN CỦA TÔI</option>
                        {memberList.map((m: any) => (
                            <option key={m.mt5Account} value={m.mt5Account}>
                                🎖️ {m.email?.split('@')[0]} ({m.mt5Account})
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 text-slate-500 pointer-events-none" size={18} />
                </div>
            </div>
        )}

        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500 ${loading ? 'opacity-50 blur-[2px]' : ''}`}>
            <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-3xl relative overflow-hidden group">
                <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-30 transition-opacity"><Wallet size={40} /></div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Balance</p>
                <p className="text-2xl font-black text-white font-mono mt-1">{formatMoney(displayAccountInfo?.balance)}</p>
            </div>

            <div className="bg-green-900/10 border border-green-500/20 p-5 rounded-3xl relative overflow-hidden group">
                <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-30 transition-opacity text-green-500"><TrendingUp size={40} /></div>
                <p className="text-[10px] text-green-500 uppercase tracking-widest font-black">Equity</p>
                <p className="text-2xl font-black text-green-400 font-mono mt-1">{formatMoney(displayAccountInfo?.equity)}</p>
                <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${Number(displayAccountInfo?.equity) > Number(displayAccountInfo?.balance) ? 'bg-green-500' : 'bg-yellow-500'}`} 
                        style={{ width: `${Math.min((Number(displayAccountInfo?.equity) / Number(displayAccountInfo?.balance || 1)) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-3xl">
                <p className="text-[10px] text-yellow-500 uppercase tracking-widest font-black">Net Realized Profit</p>
                <p className={`text-2xl font-black font-mono mt-1 ${netProfit >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {netProfit > 0 ? '+' : ''}{formatMoney(netProfit)}
                </p>
                <p className="text-[9px] text-slate-500 italic mt-1 font-mono">Synced from HQ</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-3xl">
                <p className={`text-[10px] uppercase tracking-widest font-black ${status.color}`}>Status</p>
                <div className="flex items-center gap-2 mt-2">
                    <status.icon size={18} className={status.color}/>
                    <span className={`font-bold ${status.color}`}>{status.label}</span>
                </div>
            </div>
        </div>

        <div className={`col-span-1 xl:col-span-3 bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem] h-[400px] relative group transition-all duration-500 ${loading ? 'opacity-50 blur-[2px]' : ''}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-sm tracking-wider">
                    <Activity size={16} className="text-green-500"/> Account Growth
                </h3>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400"><span className="w-2 h-2 rounded-full bg-green-500"></span> BUY</div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400"><span className="w-2 h-2 rounded-full bg-red-500"></span> SELL</div>
                    <span className="text-[10px] text-green-500 bg-green-900/20 px-2 py-1 rounded border border-green-900/50 animate-pulse ml-2">● LIVE</span>
                </div>
            </div>
            
            <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis stroke="#475569" fontSize={10} tickFormatter={(val) => `$${val}`} domain={['auto', 'auto']} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            formatter={(value: any, name: any) => name === 'balance' ? [`$${Number(value).toFixed(2)}`, 'Balance'] : [value, name]}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" dot={<CustomizedDot />} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 transition-all duration-500 ${loading ? 'opacity-50 blur-[2px]' : ''}`}>
            <div className="xl:col-span-2 space-y-4">
                <SignalFeed />
            </div>

            <div className="xl:col-span-1">
                <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-4 h-full min-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
                        <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-sm tracking-wider">
                            <List size={16} className="text-blue-500"/> Trades Log
                        </h3>
                        <span className="text-[10px] text-slate-500 bg-black/30 px-2 py-1 rounded border border-slate-800">{currentPage}</span>
                    </div>

                    {displayTrades.length > 0 ? (
                        <>
                            <div className="overflow-x-auto flex-grow custom-scrollbar">
                                <div className="space-y-2">
                                    {displayTrades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((trade: any, idx: number) => {
                                        const style = getTradeStyle(trade.type);
                                        const profit = Number(trade.profit);
                                        return (
                                            <div key={idx} className="bg-black/20 border border-slate-800/50 p-3 rounded-xl hover:bg-slate-800/50 transition-colors flex justify-between items-center group">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 ${style.bg} ${style.color}`}>{style.label}</span>
                                                        <span className="text-white font-bold text-xs">{trade.symbol}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-mono opacity-50">#{trade.ticket}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-mono font-bold text-sm ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{profit > 0 ? '+' : ''}{profit.toFixed(2)} $</p>
                                                    <p className="text-[10px] text-slate-600">{trade.time ? new Date(trade.time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : '--:--'}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {displayTrades.length > itemsPerPage && (
                                <div className="flex justify-center items-center gap-2 mt-4 pt-2 border-t border-slate-800/50">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-[10px] font-bold text-white">Prev</button>
                                    <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(displayTrades.length / itemsPerPage), p + 1))} disabled={currentPage === Math.ceil(displayTrades.length / itemsPerPage)} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-[10px] font-bold text-white">Next</button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-slate-500 italic flex-col gap-2">
                            <List size={40} className="opacity-20"/><p className="text-xs">Chưa có lệnh nào</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};