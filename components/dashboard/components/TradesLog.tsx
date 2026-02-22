// FILE: components/dashboard/TradesLog.tsx
"use client";
import React, { useState } from 'react';
import { List, Activity } from 'lucide-react';

export default function TradesLog({ trades }: { trades: any[] }) {
    // Tự quản lý phân trang bên trong nội bộ Component
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Hàm tô màu nội bộ
    const getTradeStyle = (type: any) => {
        const t = type?.toString().toUpperCase();
        if (t === '0' || t?.includes('BUY')) return { color: "text-green-500", bg: "bg-green-500/10", label: "BUY", border: "border-green-500/30" };
        return { color: "text-red-500", bg: "bg-red-500/10", label: "SELL", border: "border-red-500/30" };
    };

    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-4 h-full min-h-[500px] flex flex-col relative overflow-hidden">
            {/* Hiệu ứng tia chớp chìm phía sau
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Activity size={120} className="animate-pulse" />
            </div> */}

            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800 relative z-10">
                <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-sm tracking-wider">
                    <List size={16} className="text-blue-500"/> Trades Log
                </h3>
                <div className="flex items-center gap-2">
                    {/* 🟢 NHÃN LIVE NHẤP NHÁY BÁO HIỆU CÁP QUANG */}
                    <span className="flex items-center gap-1 text-[9px] font-black text-green-500 bg-green-900/20 px-2 py-1 rounded-full border border-green-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                        LIVE
                    </span>
                    <span className="text-[10px] text-slate-500 bg-black/30 px-2 py-1 rounded border border-slate-800">Trang {currentPage}</span>
                </div>
            </div>

            {trades.length > 0 ? (
                <>
                    <div className="overflow-x-auto flex-grow custom-scrollbar relative z-10">
                        <div className="space-y-2">
                            {trades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((trade: any, idx: number) => {
                                const style = getTradeStyle(trade.type);
                                const profit = Number(trade.profit);
                                return (
                                    <div key={idx} className={`bg-black/40 border ${style.border} p-3 rounded-xl hover:bg-slate-800 transition-all flex justify-between items-center group`}>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 ${style.bg} ${style.color}`}>{style.label}</span>
                                                <span className="text-white font-bold text-xs tracking-wider">{trade.symbol}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-mono opacity-60">#{trade.ticket}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-mono font-black text-sm ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {profit > 0 ? '+' : ''}{profit.toFixed(2)} $
                                            </p>
                                            <p className="text-[10px] text-slate-500">{trade.time ? new Date(trade.time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit', second:'2-digit'}) : '--:--'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {trades.length > itemsPerPage && (
                        <div className="flex justify-center items-center gap-2 mt-4 pt-2 border-t border-slate-800/50 relative z-10">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-[10px] font-bold text-white transition-all">Prev</button>
                            <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(trades.length / itemsPerPage), p + 1))} disabled={currentPage === Math.ceil(trades.length / itemsPerPage)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-[10px] font-bold text-white transition-all">Next</button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex-grow flex items-center justify-center text-slate-500 italic flex-col gap-3 relative z-10">
                    <List size={48} className="opacity-10 mb-2"/>
                    <p className="text-xs uppercase tracking-widest font-bold opacity-50">Sóng Radar Trống</p>
                    <p className="text-[10px]">Chưa có dữ liệu giao dịch nào</p>
                </div>
            )}
        </div>
    );
}