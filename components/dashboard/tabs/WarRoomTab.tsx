"use client";
import React, { useState } from 'react';
import { 
  Radar, List, ArrowUpCircle, ArrowDownCircle, 
  Wallet, TrendingUp, Shield, Activity 
} from 'lucide-react';
import SignalFeed from '@/components/dashboard/SignalFeed';

export const WarRoomTab = ({ trades, accountInfo }: { trades: any[], accountInfo: any }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // 👇 ĐÃ SỬA: Giảm xuống còn 6 lệnh / trang
  const itemsPerPage = 6; 

  const formatMoney = (amount: any) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount || 0));
  };

  const dailyProfit = trades.reduce((acc, trade) => acc + Number(trade.profit), 0);

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
                    <div className="bg-green-500 h-full" style={{ width: '90%' }}></div>
                </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl flex flex-col relative overflow-hidden">
                <p className="text-[10px] text-yellow-500 uppercase tracking-widest font-bold">REALIZED P/L</p>
                <p className={`text-2xl font-black font-mono mt-1 ${dailyProfit >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {dailyProfit > 0 ? '+' : ''}{formatMoney(dailyProfit)}
                </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl flex flex-col relative overflow-hidden">
                <p className="text-[10px] text-blue-500 uppercase tracking-widest font-bold">ACCOUNT STATUS</p>
                <div className="flex items-center gap-2 mt-2">
                    <Shield size={20} className="text-blue-400"/>
                    <span className="text-lg font-bold text-white">HEALTHY</span>
                </div>
            </div>
        </div>

        {/* MAIN GRID */}
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