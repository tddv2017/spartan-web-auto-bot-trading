"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  ArrowUpCircle, ArrowDownCircle, Target, List, Activity, TrendingUp, Clock 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot 
} from 'recharts';

export default function SignalFeed() {
  const [signals, setSignals] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'LIST' | 'CHART'>('LIST'); 

  // 1. LẤY DỮ LIỆU THẬT TỪ FIREBASE
  useEffect(() => {
    const q = query(collection(db, "signals"), orderBy("createdAt", "desc"), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setSignals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });
    return () => unsub();
  }, []);

  // 2. XỬ LÝ DATA (NẾU KHÔNG CÓ DATA THẬT -> TẠO DATA GIẢ ĐỂ TEST CHART)
  const chartData = useMemo(() => {
    // A. Nếu có dữ liệu thật -> Dùng dữ liệu thật
    if (signals.length > 0) {
        return [...signals].reverse().map(sig => ({
            ...sig,
            timeStr: sig.createdAt?.seconds 
                ? new Date(sig.createdAt.seconds * 1000).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) 
                : 'Just now',
            price: Number(sig.price),
            isBuy: sig.type.includes("BUY")
        }));
    }

    // B. Nếu chưa có dữ liệu (Bot chưa chạy) -> Tạo 15 điểm giả lập để Đại tá ngắm Chart
    const fakeData = [];
    let price = 2030.00;
    for (let i = 0; i < 15; i++) {
        price = price + (Math.random() - 0.5) * 2; // Giá nhảy lung tung
        fakeData.push({
            id: `fake-${i}`,
            symbol: 'XAUUSD',
            type: Math.random() > 0.5 ? 'BUY_TREND' : 'SELL_BREAKOUT',
            price: Number(price.toFixed(2)),
            timeStr: `${10 + i}:00`,
            isBuy: Math.random() > 0.5
        });
    }
    return fakeData;
  }, [signals]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs z-50">
          <p className="text-slate-400 mb-1">{label}</p>
          <p className={`font-bold ${data.isBuy ? 'text-green-400' : 'text-red-500'} flex items-center gap-1`}>
            {data.isBuy ? "🟢 BUY" : "🔴 SELL"} @ {data.price}
          </p>
          <p className="text-white font-bold mt-1">{data.symbol} {signals.length === 0 && "(DEMO)"}</p>
        </div>
      );
    }
    return null;
  };

  // Custom Dot
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <circle 
        cx={cx} cy={cy} r={3} 
        stroke={payload.isBuy ? "#4ade80" : "#f87171"} 
        strokeWidth={2} fill="#000" 
      />
    );
  };

  return (
    <div className="bg-black/90 border border-green-800 rounded-2xl p-4 w-full h-full flex flex-col relative overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="text-green-500 font-bold flex items-center gap-2 uppercase tracking-widest text-xs md:text-sm">
          <Target className="animate-pulse" size={18}/> Live Feed {signals.length === 0 && <span className="text-[9px] bg-slate-800 px-1 rounded text-slate-400">DEMO MODE</span>}
        </h3>
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button onClick={() => setViewMode('LIST')} className={`p-1.5 rounded transition-all ${viewMode === 'LIST' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`} title="Xem danh sách"><List size={14}/></button>
            <button onClick={() => setViewMode('CHART')} className={`p-1.5 rounded transition-all ${viewMode === 'CHART' ? 'bg-green-600 text-black' : 'text-slate-500 hover:text-slate-300'}`} title="Xem biểu đồ"><Activity size={14}/></button>
        </div>
      </div>
      
      {/* CONTENT AREA */}
      <div className="flex-grow overflow-hidden flex flex-col relative z-10">
        
        {viewMode === 'CHART' ? (
            <div className="w-full h-[300px] md:h-full min-h-[250px] -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="timeStr" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis domain={['auto', 'auto']} tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} width={45} tickFormatter={(val) => val.toFixed(1)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="price" stroke="#22c55e" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} dot={renderCustomDot} isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        ) : (
            <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar max-h-[400px]">
                {/* HIỂN THỊ LIST (Dữ liệu thật hoặc giả đều hiện) */}
                {chartData.slice().reverse().map((sig: any, idx: number) => (
                <div key={idx} className="bg-green-950/10 border border-green-900/50 p-3 rounded-xl flex justify-between items-center hover:bg-green-900/20 transition-colors">
                    <div className="flex items-center gap-3">
                        {sig.isBuy ? <div className="bg-green-500/10 p-2 rounded-full"><ArrowUpCircle className="text-green-400" size={20} /></div> : <div className="bg-red-500/10 p-2 rounded-full"><ArrowDownCircle className="text-red-500" size={20} /></div>}
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-white font-bold text-xs">{sig.symbol}</p>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${sig.isBuy ? "bg-green-500 text-black" : "bg-red-500 text-white"}`}>{sig.isBuy ? "BUY" : "SELL"}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">{sig.type.replace("BUY_", "").replace("SELL_", "")}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white font-mono font-bold text-sm">${sig.price}</p>
                        <p className="text-[10px] text-slate-500 flex items-center justify-end gap-1"><Clock size={10}/> {sig.timeStr}</p>
                    </div>
                </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}