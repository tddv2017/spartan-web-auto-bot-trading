"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '../lib/firebase'; // Nhớ đường dẫn file firebase config của Đại tá
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

export default function LivePerformance() {
  const { profile } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [winRate, setWinRate] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;

    // Lắng nghe dữ liệu realtime từ Firebase
    const tradesRef = collection(db, "users", profile.id, "trades");
    // Lấy 50 lệnh gần nhất
    const q = query(tradesRef, orderBy("closeTime", "desc"), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let profit = 0;
      let wins = 0;
      const tradeData = snapshot.docs.map(doc => {
        const data = doc.data();
        profit += data.profit;
        if (data.profit > 0) wins++;
        return { id: doc.id, ...data };
      });

      setTrades(tradeData);
      setTotalProfit(profit);
      setWinRate(tradeData.length > 0 ? (wins / tradeData.length) * 100 : 0);
    });

    return () => unsubscribe();
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. THỐNG KÊ TỔNG QUAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tổng Lợi Nhuận</p>
            <p className={`text-2xl font-black ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} $
            </p>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl">
            <DollarSign className="text-white" size={24} />
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Win Rate</p>
            <p className="text-2xl font-black text-yellow-500">
              {winRate.toFixed(1)}%
            </p>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl">
            <Activity className="text-white" size={24} />
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tổng số lệnh</p>
            <p className="text-2xl font-black text-white">
              {trades.length}
            </p>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl">
            <TrendingUp className="text-white" size={24} />
          </div>
        </div>
      </div>

      {/* 2. BẢNG LỊCH SỬ LỆNH */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            LỊCH SỬ GIAO DỊCH (Real-time)
          </h3>
          <span className="text-xs text-slate-500 italic">Cập nhật từ MT5</span>
        </div>
        
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-950 sticky top-0">
              <tr>
                <th className="px-6 py-3">Ticket</th>
                <th className="px-6 py-3">Symbol</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Profit</th>
                <th className="px-6 py-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 italic">
                    Chưa có dữ liệu giao dịch từ Bot...
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-400">#{trade.ticket}</td>
                    <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        trade.type === 0 || trade.type === 'BUY' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {trade.type === 0 || trade.type === 'BUY' ? 'BUY' : 'SELL'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold ${
                      trade.profit >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.profit >= 0 ? '+' : ''}{trade.profit} $
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 text-xs">
                      {new Date(trade.closeTime).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}