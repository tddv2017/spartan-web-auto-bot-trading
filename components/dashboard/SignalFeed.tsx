"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  ArrowUpCircle, ArrowDownCircle, Target, List, Activity, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function SignalFeed() {
  const [signals, setSignals] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'LIST' | 'CHART'>('CHART'); 
  const [isLoading, setIsLoading] = useState(true);

  // 1. LẤY DỮ LIỆU THẬT (REAL DATA ONLY)
  useEffect(() => {
    // ⚠️ LỆNH: Lấy 500 tín hiệu mới nhất để vẽ Chart dài hạn
    const q = query(
        collection(db, "signals"), 
        orderBy("createdAt", "desc"), // Mới nhất lên đầu để lấy đúng 500 cái gần nhất
        limit(500)
    );
    
    const unsub = onSnapshot(q, (snap) => {
      // Lưu thẳng dữ liệu thật, không pha trộn
      setSignals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. XỬ LÝ DATA CHO CHART
  const chartData = useMemo(() => {
    // Nếu chưa có dữ liệu thật -> Trả về rỗng (Chấp nhận chart trống chứ không dùng hàng Fake)
    if (signals.length === 0) return [];

    // Clone và ĐẢO NGƯỢC mảng để vẽ đúng chiều thời gian: Quá khứ (Trái) -> Hiện tại (Phải)
    return [...signals].reverse().map(sig => {
        // Xử lý an toàn cho Time (tránh lỗi khi serverTimestamp chưa kịp ghi)
        const date = sig.createdAt?.seconds ? new Date(sig.createdAt.seconds * 1000) : new Date();
        
        return {
            ...sig,
            fullTime: date.toLocaleString('vi-VN'), // 09/02/2026 14:30:00
            shortTime: date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}), // 14:30
            price: Number(sig.price),
            isBuy: sig.type && sig.type.toString().toUpperCase().includes("BUY")
        };
    });
  }, [signals]);

  // --- Custom Tooltip ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl text-xs z-50 backdrop-blur-md">
          <p className="text-slate-400 mb-1">{data.fullTime}</p>
          <p className={`font-bold text-sm ${data.isBuy ? 'text-green-400' : 'text-red-500'} flex items-center gap-1`}>
            {data.isBuy ? "🟢 BUY" : "🔴 SELL"} @ {data.price}
          </p>
          <p className="text-white font-bold mt-1 uppercase text-[10px] tracking-wider bg-slate-800 px-1 py-0.5 rounded w-fit">
            {data.symbol} | {data.type}
          </p>
        </div>
      );
    }
    return null;
  };

  // --- Custom Dot (Tối ưu hiệu năng) ---
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    // Nếu data quá nhiều (>100), chỉ vẽ điểm mỗi 10 nến để đỡ lag & rối mắt
    if (chartData.length > 100 && payload.index % 10 !== 0) return <></>;
    
    return (
      <circle 
        cx={cx} cy={cy} r={2} 
        stroke={payload.isBuy ? "#4ade80" : "#f87171"} 
        strokeWidth={1} fill="#000" 
      />
    );
  };

  return (
    <div className="bg-black/90 border border-green-800/50 rounded-2xl p-4 w-full h-full flex flex-col relative overflow-hidden group min-h-[400px]">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="text-green-500 font-bold flex items-center gap-2 uppercase tracking-widest text-xs md:text-sm">
          <Target className="animate-pulse text-red-500" size={18}/> 
          Signal History ({signals.length})
        </h3>
        
        {/* Toggle Button */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button onClick={() => setViewMode('LIST')} className={`p-1.5 rounded transition-all ${viewMode === 'LIST' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`} title="Xem danh sách"><List size={14}/></button>
            <button onClick={() => setViewMode('CHART')} className={`p-1.5 rounded transition-all ${viewMode === 'CHART' ? 'bg-green-600 text-black' : 'text-slate-500 hover:text-slate-300'}`} title="Xem biểu đồ"><Activity size={14}/></button>
        </div>
      </div>
      
      {/* CONTENT AREA */}
      <div className="flex-grow overflow-hidden flex flex-col relative z-10">
        
        {viewMode === 'CHART' ? (
            <div className="w-full h-full -ml-4">
               {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                            dataKey="shortTime" 
                            tick={{fill: '#64748b', fontSize: 10}} 
                            axisLine={false} 
                            tickLine={false} 
                            minTickGap={40} // Giãn cách trục thời gian
                        />
                        <YAxis 
                            domain={['auto', 'auto']} 
                            tick={{fill: '#64748b', fontSize: 10}} 
                            axisLine={false} 
                            tickLine={false} 
                            width={45} 
                            tickFormatter={(val) => val.toFixed(1)} 
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#22c55e" 
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                            strokeWidth={2} 
                            dot={renderCustomDot} 
                            isAnimationActive={false} // Tắt animation để load 500 nến nhanh hơn
                        />
                    </AreaChart>
                </ResponsiveContainer>
               ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                       <Activity className="opacity-20" size={40}/>
                       <p className="text-xs">Chưa có dữ liệu. Hãy chạy Bot để bắn tín hiệu.</p>
                   </div>
               )}
            </div>
        ) : (
            // --- GIAO DIỆN DANH SÁCH ---
            <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar max-h-[400px]">
                {chartData.slice().reverse().map((sig: any, idx: number) => (
                <div key={idx} className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex justify-between items-center hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                        {sig.isBuy ? <div className="bg-green-500/10 p-2 rounded-full"><ArrowUpCircle className="text-green-400" size={18} /></div> : <div className="bg-red-500/10 p-2 rounded-full"><ArrowDownCircle className="text-red-500" size={18} /></div>}
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${sig.isBuy ? "bg-green-500 text-black" : "bg-red-500 text-white"}`}>{sig.isBuy ? "BUY" : "SELL"}</span>
                                <p className="text-slate-300 font-bold text-xs">{sig.symbol}</p>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">{sig.type}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`font-mono font-bold text-sm ${sig.isBuy ? 'text-green-400' : 'text-red-400'}`}>${sig.price}</p>
                        <p className="text-[10px] text-slate-500 flex items-center justify-end gap-1"><Clock size={10}/> {sig.fullTime}</p>
                    </div>
                </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}