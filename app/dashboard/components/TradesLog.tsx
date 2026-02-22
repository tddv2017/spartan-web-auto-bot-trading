"use client";
import React, { useState } from 'react';
import { List, Activity, Hash, Clock } from 'lucide-react';

export default function TradesLog({ trades }: { trades: any[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const getTradeStyle = (type: any) => {
        const t = type?.toString().toUpperCase();
        if (t === '0' || t?.includes('BUY')) return { color: "text-emerald-400", bg: "bg-emerald-500/10", label: "BUY", border: "border-emerald-500/20", indicator: "bg-emerald-400" };
        return { color: "text-red-400", bg: "bg-red-500/10", label: "SELL", border: "border-red-500/20", indicator: "bg-red-400" };
    };

    return (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 h-full min-h-[500px] flex flex-col relative overflow-hidden shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800 relative z-10">
                <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-[11px] tracking-wider">
                    <List size={16} className="text-blue-500"/> TRADES LOG
                </h3>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-900 px-2 py-1 rounded-md border border-slate-800">P. {currentPage}</span>
                </div>
            </div>

            {trades.length > 0 ? (
                <>
                    <div className="overflow-x-auto flex-grow relative z-10">
                        <div className="space-y-3">
                            {trades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((trade: any, idx: number) => {
                                const style = getTradeStyle(trade.type);
                                const profit = Number(trade.profit);
                                return (
                                    <div key={idx} className="bg-[#0B1120] border border-slate-800/60 p-4 rounded-xl hover:border-slate-700 transition-colors flex justify-between items-center group">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5 border ${style.bg} ${style.color} ${style.border} uppercase`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${style.indicator}`}></span> {style.label}
                                                </span>
                                                <span className="text-white font-bold text-sm tracking-tight">{trade.symbol}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                                                <span className="flex items-center gap-1"><Hash size={10}/> {trade.ticket}</span>
                                                <span className="flex items-center gap-1"><Clock size={10}/> {trade.time ? new Date(trade.time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit', second:'2-digit'}) : '--:--'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-mono font-bold text-lg tracking-tight ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {profit > 0 ? '+' : ''}{profit.toFixed(2)} $
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {trades.length > itemsPerPage && (
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800 relative z-10">
                            <span className="text-xs text-slate-500 font-medium">Tổng: {trades.length} lệnh</span>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold text-slate-300 transition-colors">Prev</button>
                                <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(trades.length / itemsPerPage), p + 1))} disabled={currentPage === Math.ceil(trades.length / itemsPerPage)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold text-slate-300 transition-colors">Next</button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex-grow flex items-center justify-center text-slate-500 flex-col gap-3 relative z-10">
                    <List size={40} className="text-slate-700 mb-2"/>
                    <p className="text-[11px] uppercase tracking-wider font-bold">Sóng Radar Trống</p>
                    <p className="text-xs">Chưa có dữ liệu giao dịch nào</p>
                </div>
            )}
        </div>
    );
}