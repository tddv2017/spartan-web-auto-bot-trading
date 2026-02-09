"use client";
import React, { useState } from 'react';
import { Radar, List, ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react';
import SignalFeed from '@/components/dashboard/SignalFeed';

export const WarRoomTab = ({ trades }: { trades: any[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🛠️ HÀM BỔ TRỢ: XỬ LÝ MÀU SẮC & TEXT CHUẨN
  const getTradeStyle = (type: string) => {
      // Chuyển về chữ hoa để so sánh cho chuẩn
      const safeType = type ? type.toString().toUpperCase() : "";
      
      if (safeType.includes("BUY")) {
          return {
              color: "text-green-500",
              bg: "bg-green-500/10",
              label: "BUY",
              icon: <ArrowUpCircle size={14} className="text-green-500"/>
          };
      }
      // Mặc định còn lại là SELL
      return {
          color: "text-red-500",
          bg: "bg-red-500/10",
          label: "SELL",
          icon: <ArrowDownCircle size={14} className="text-red-500"/>
      };
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* CỘT TRÁI: LIVE SIGNALS */}
        <div className="xl:col-span-1 space-y-4">
            <div className="bg-green-900/10 border border-green-500/30 p-4 rounded-2xl">
                <h3 className="text-green-500 font-bold flex items-center gap-2 mb-2 text-sm uppercase tracking-wider">
                    <Radar className="animate-spin-slow" size={18}/> LIVE SIGNALS
                </h3>
                <p className="text-[10px] text-green-400/70">Tín hiệu được Bot phân tích và bắn trực tiếp từ MT5 theo thời gian thực.</p>
            </div>
            <SignalFeed />
        </div>

        {/* CỘT PHẢI: LỊCH SỬ KHỚP LỆNH */}
        <div className="xl:col-span-2">
            <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-6 h-full min-h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-300 flex items-center gap-2 uppercase text-sm tracking-wider">
                        <List size={16} className="text-blue-500"/> Lệnh đã khớp
                    </h3>
                    <span className="text-[10px] text-slate-500 bg-black/30 px-2 py-1 rounded border border-slate-800">
                        Page {currentPage}/{Math.ceil(trades.length / itemsPerPage) || 1}
                    </span>
                </div>

                {trades.length > 0 ? (
                    <>
                        <div className="overflow-x-auto flex-grow">
                            <table className="w-full text-xs text-left text-slate-400">
                                <thead className="text-slate-500 uppercase font-black border-b border-slate-800">
                                    <tr>
                                        <th className="py-3 pl-4">Ticket</th>
                                        <th className="py-3">Symbol</th>
                                        <th className="py-3">Type</th>
                                        <th className="py-3">Time</th>
                                        <th className="py-3 text-right pr-4">Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {trades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((trade, idx) => {
                                        // Gọi hàm xử lý style
                                        const style = getTradeStyle(trade.type);
                                        const profit = Number(trade.profit); // Ép kiểu số cho chắc

                                        return (
                                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                                {/* Cột 1: Ticket */}
                                                <td className="py-3 pl-4 font-mono text-slate-500">#{trade.ticket}</td>
                                                
                                                {/* Cột 2: Symbol */}
                                                <td className="py-3 font-bold text-white">{trade.symbol}</td>
                                                
                                                {/* Cột 3: Type (Đã Fix hiển thị đúng màu) */}
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${style.bg} ${style.color}`}>
                                                        {style.icon} {style.label}
                                                    </span>
                                                </td>
                                                
                                                {/* Cột 4: Time */}
                                                <td className="py-3 text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={10}/>
                                                        {trade.time ? new Date(trade.time).toLocaleTimeString('vi-VN') : '--:--'}
                                                    </div>
                                                </td>
                                                
                                                {/* Cột 5: Profit (Xanh/Đỏ theo lợi nhuận) */}
                                                <td className={`py-3 text-right pr-4 font-bold font-mono text-sm ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {profit > 0 ? '+' : ''}{profit.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {/* Phân trang */}
                        {trades.length > itemsPerPage && (
                            <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-slate-800/50">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold transition-all">Prev</button>
                                {Array.from({ length: Math.ceil(trades.length / itemsPerPage) }, (_, i) => i + 1).map(pageNum => (
                                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-6 h-6 rounded text-xs font-bold transition-all ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{pageNum}</button>
                                ))}
                                <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(trades.length / itemsPerPage), p + 1))} disabled={currentPage === Math.ceil(trades.length / itemsPerPage)} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold transition-all">Next</button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-slate-500 italic flex-col gap-2">
                        <List size={40} className="opacity-20"/>
                        <p>Chưa có dữ liệu giao dịch</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};