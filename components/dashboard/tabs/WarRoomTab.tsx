"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Radar, List, Wallet, TrendingUp, Shield, Activity, 
  AlertTriangle, Zap, Users, Search, Loader2, ChevronDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/app/context/AuthContext"; 
import SignalFeed from '@/components/dashboard/SignalFeed'; 
import TradesLog from '@/components/dashboard/components/TradesLog'; 

// 🛠️ BỘ CÔNG CỤ CÁP QUANG FIREBASE
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';

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

  // =====================================================================
  // 🛡️ NHIỆM VỤ 1: QUẢN LÝ TRẠNG THÁI CHIẾN TRƯỜNG (STATE)
  // =====================================================================
  const [memberList, setMemberList] = useState<any[]>([]); 
  const [selectedMT5, setSelectedMT5] = useState("");      
  const [displayTrades, setDisplayTrades] = useState(initialTrades || []);
  const [displayAccountInfo, setDisplayAccountInfo] = useState(initialAccountInfo || {});
  const [loading, setLoading] = useState(false);
  const [clientMT5, setClientMT5] = useState("");
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  // =====================================================================
  // 🕵️ NHIỆM VỤ 1.5: TRUY TÌM THẺ VŨ KHÍ TỪ HỒ SƠ GỐC (FIRESTORE)
  // Moi mt5Account từ bảng users/{uid}
  // =====================================================================
  useEffect(() => {
    if (!user?.uid) {
      setIsCheckingProfile(false);
      return;
    }
    const userDocRef = doc(db, "users", user.uid);
    const unsubUserProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setClientMT5(userData.mt5Account || "");
      }
      setIsCheckingProfile(false);
    }, (error) => {
      console.error("⚠️ Lỗi truy xuất hồ sơ lính:", error);
      setIsCheckingProfile(false);
    });
    return () => unsubUserProfile();
  }, [user]);

  // 🎯 HỆ THỐNG KHÓA MỤC TIÊU TỰ ĐỘNG
  const targetMT5 = (isAdmin && selectedMT5) ? selectedMT5 : clientMT5;

  // =====================================================================
  // 🛡️ NHIỆM VỤ 2: TÌNH BÁO ADMIN (LẤY DANH SÁCH QUÂN ĐOÀN)
  // =====================================================================
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

  // =====================================================================
  // 🛡️ NHIỆM VỤ 3: TRẠM CÁP QUANG FIREBASE (BẢN CHỐNG GIẬT & SAI KIỂU)
  // =====================================================================
  useEffect(() => {
    let unsubAccount = () => {};
    let unsubTrades = () => {};

    if (!targetMT5) {
      setDisplayAccountInfo({});
      setDisplayTrades([]);
      return; 
    }

    try {
      // 1. KÊNH ACCOUNT (Xử lý ép kiểu Number để query bots)
      const accountQ = query(collection(db, "bots"), where("mt5Account", "==", Number(targetMT5)), limit(1));
      unsubAccount = onSnapshot(accountQ, (snap) => {
        if (!snap.empty) {
          setDisplayAccountInfo(snap.docs[0].data());
        }
        setLoading(false); 
      });

      // 2. KÊNH TRADES (Xử lý ép kiểu String để vào path subcollection)
      const tradesRef = collection(db, "bots", String(targetMT5), "trades");
      const tradesQ = query(tradesRef, orderBy("time", "desc"), limit(50));
      
      unsubTrades = onSnapshot(tradesQ, (snap) => {
        const liveTrades = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDisplayTrades(liveTrades);
        setLoading(false); 
      });

    } catch (error) {
      console.error("⚠️ Lỗi trạm cáp quang:", error);
      setLoading(false);
    }

    return () => {
      unsubAccount();
      unsubTrades();
    };
  }, [targetMT5]);

  // =====================================================================
  // 🛡️ NHIỆM VỤ 4: ĐIỀU HƯỚNG MỤC TIÊU (CHỈ LOADING KHI ĐỔI MỤC TIÊU)
  // =====================================================================
  const handleInspect = (mt5Account: string) => {
    if (mt5Account !== selectedMT5) {
        setLoading(true);
        setSelectedMT5(mt5Account);
    }
  };

  // =====================================================================
  // 🛡️ NHIỆM VỤ 5: KIỂM TOÁN TÀI CHÍNH & TÌNH TRẠNG SỨC KHỎE
  // =====================================================================
  const formatMoney = (val: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val || 0));
  
  const safeBalance = Number(displayAccountInfo?.balance || 0);
  const safeEquity = Number(displayAccountInfo?.equity || safeBalance); 

  const netProfit = useMemo(() => {
      return displayTrades.reduce((total: number, trade: any) => total + Number(trade.profit || 0), 0);
  }, [displayTrades]);

  const getAccountStatus = () => {
      // ✅ CHỐT CHẶN: Đang đồng bộ thì báo Syncing, không báo Offline bậy
      if (loading && (!safeBalance || safeBalance === 0)) {
        return { label: "SYNCING...", color: "text-blue-500 animate-pulse", icon: Radar };
      }

      if(!safeBalance || safeBalance === 0) return { label: "OFFLINE / EMPTY", color: "text-slate-500", icon: Wallet };
      
      const dd = ((safeBalance - safeEquity) / safeBalance) * 100;
      if (safeEquity > safeBalance) return { label: "PROFITABLE", color: "text-green-400", icon: Zap };
      if (dd > 50) return { label: "CRITICAL", color: "text-red-500 animate-pulse", icon: AlertTriangle };
      if (dd > 20) return { label: "WARNING", color: "text-yellow-500", icon: AlertTriangle };
      return { label: "HEALTHY", color: "text-blue-400", icon: Shield };
  };

  const status = getAccountStatus();

  // =====================================================================
  // 🛡️ NHIỆM VỤ 6: BIÊN DỊCH DỮ LIỆU ĐỒ THỊ
  // =====================================================================
  const chartData = useMemo(() => {
    if (!safeBalance || !displayTrades) return [];
    let currentBal = safeBalance;
    const history = [...displayTrades].map((trade: any) => {
        const profit = Number(trade.profit || 0);
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
  }, [displayTrades, safeBalance]);
  
  // =====================================================================
  // 🛑 BỨC TƯỜNG PHÒNG THỦ: CẤM LÍNH VÔ GIA CƯ
  // =====================================================================
  if (isCheckingProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-slate-900/60 border border-slate-800 rounded-[2rem] text-blue-500">
          <Loader2 size={48} className="animate-spin mb-4" />
          <p className="text-sm font-mono tracking-widest uppercase italic">Đang quét hồ sơ quân đoàn...</p>
      </div>
    );
  }

  if (!isAdmin && !clientMT5) {
      return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-slate-900/60 border border-slate-800 rounded-[2rem] text-slate-400">
          <Shield size={64} className="mb-4 text-slate-600 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Khu vực hạn chế</h2>
          <p className="text-sm text-center">Tài khoản của bạn chưa được liên kết với số MT5 nào.<br/>Vui lòng liên hệ Admin để nhận thông tin tình báo.</p>
      </div>
      );
  }

  // =====================================================================
  // 🛡️ NHIỆM VỤ 7: RENDER GIAO DIỆN CHỈ HUY MẶT TRẬN
  // =====================================================================
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
                        <option value="">🎯 TÀI KHOẢN CỦA TÔI</option>
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
                <p className="text-2xl font-black text-white font-mono mt-1">{formatMoney(safeBalance)}</p>
            </div>

            <div className="bg-green-900/10 border border-green-500/20 p-5 rounded-3xl relative overflow-hidden group">
                <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-30 transition-opacity text-green-500"><TrendingUp size={40} /></div>
                <p className="text-[10px] text-green-500 uppercase tracking-widest font-black">Equity</p>
                <p className="text-2xl font-black text-green-400 font-mono mt-1">{formatMoney(safeEquity)}</p>
                <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${safeEquity > safeBalance ? 'bg-green-500' : 'bg-yellow-500'}`} 
                        style={{ width: `${Math.min((safeEquity / (safeBalance || 1)) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-3xl">
                <p className="text-[10px] text-yellow-500 uppercase tracking-widest font-black">Net Realized Profit</p>
                <p className={`text-2xl font-black font-mono mt-1 ${netProfit >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {netProfit > 0 ? '+' : ''}{formatMoney(netProfit)}
                </p>
                <p className="text-[9px] text-slate-500 italic mt-1 font-mono">Sum of closed trades</p>
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
                    <span className="text-[10px] text-green-500 bg-green-900/20 px-2 py-1 rounded border border-green-900/50 animate-pulse ml-2">● LIVE FIBER</span>
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
                        <Area 
                            type="monotone" 
                            dataKey="balance" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorBalance)" 
                            dot={<CustomizedDot />} 
                            isAnimationActive={false} // ✅ CHỐNG GIẬT BIỂU ĐỒ
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 transition-all duration-500 ${loading ? 'opacity-50 blur-[2px]' : ''}`}>
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