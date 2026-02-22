"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  ArrowUpCircle, ArrowDownCircle, Target, Activity, Clock, Zap, TrendingUp, TrendingDown, Globe
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
      const latest = formattedSignals[0];
      
      return {
          totalSignals: total,
          buy: buyCount,
          sell: total - buyCount,
          lastPrice: latest?.price || 0,
          lastType: latest?.isBuy ? "BUY" : "SELL",
          lastSymbol: latest?.symbol || "---"
      };
  }, [signals, formattedSignals]);

  // ⛏️ COMPONENT VẼ HUY HIỆU PHIÊN GIAO DỊCH (TAILADMIN STYLE)
  const getSessionBadge = (sessionName: string) => {
    switch (sessionName) {
      case "ASIAN":
        return <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/20 tracking-wider"><Globe size={10}/> PHIÊN Á</span>;
      case "EUROPEAN":
        return <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-md border border-amber-500/20 tracking-wider"><Globe size={10}/> PHIÊN ÂU</span>;
      case "OVERLAP":
        return <span className="flex items-center gap-1.5 bg-red-500/10 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded-md border border-red-500/30 animate-pulse tracking-wider"><Globe size={10}/> ÂU-MỸ GIAO TRANH</span>;
      case "AMERICAN":
        return <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-md border border-blue-500/20 tracking-wider"><Globe size={10}/> PHIÊN MỸ</span>;
      default:
        return null;
    }
  };

  const latestSignal = formattedSignals[0];

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 w-full h-[600px] flex flex-col relative overflow-hidden shadow-sm">
      
      {/* HEADER CHUNG */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <h3 className="text-white font-bold flex items-center gap-2 uppercase tracking-wider text-[11px]">
          <Target className="text-blue-500" size={18}/> 
          LIVE WAR ROOM ({stats.totalSignals})
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-time Feed
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden">
          
          {/* CỘT TRÁI: THỐNG KÊ & TÍN HIỆU MỚI NHẤT */}
          <div className="flex flex-col gap-4 h-full">
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0B1120] border border-slate-700/60 p-4 rounded-xl flex flex-col items-center justify-center shadow-inner">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Buy Signals</span>
                      <span className="text-3xl font-black text-emerald-400 font-mono">{stats.buy}</span>
                  </div>
                  <div className="bg-[#0B1120] border border-slate-700/60 p-4 rounded-xl flex flex-col items-center justify-center shadow-inner">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Sell Signals</span>
                      <span className="text-3xl font-black text-red-400 font-mono">{stats.sell}</span>
                  </div>
              </div>

              {latestSignal ? (
                  <div className="flex-grow border border-slate-700/60 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden bg-[#0B1120] shadow-inner group hover:border-slate-600 transition-colors">
                      <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none transition-colors ${latestSignal.isBuy ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

                      <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                              <span className="bg-[#111827] px-2.5 py-1 rounded-md text-[10px] text-slate-400 font-mono border border-slate-800 shadow-sm">{latestSignal.fullTime}</span>
                              <div className="flex items-center gap-2 bg-[#111827] px-2.5 py-1 rounded-md border border-slate-800 shadow-sm">
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{latestSignal.confidence || 0}% AI CONFIDENCE</span>
                              </div>
                          </div>
                          
                          {/* CHÈN HUY HIỆU PHIÊN VÀO KẾ BÊN TÊN CẶP TIỀN */}
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-4xl font-black text-white tracking-tight">{latestSignal.symbol}</h2>
                            {getSessionBadge(latestSignal.session)}
                          </div>

                          <div className={`text-xl font-black flex items-center gap-2 tracking-tight ${latestSignal.isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                              {latestSignal.isBuy ? <TrendingUp size={24}/> : <TrendingDown size={24}/>}
                              {latestSignal.type} AT <span className="font-mono">{latestSignal.price}</span>
                          </div>

                          <div className="mt-6 bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Zap size={14}/> AI Tactical Reasoning
                            </p>
                            <p className="text-sm text-slate-300 leading-relaxed italic">
                              "{latestSignal.reasoning || 'Đang phân tích cấu trúc thanh khoản thị trường...'}"
                            </p>
                          </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-end relative z-10">
                          <div>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1.5">MỨC ĐỘ RỦI RO</p>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${latestSignal.risk === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                              {latestSignal.risk || 'STABLE'}
                            </span>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="flex-grow border border-slate-700/60 rounded-xl flex flex-col items-center justify-center text-slate-500 bg-[#0B1120] shadow-inner gap-3">
                      <Activity className="animate-pulse opacity-50" size={32}/>
                      <p className="text-xs uppercase tracking-wider font-semibold">Connecting to HQ...</p>
                  </div>
              )}
          </div>

          {/* CỘT PHẢI: DANH SÁCH LỊCH SỬ */}
          <div className="h-full flex flex-col bg-[#0B1120] rounded-xl border border-slate-700/60 overflow-hidden shadow-inner">
              <div className="p-4 border-b border-slate-800 bg-[#111827]">
                  <h4 className="text-[11px] font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                      <Clock size={16} className="text-blue-500"/> RECENT HISTORY
                  </h4>
              </div>
              
              <div className="flex-grow overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
                  {formattedSignals.map((sig: any, idx: number) => (
                      <div key={idx} className="bg-[#111827] border border-slate-800 p-3.5 rounded-xl flex justify-between items-center hover:border-slate-700 transition-colors shadow-sm group">
                          <div className="flex items-center gap-4">
                              <div className={`p-2.5 rounded-lg border ${sig.isBuy ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                  {sig.isBuy ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                              </div>
                              <div>
                                  <div className="flex items-center gap-2.5 mb-1">
                                      <span className="text-white font-bold text-sm tracking-tight">{sig.symbol}</span>
                                      
                                      {/* ⛏️ CHÈN HUY HIỆU VÀO DANH SÁCH LỊCH SỬ */}
                                      {getSessionBadge(sig.session)}

                                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${sig.isBuy ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
                                          {sig.isBuy ? "BUY" : "SELL"}
                                      </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                                      <Clock size={10}/> {sig.shortTime}
                                  </p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className={`font-mono font-bold text-base tracking-tight group-hover:scale-105 transition-transform ${sig.isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {sig.price}
                              </p>
                          </div>
                      </div>
                  ))}
                  
                  {formattedSignals.length === 0 && (
                      <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center gap-3">
                          <Clock size={32} className="opacity-20"/>
                          <span className="italic text-xs font-medium">Chưa có dữ liệu lịch sử</span>
                      </div>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
}