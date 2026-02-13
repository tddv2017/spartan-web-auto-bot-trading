"use client";
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Zap, ZapOff, ShieldAlert, Activity, Lock } from 'lucide-react';

export const BotControlPanel = ({ userData }: { userData: any }) => {
  const [loading, setLoading] = useState(false);
  
  // 1. Kiểm tra trạng thái từ Database
  // Nếu remoteCommand là PAUSE -> Bot đang nghỉ
  const isPaused = userData?.remoteCommand === "PAUSE";
  
  // 2. Kiểm tra xem có bị Admin khóa cứng (STOP) không
  const isLockedByAdmin = userData?.licenseKey === "STOP";

  const handleToggle = async () => {
    if (isLockedByAdmin) {
      alert("⛔ HỆ THỐNG ĐANG BỊ KHÓA BỞI ADMIN! Vui lòng liên hệ hỗ trợ.");
      return;
    }

    const newStatus = isPaused ? "RUN" : "PAUSE";
    const confirmMsg = isPaused 
      ? "Kích hoạt lại hệ thống chiến đấu?" 
      : "⚠️ LỆNH DỪNG BẮN (CEASEFIRE): Bot sẽ dừng vào lệnh mới để né tin. Xác nhận?";

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      // Xác định ID tài liệu (đề phòng trường hợp userData.id hoặc uid)
      const docId = userData.id || userData.uid;
      const userRef = doc(db, "users", docId);

      await updateDoc(userRef, {
        remoteCommand: newStatus,
        // ĐỒNG BỘ: Gửi tin nhắn chuẩn xuống cho Bot MT5 hiển thị trên HUD
        intelMessage: newStatus === "PAUSE" ? "⚠️ HIGH IMPACT NEWS - PAUSED" : "MARKET STABLE"
      });
    } catch (e) { 
      alert("Lỗi kết nối bộ chỉ huy!"); 
      console.error(e);
    }
    setLoading(false);
  };

  // Nếu bị Admin khóa, hiển thị giao diện khóa
  if (isLockedByAdmin) {
    return (
      <div className="p-6 rounded-[2rem] border-2 bg-red-950/20 border-red-500/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-red-500/20 text-red-500 animate-pulse">
            <Lock size={28} />
          </div>
          <div>
            <h4 className="text-xl font-black tracking-tighter text-red-500">SYSTEM LOCKED</h4>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Quyền điều khiển bị Admin thu hồi</p>
          </div>
        </div>
        <button disabled className="px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-slate-800 text-slate-500 cursor-not-allowed">
          DISABLED
        </button>
      </div>
    );
  }

  // Giao diện điều khiển bình thường
  return (
    <div className={`p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all duration-500 ${isPaused ? 'bg-orange-950/20 border-orange-500/50' : 'bg-green-950/20 border-green-500/50'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${isPaused ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
          {isPaused ? <ZapOff size={28} /> : <Activity size={28} className="animate-pulse" />}
        </div>
        <div>
          <h4 className={`text-xl font-black tracking-tighter ${isPaused ? 'text-orange-500' : 'text-green-500'}`}>
            {isPaused ? "CEASEFIRE (PAUSED)" : "COMBAT READY"}
          </h4>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
            {isPaused ? (
              <span className="flex items-center gap-1"><ShieldAlert size={10}/> ĐANG NÉ TIN TỨC</span>
            ) : (
              "ĐANG QUÉT TÍN HIỆU THỊ TRƯỜNG"
            )}
          </p>
        </div>
      </div>

      <button 
        onClick={handleToggle}
        disabled={loading}
        className={`px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-90 shadow-lg ${
          isPaused 
            ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20 text-white' 
            : 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20 text-white'
        }`}
      >
        {loading ? "PROCESSING..." : (isPaused ? "RESUME" : "PAUSE")}
      </button>
    </div>
  );
};