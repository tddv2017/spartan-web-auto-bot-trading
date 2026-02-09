"use client";
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { ArrowUpCircle, ArrowDownCircle, Target, Shield } from 'lucide-react';

export default function SignalFeed() {
  const [signals, setSignals] = useState<any[]>([]);

  useEffect(() => {
    // Lấy 10 tín hiệu mới nhất
    const q = query(collection(db, "signals"), orderBy("createdAt", "desc"), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      setSignals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-black/90 border border-green-800 rounded-lg p-4 w-full max-w-md">
      <h3 className="text-green-500 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest">
        <Target className="animate-pulse" /> Live Signal Feed
      </h3>
      
      <div className="space-y-3">
        {signals.map((sig) => (
          <div key={sig.id} className="bg-green-950/20 border border-green-900 p-3 rounded flex justify-between items-center">
            
            {/* Cột Trái: Icon & Loại lệnh */}
            <div className="flex items-center gap-3">
              {sig.type.includes("BUY") ? (
                <ArrowUpCircle className="text-green-400" size={24} />
              ) : (
                <ArrowDownCircle className="text-red-500" size={24} />
              )}
              <div>
                <p className="text-white font-bold text-sm">{sig.symbol}</p>
                <p className={`text-[10px] font-bold ${sig.type.includes("BUY") ? "text-green-400" : "text-red-500"}`}>
                  {sig.type.replace("_", " ")}
                </p>
              </div>
            </div>

            {/* Cột Phải: Giá & Thời gian */}
            <div className="text-right">
              <p className="text-white font-mono font-bold text-sm">${sig.price}</p>
              <p className="text-[10px] text-slate-500">
                 {sig.createdAt?.seconds ? new Date(sig.createdAt.seconds * 1000).toLocaleTimeString('vi-VN') : 'Just now'}
              </p>
            </div>
            
          </div>
        ))}
        
        {signals.length === 0 && <p className="text-center text-slate-600 text-xs py-4">Đang dò tìm tín hiệu...</p>}
      </div>
    </div>
  );
}