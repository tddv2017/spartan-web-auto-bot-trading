"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  ArrowUpCircle, ArrowDownCircle, Target, Activity, Clock, Zap, TrendingUp, TrendingDown
} from 'lucide-react';

export default function SignalFeed() {
  const [signals, setSignals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. LẤY DỮ LIỆU TỪ FIREBASE
  useEffect(() => {
    const q = query(
        collection(db, "signals"), 
        orderBy("createdAt", "desc"), 
        limit(500)
    );
    
    const unsub = onSnapshot(q, (snap) => {
      setSignals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. XỬ LÝ DATA
  const formattedSignals = useMemo(() => {
    return signals.map(sig => {
        const date = sig.createdAt?.seconds ? new Date(sig.createdAt.seconds * 1000) : new Date();
        return {
            ...sig,
            fullTime: date.toLocaleString('vi-VN'),
            shortTime: date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
            price: Number(sig.price),
            isBuy: sig.type && sig.type.toString().toUpperCase().includes("BUY")
        };
    });
  }, [signals]);

  // 3. TÍNH TOÁN STATS
  const stats = useMemo(() => {
      if (signals.length === 0) return { totalSignals: 0, buy: 0, sell: 0, lastPrice: 0, lastType: "WAITING" };
      
      const total = signals.length;
      const buyCount = signals.filter(s => s.type.toString().toUpperCase().includes("BUY")).length;
      const sellCount = total - buyCount;
      const latest = formattedSignals[0];
      
      return {
          totalSignals: total,
          buy: buyCount,
          sell: sellCount,
          lastPrice: latest?.price || 0,
          lastType: latest?.isBuy ? "BUY" : "SELL",
          lastSymbol: latest?.symbol || "---"
      };
  }, [signals, formattedSignals]);

  const latestSignal = formattedSignals[0];

  return (
    <div className="bg-black/90 border border-green-800/50 rounded-2xl p-6 w-full h-[600px] flex flex-col relative overflow-hidden">
      
      {/* HEADER CHUNG */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <h3 className="text-green-500 font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
          <Target className="animate-pulse text-red-500" size={20}/> 
          LIVE WAR ROOM ({stats.totalSignals})
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            <Activity size={12} className="text-blue-500"/> Real-time Connection
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden">
          
          {/* CỘT TRÁI: THỐNG KÊ & TÍN HIỆU MỚI NHẤT */}
          <div className="flex flex-col gap-4 h-full">
              
              <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-900/10 border border-green-500/20 p-3 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[10px] text-green-500 uppercase font-bold mb-1">BUY</span>
                      <span className="text-2xl font-black text-green-400">{stats.buy}</span>
                  </div>
                  <div className="bg-red-900/10 border border-red-500/20 p-3 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[10px] text-red-500 uppercase font-bold mb-1">SELL</span>
                      <span className="text-2xl font-black text-red-400">{stats.sell}</span>
                  </div>
              </div>

              {latestSignal ? (
                  <div className={`flex-grow border-2 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden ${latestSignal.isBuy ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
                      {/* Background Effect */}
                      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${latestSignal.isBuy ? 'bg-green-500' : 'bg-red-500'}`}></div>

                      <div className="relative z-10">
                          <div className="flex justify-between items-start mb-2">
                              <span className="bg-black/40 px-2 py-1 rounded text-[10px] text-slate-400 font-mono border border-slate-700">{latestSignal.fullTime}</span>
                              <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-white/10">
                                <span className="text-[10px] font-bold text-yellow-500">{latestSignal.confidence || 0}% CONFIDENCE</span>
                              </div>
                          </div>
                          
                          <h2 className="text-4xl font-black text-white mb-1 tracking-tighter">{latestSignal.symbol}</h2>
                          <div className={`text-lg font-bold flex items-center gap-2 ${latestSignal.isBuy ? 'text-green-400' : 'text-red-400'}`}>
                              {latestSignal.isBuy ? <TrendingUp size={24}/> : <TrendingDown size={24}/>}
                              {latestSignal.type} AT {latestSignal.price}
                          </div>

                          {/* 🔳 BLACKBOX ANALYSIS (NHIỆM VỤ MỚI) */}
                          <div className="mt-6 bg-black/60 border border-white/5 rounded-xl p-4">
                            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Zap size={12}/> AI Tactical Reasoning
                            </p>
                            <p className="text-sm text-slate-200 leading-relaxed italic">
                              "{latestSignal.reasoning || 'Đang phân tích cấu trúc thị trường...'}"
                            </p>
                          </div>
                      </div>

                      <div className="mt-4 flex justify-between items-end">
                          <div>
                            <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">RISK LEVEL</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${latestSignal.risk === 'HIGH' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                              {latestSignal.risk || 'STABLE'}
                            </span>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="flex-grow border border-slate-800 rounded-2xl flex items-center justify-center text-slate-600 bg-slate-900/20">
                      <p>Connecting to HQ...</p>
                  </div>
              )}
          </div>

          {/* CỘT PHẢI: DANH SÁCH LỊCH SỬ */}
          <div className="h-full flex flex-col bg-slate-900/30 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-3 border-b border-slate-800 bg-slate-900/50">
                  <h4 className="text-xs font-bold text-slate-400 flex items-center gap-2">
                      <Clock size={12}/> RECENT HISTORY
                  </h4>
              </div>
              
              <div className="flex-grow overflow-y-auto p-2 space-y-2 custom-scrollbar">
                  {formattedSignals.map((sig: any, idx: number) => (
                      <div key={idx} className="bg-black/40 border border-slate-800/50 p-3 rounded-lg flex justify-between items-center hover:bg-slate-800 transition-all group">
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${sig.isBuy ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                  {sig.isBuy ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                              </div>
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className="text-white font-bold text-sm">{sig.symbol}</span>
                                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${sig.isBuy ? "bg-green-600 text-black" : "bg-red-600 text-white"}`}>
                                          {sig.isBuy ? "BUY" : "SELL"}
                                      </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{sig.shortTime}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className={`font-mono font-bold text-sm group-hover:scale-110 transition-transform ${sig.isBuy ? 'text-green-400' : 'text-red-400'}`}>
                                  {sig.price}
                              </p>
                          </div>
                      </div>
                  ))}
                  
                  {formattedSignals.length === 0 && (
                      <div className="text-center py-10 text-slate-600 italic text-xs">Chưa có dữ liệu lịch sử</div>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
}