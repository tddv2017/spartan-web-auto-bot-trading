"use client";
import React, { useState, useMemo } from 'react';
import { 
  Radar, List, ArrowUpCircle, ArrowDownCircle, 
  Wallet, TrendingUp, Shield, Activity, AlertTriangle, Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SignalFeed from '@/components/dashboard/SignalFeed';

// 👇 COMPONENT VẼ NỐT CHẤM (DOT) TÙY CHỈNH
const CustomizedDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.time === 'Start') return null; // Không vẽ điểm bắt đầu

    // Logic: Buy màu xanh, Sell màu đỏ
    const isBuy = payload.type === 0 || payload.type === '0' || payload.type?.toString().toUpperCase().includes('BUY');
    const color = isBuy ? '#10b981' : '#ef4444'; 
    const stroke = isBuy ? '#064e3b' : '#7f1d1d'; // Viền đậm hơn chút

    return (
        <circle cx={cx} cy={cy} r={4} stroke={stroke} strokeWidth={2} fill={color} fillOpacity={1} />
    );
};

export const WarRoomTab = ({ trades, accountInfo }: { trades: any[], accountInfo: any }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const formatMoney = (amount: any) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount || 0));
  };

  const dailyProfit = trades.reduce((acc, trade) => acc + Number(trade.profit), 0);

  // 🔥 LOGIC TÍNH TOÁN TRẠNG THÁI TÀI KHOẢN 🔥
  const getAccountStatus = () => {
      if(!accountInfo) return { label: "OFFLINE", color: "text-slate-500", icon: Activity };
      
      const balance = Number(accountInfo.balance);
      const equity = Number(accountInfo.equity);
      
      if(balance === 0) return { label: "EMPTY", color: "text-slate-500", icon: Wallet };

      // Tính mức sụt giảm (Drawdown)
      const drawdown = balance - equity;
      const drawdownPercent = (drawdown / balance) * 100;

      if (equity > balance) return { label: "PROFITABLE", color: "text-green-400", icon: Zap }; // Đang lãi trạng thái
      if (drawdownPercent > 50) return { label: "CRITICAL", color: "text-red-500 animate-pulse", icon: AlertTriangle }; // Báo động đỏ
      if (drawdownPercent > 20) return { label: "WARNING", color: "text-yellow-500", icon: AlertTriangle }; // Cảnh báo
      
      return { label: "HEALTHY", color: "text-blue-400", icon: Shield }; // An toàn
  };

  const accountStatus = getAccountStatus();

  // 🔥 DATA BIỂU ĐỒ (Đã thêm Type để vẽ màu chấm)
  const chartData = useMemo(() => {
    if (!accountInfo || !trades) return [];

    let currentBal = Number(accountInfo.balance);
    
    const history = trades.map(trade => {
        const profit = Number(trade.profit);
        const point = {
            time: trade.time ? new Date(trade.time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : 'N/A',
            balance: Number(currentBal.toFixed(2)),
            profit: profit,
            type: trade.type, // 👇 QUAN TRỌNG: Lưu loại lệnh để vẽ màu chấm
            symbol: trade.symbol
        };
        currentBal = currentBal - profit; 
        return point;
    });

    history.push({
        time: 'Start',
        balance: Number(currentBal.toFixed(2)),
        profit: 0,
        type: null,
        symbol: ''
    });

    return history.reverse();
  }, [trades, accountInfo]);

  const getTradeStyle = (type: any) => {
      if (type === 0 || type === '0') return { color: "text-green-500", bg: "bg-green-500/10", label: "BUY" };
      if (type === 1 || type === '1') return { color: "text-red-500", bg: "bg-red-500/10", label: "SELL" };
      const safeType = type ? type.toString().toUpperCase() : "";
      return safeType.includes("BUY") 
        ? { color: "text-green-500", bg: "bg-green-500/10", label: "BUY" }
        : { color: "text-red-500", bg: "bg-red-500/10", label: "SELL" };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* HUD BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl flex flex-col relative overflow-hidden group">
                <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Wallet size={40} />
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">BALANCE</p>
                <p className="text-2xl font-black text-white font-mono mt-1">
                    {formatMoney(accountInfo?.balance)}
                </p>
            </div>

            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-2xl flex flex-col relative overflow-hidden group">
                <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-30 transition-opacity text-green-500">
                    <TrendingUp size={40} />
                </div>
                <p className="text-[10px] text-green-500 uppercase tracking-widest font-bold">EQUITY</p>
                <p className="text-2xl font-black text-green-400 font-mono mt-1">
                    {formatMoney(accountInfo?.equity)}
                </p>
                <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                    {/* Thanh máu Equity/Balance */}
                    <div 
                        className={`h-full transition-all duration-500 ${Number(accountInfo?.equity) > Number(accountInfo?.balance) ? 'bg-green-500' : 'bg-yellow-500'}`} 
                        style={{ width: `${Math.min((Number(accountInfo?.equity) / Number(accountInfo?.balance)) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl flex flex-col relative overflow-hidden">
                <p className="text-[10px] text-yellow-500 uppercase tracking-widest font-bold">REALIZED P/L</p>
                <p className={`text-2xl font-black font-mono mt-1 ${dailyProfit >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {dailyProfit > 0 ? '+' : ''}{formatMoney(dailyProfit)}
                </p>
            </div>

            {/* 👇 STATUS BOX ĐÃ ĐỘNG (Dynamic) */}
            <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl flex flex-col relative overflow-hidden">
                <p className={`text-[10px] uppercase tracking-widest font-bold ${accountStatus.color}`}>ACCOUNT STATUS</p>
                <div className="flex items-center gap-2 mt-2">
                    <accountStatus.icon size={20} className={accountStatus.color}/>
                    <span className={`text-lg font-bold ${accountStatus.color}`}>{accountStatus.label}</span>
                </div>
            </div>
        </div>

        {/* GROWTH CHART */}
        <div className="col-span-1 xl:col-span-3 bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem] h-[400px] relative group">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-sm tracking-wider">
                    <Activity size={16} className="text-green-500"/> Account Growth
                </h3>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> BUY
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> SELL
                    </div>
                    <span className="text-[10px] text-green-500 bg-green-900/20 px-2 py-1 rounded border border-green-900/50 animate-pulse ml-2">
                        ● LIVE
                    </span>
                </div>
            </div>
            
            <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis 
                            stroke="#475569" 
                            fontSize={10} 
                            tickFormatter={(val) => `$${val}`}
                            domain={['auto', 'auto']} 
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            // Hiển thị chi tiết lệnh khi hover
                            formatter={(value: any, name: any, props: any) => {
                                if (name === 'balance') return [`$${Number(value).toFixed(2)}`, 'Balance'];
                                return [value, name];
                            }}
                            labelFormatter={(label, payload) => {
                                const data = payload[0]?.payload;
                                if (data && data.symbol) {
                                    const type = data.type === 0 || data.type === '0' || data.type?.toString().includes('BUY') ? 'BUY' : 'SELL';
                                    return `${label} | ${type} ${data.symbol} (${data.profit > 0 ? '+' : ''}${data.profit}$)`;
                                }
                                return `Time: ${label}`;
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="balance" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorBalance)" 
                            dot={<CustomizedDot />} // 👈 DÙNG NỐT CHẤM TÙY CHỈNH Ở ĐÂY
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* MAIN GRID - Trades Log (Giữ nguyên) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
                <SignalFeed />
            </div>

            <div className="xl:col-span-1">
                <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-4 h-full min-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
                        <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-sm tracking-wider">
                            <List size={16} className="text-blue-500"/> Trades Log
                        </h3>
                        <span className="text-[10px] text-slate-500 bg-black/30 px-2 py-1 rounded border border-slate-800">
                            {currentPage}
                        </span>
                    </div>

                    {trades.length > 0 ? (
                        <>
                            <div className="overflow-x-auto flex-grow custom-scrollbar">
                                <div className="space-y-2">
                                    {trades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((trade, idx) => {
                                        const style = getTradeStyle(trade.type);
                                        const profit = Number(trade.profit);
                                        return (
                                            <div key={idx} className="bg-black/20 border border-slate-800/50 p-3 rounded-xl hover:bg-slate-800/50 transition-colors flex justify-between items-center group">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 ${style.bg} ${style.color}`}>
                                                            {style.label}
                                                        </span>
                                                        <span className="text-white font-bold text-xs">{trade.symbol}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-mono opacity-50">#{trade.ticket}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-mono font-bold text-sm ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {profit > 0 ? '+' : ''}{profit.toFixed(2)} $
                                                    </p>
                                                    <p className="text-[10px] text-slate-600">
                                                        {trade.time ? new Date(trade.time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                             {trades.length > itemsPerPage && (
                                <div className="flex justify-center items-center gap-2 mt-4 pt-2 border-t border-slate-800/50">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-[10px] font-bold">Prev</button>
                                    <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(trades.length / itemsPerPage), p + 1))} disabled={currentPage === Math.ceil(trades.length / itemsPerPage)} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-[10px] font-bold">Next</button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-slate-500 italic flex-col gap-2">
                            <List size={40} className="opacity-20"/>
                            <p className="text-xs">No trades yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};